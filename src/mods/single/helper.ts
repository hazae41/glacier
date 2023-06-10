import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Fetched, State, TimesInit } from "index.js";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { Updater } from "mods/types/updater.js";

export namespace Single {

  export function getCacheKey<D, K>(key: Optional<K>, params: QueryParams<D, K>) {
    if (key === undefined)
      return undefined
    if (typeof key === "string")
      return key

    const {
      keySerializer = DEFAULT_SERIALIZER
    } = params

    return keySerializer.stringify(key)
  }

  /**
   * Unlocked fetch
   * @param core 
   * @param key 
   * @param cacheKey 
   * @param fetcher 
   * @param aborter 
   * @param params 
   * @returns 
   */
  export async function fetch<D, K>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<D, K>, aborter: AbortController, params: QueryParams<D, K>): Promise<Result<State<D>, AbortedError>> {
    const previous = await core.get(cacheKey, params)

    if (Time.isAfterNow(previous.real?.cooldown))
      return new Err(AbortedError.from(new CooldownError()))

    const aborted = await core.catchAndTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = Fetched.rewrap(aborted.get(), times)

    return new Ok(await core.mutate(cacheKey, () => timed, params))
  }


  /**
   * Optimistic update
   * @param core 
   * @param key 
   * @param cacheKey 
   * @param fetcher 
   * @param updater 
   * @param params 
   * @returns 
   */
  export async function update<D, K>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<D, K>,
    updater: Updater<D>,
    params: QueryParams<D, K>
  ): Promise<Result<State<D>, AbortedError>> {
    const uuid = crypto.randomUUID()

    const generator = updater()

    let result = await generator.next()

    for (; !result.done; result = await generator.next())
      await core.optimize<D, K>(cacheKey, uuid, result.value, params)

    const fetcher2 = result.value ?? fetcher

    const aborted = await core.catchAndTimeout(async (signal) => {
      return await fetcher2(key, { signal, cache: "reload" })
    }, new AbortController(), params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = Fetched.rewrap(aborted.get(), times)

    return new Ok(await core.mutate(cacheKey, () => timed, params))
  }
}