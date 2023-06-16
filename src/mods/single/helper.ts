import { Some } from "@hazae41/option";
import { Ok, Result } from "@hazae41/result";
import { Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { FetchError, Fetcher } from "mods/types/fetcher.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Simple {

  export async function getCacheKey<K, D, F>(key: K, settings: QuerySettings<K, D, F>) {
    if (typeof key === "string")
      return key

    const { keySerializer = DEFAULT_SERIALIZER } = settings

    return await keySerializer.stringify(key)
  }

  export async function fetch<K, D, F>(
    core: Core,
    key: K,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, FetchError>> {
    const aborted = await core.runWithTimeout(async signal => {
      return await fetcher(key, { signal })
    }, aborter, settings.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), settings)
    const timed = Fetched.from(aborted.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, () => new Some(timed), settings))
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
  ): Promise<Result<State<D, F>, FetchError>> {
    const uuid = crypto.randomUUID()

    try {
      const generator = updater()

      let result = await generator.next()

      for (; !result.done; result = await generator.next())
        await core.optimize(cacheKey, uuid, result.value, settings)

      const fetcher2 = result.value ?? fetcher

      const aborted = await core.runWithTimeout(async (signal) => {
        return await fetcher2(key, { signal, cache: "reload" })
      }, aborter, settings.timeout)

      if (aborted.isErr()) {
        core.deoptimize(cacheKey, uuid)
        core.reoptimize(cacheKey, settings)
        return aborted
      }

      core.deoptimize(cacheKey, uuid)

      const times = TimesInit.merge(aborted.get(), settings)
      const timed = Fetched.from(aborted.get()).setTimes(times)

      return new Ok(await core.mutate(cacheKey, () => new Some(timed), settings))
    } catch (e: unknown) {
      core.deoptimize(cacheKey, uuid)
      core.reoptimize(cacheKey, settings)
      throw e
    }
  }
}