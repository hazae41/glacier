import { AbortSignals } from "libs/signals/index.js";
import { core } from "mods/core/core.js";
import { FetcherfulQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Simple {

  export function getCacheKey<K>(key: K) {
    if (typeof key === "string")
      return key
    return JSON.stringify(key)
  }

  export async function fetchOrThrow<K, D, F>(
    cacheKey: string,
    presignal: AbortSignal,
    settings: FetcherfulQuerySettings<K, D, F>
  ): Promise<State<D, F>> {
    const signal = AbortSignal.any([presignal, AbortSignals.timeoutOrNever(settings.timeout)])
    const fetched = await settings.fetcher(settings.key, { signal })

    return await core.replaceOrThrow(cacheKey, fetched, settings)
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
  export async function updateOrThrow<K, D, F>(
    cacheKey: string,
    updater: Updater<K, D, F>,
    presignal: AbortSignal,
    settings: FetcherfulQuerySettings<K, D, F>
  ): Promise<State<D, F>> {
    const uuid = crypto.randomUUID()

    try {
      const generator = updater()

      let next = await generator.next()

      for (; !next.done; next = await generator.next())
        await core.optimizeOrThrow(cacheKey, uuid, next.value, settings)

      const fetcher = next.value ?? settings.fetcher

      const signal = AbortSignal.any([presignal, AbortSignals.timeoutOrNever(settings.timeout)])
      const fetched = await fetcher(settings.key, { signal, cache: "reload" })

      core.deoptimize(cacheKey, uuid)

      return await core.replaceOrThrow(cacheKey, fetched, settings)
    } catch (e: unknown) {
      core.deoptimize(cacheKey, uuid)
      core.reoptimizeOrThrow(cacheKey, settings)
      throw e
    }
  }
}