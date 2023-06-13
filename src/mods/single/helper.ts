import { Option, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Simple {

  export function getCacheKey<K, D, F>(key: K, settings: QuerySettings<K, D, F>) {
    if (typeof key === "string")
      return key

    const { keySerializer = DEFAULT_SERIALIZER } = settings

    return keySerializer.stringify(key)
  }

  export async function fetch<K, D, F>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, AbortedError>> {
    const aborted = await core.catchAndTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, settings.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), settings)
    const timed = Fetched.from(aborted.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, () => new Some(timed), settings))
  }

  /**
   * Unlocked fetch
   * @param core 
   * @param key 
   * @param cacheKey 
   * @param fetcher 
   * @param aborter 
   * @param settings 
   * @returns 
   */
  export async function fetchOrError<K, D, F>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, AbortedError | CooldownError>> {
    const previous = await core.get(cacheKey, settings)

    if (Time.isAfterNow(previous.real?.current.cooldown))
      return new Err(new CooldownError())

    return await fetch(core, key, cacheKey, fetcher, aborter, settings)
  }

  export async function fetchOrWait<K, D, F>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, AbortedError>> {
    const previous = await core.get(cacheKey, settings)

    const cooldown = Option
      .from(previous.real?.current.cooldown)
      .mapSync(Time.toDelay)
      .filterSync(x => x > 0)

    if (cooldown.isSome())
      await new Promise(ok => setTimeout(ok, cooldown.get()))

    return await fetch(core, key, cacheKey, fetcher, aborter, settings)
  }

  /**
   * Optimistic update
   * @param core 
   * @param key 
   * @param cacheKey 
   * @param fetcher 
   * @param updater 
   * @param settings 
   * @returns 
   */
  export async function update<K, D, F>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    updater: Updater<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, AbortedError>> {
    const uuid = crypto.randomUUID()

    try {
      const generator = updater()

      let result = await generator.next()

      for (; !result.done; result = await generator.next())
        await core.optimize(cacheKey, uuid, result.value, settings)

      const fetcher2 = result.value ?? fetcher

      const aborted = await core.catchAndTimeout(async (signal) => {
        return await fetcher2(key, { signal, cache: "reload" })
      }, aborter, settings.timeout)

      core.deoptimize(cacheKey, uuid, settings)

      if (aborted.isErr())
        return aborted

      const times = TimesInit.merge(aborted.get(), settings)
      const timed = Fetched.from(aborted.get()).setTimes(times)

      return new Ok(await core.mutate(cacheKey, () => new Some(timed), settings))
    } catch (e: unknown) {
      core.deoptimize(cacheKey, uuid, settings)
      throw e
    }
  }
}