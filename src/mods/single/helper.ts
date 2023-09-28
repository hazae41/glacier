import { Some } from "@hazae41/option";
import { Ok, Result } from "@hazae41/result";
import { core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { FetcherfulQuerySettings, QuerySettings } from "mods/types/settings.js";
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
    cacheKey: string,
    aborter: AbortController,
    settings: FetcherfulQuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, Error>> {
    const result = await core.runWithTimeout(async signal => {
      return await settings.fetcher(settings.key, { signal })
    }, aborter, settings.timeout)

    if (result.isErr())
      return result

    const times = TimesInit.merge(result.get(), settings)
    const timed = Fetched.from(result.get()).setTimes(times)

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
    cacheKey: string,
    updater: Updater<K, D, F>,
    aborter: AbortController,
    settings: FetcherfulQuerySettings<K, D, F>
  ): Promise<Result<State<D, F>, Error>> {
    const uuid = crypto.randomUUID()

    try {
      const generator = updater()

      let next = await generator.next()

      for (; !next.done; next = await generator.next())
        await core.optimize(cacheKey, uuid, next.value, settings)

      const fetcher = next.value ?? settings.fetcher

      const result = await core.runWithTimeout(async (signal) => {
        return await fetcher(settings.key, { signal, cache: "reload" })
      }, aborter, settings.timeout)

      if (result.isErr()) {
        core.deoptimize(cacheKey, uuid)
        core.reoptimize(cacheKey, settings)
        return result
      }

      core.deoptimize(cacheKey, uuid)

      const times = TimesInit.merge(result.get(), settings)
      const timed = Fetched.from(result.get()).setTimes(times)

      return new Ok(await core.mutate(cacheKey, () => new Some(timed), settings))
    } catch (e: unknown) {
      core.deoptimize(cacheKey, uuid)
      core.reoptimize(cacheKey, settings)
      throw e
    }
  }
}