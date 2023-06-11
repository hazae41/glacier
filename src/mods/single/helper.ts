import { Option } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { State, TimesInit } from "index.js";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { Updater } from "mods/types/updater.js";

export namespace Simple {

  export function getCacheKey<D, K>(key: K, params: QueryParams<D, K>) {
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
  export async function fetchOrError<D, K>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<D, K>, aborter: AbortController, params: QueryParams<D, K>): Promise<Result<State<D>, AbortedError | CooldownError>> {
    const previous = await core.get(cacheKey, params)

    if (Time.isAfterNow(previous.real?.current.cooldown))
      return new Err(new CooldownError())

    const aborted = await core.catchAndTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = aborted.get().setTimes(times)

    return new Ok(await core.mutate(cacheKey, () => timed, params))
  }

  export async function fetchOrWait<D, K>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<D, K>, aborter: AbortController, params: QueryParams<D, K>): Promise<Result<State<D>, AbortedError>> {
    const previous = await core.get(cacheKey, params)

    const cooldown = Option
      .from(previous.real?.current.cooldown)
      .mapSync(Time.toDelay)
      .filterSync(x => x > 0)

    if (cooldown.isSome())
      await new Promise(ok => setTimeout(ok, cooldown.get()))

    const aborted = await core.catchAndTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = aborted.get().setTimes(times)

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
    aborter: AbortController,
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
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = aborted.get().setTimes(times)

    return new Ok(await core.mutate(cacheKey, () => timed, params))
  }
}