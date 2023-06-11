import { Option, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { State } from "mods/types/state.js";
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

  export async function fetch<D, K>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<D, K>, aborter: AbortController, params: QueryParams<D, K>): Promise<Result<State<D>, AbortedError>> {
    const aborted = await core.catchAndTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = Fetched.from(aborted.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, () => new Some(timed), params))
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

    return await fetch(core, key, cacheKey, fetcher, aborter, params)
  }

  export async function fetchOrWait<D, K>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<D, K>, aborter: AbortController, params: QueryParams<D, K>): Promise<Result<State<D>, AbortedError>> {
    const previous = await core.get(cacheKey, params)

    const cooldown = Option
      .from(previous.real?.current.cooldown)
      .mapSync(Time.toDelay)
      .filterSync(x => x > 0)

    if (cooldown.isSome())
      await new Promise(ok => setTimeout(ok, cooldown.get()))

    return await fetch(core, key, cacheKey, fetcher, aborter, params)
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
    updater: Updater<D, K>,
    aborter: AbortController,
    params: QueryParams<D, K>
  ): Promise<Result<State<D>, AbortedError>> {
    const uuid = crypto.randomUUID()

    try {
      const generator = updater()

      let result = await generator.next()

      for (; !result.done; result = await generator.next())
        await core.optimize<D, K>(cacheKey, uuid, result.value, params)

      const fetcher2 = result.value ?? fetcher

      const aborted = await core.catchAndTimeout(async (signal) => {
        return await fetcher2(key, { signal, cache: "reload" })
      }, aborter, params.timeout)

      core.deoptimize(cacheKey, uuid, params)

      if (aborted.isErr())
        return aborted

      const times = TimesInit.merge(aborted.get(), params)
      const timed = Fetched.from(aborted.get()).setTimes(times)

      return new Ok(await core.mutate(cacheKey, () => new Some(timed), params))
    } catch (e: unknown) {
      core.deoptimize(cacheKey, uuid, params)
      throw e
    }
  }
}