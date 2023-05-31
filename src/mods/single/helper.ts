import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { FetchedInit } from "mods/result/fetched.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { FullState } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Single {

  export function getCacheKey<D, K>(key: K | undefined, params: QueryParams<D, K>) {
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
   * Fetch
   * @param key Key (passed to fetcher)
   * @param cacheKey Storage key
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param replacePending Should ignore cooldown
   * @returns The new state
   */
  export async function fetch<D, K>(
    core: Core,
    key: K | undefined,
    cacheKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D, K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<FullState<D> | undefined> {
    if (cacheKey === undefined)
      return

    return await core.lock(cacheKey, async () => {
      const current = await core.get(cacheKey, params)

      if (key === undefined)
        return current
      if (fetcher === undefined)
        return current

      if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
        return current

      return await core.run<D, K>(cacheKey, async () => {

        const timeout = params.timeout !== undefined ? setTimeout(() => {
          aborter.abort("Fetch timed out")
        }, params.timeout) : undefined

        try {
          const { signal } = aborter

          const result = await fetcher(key, { signal })

          result.ignore?.()

          if (signal.aborted)
            throw new AbortError(signal)

          const time = "time" in result
            ? result.time
            : Date.now()

          const cooldown = "cooldown" in result
            ? result.cooldown
            : Time.fromDelay(params.cooldown)

          const expiration = "expiration" in result
            ? result.expiration
            : Time.fromDelay(params.expiration)

          if ("error" in result)
            return () => ({
              error: result.error,
              time: time,
              cooldown: cooldown,
              expiration: expiration,
            })

          return () => ({
            data: result.data,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
          })
        } catch (error: unknown) {
          return () => ({
            error: error,
            cooldown: params.cooldown,
            expiration: params.expiration,
          })
        } finally {
          clearTimeout(timeout)
        }
      }, aborter, params)
    }, aborter, replacePending)
  }

  /**
   * Optimistic update
   * @param key Key (:K) (passed to poster)
   * @param cacheKey Storage key
   * @param fetcher Resource poster
   * @param updater Mutation function
   * @param aborter AbortController
   * @param tparams Time parameters
   * @returns The new state
   * @throws Error
   */
  export async function update<D, K>(
    core: Core,
    key: K | undefined,
    cacheKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    updater: Updater<D> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D, K> = {},
  ): Promise<FullState<D> | undefined> {
    if (cacheKey === undefined)
      return

    const current = await core.get(cacheKey, params)

    if (key === undefined)
      return current
    if (fetcher === undefined)
      return current
    if (updater === undefined)
      return current

    const uuid = crypto.randomUUID()

    try {
      const { signal } = aborter

      const generator = updater({ signal })

      let final: FetchedInit<D> | void

      while (true) {
        const { done, value } = await generator.next()

        if (signal.aborted)
          throw new AbortError(signal)

        if (done) {
          final = value
          break
        }

        await core.apply<D, K>(cacheKey, (previous) => {
          const result = value(previous)

          // if ("error" in result)
          //   return {
          //     error: result.error,
          //     optimistic: optimistic
          //   }

          return {
            data: result.data,
            error: undefined
          }
        }, params, { action: "set", uuid })
      }

      if (final === undefined) {

        const timeout = params.timeout !== undefined ? setTimeout(() => {
          aborter.abort("Fetch timed out")
        }, params.timeout) : undefined

        try {
          final = await fetcher(key, { signal, cache: "reload" })
        } finally {
          clearTimeout(timeout)
        }
      }

      const result = final

      result.ignore?.()

      if (signal.aborted)
        throw new AbortError(signal)

      if ("error" in result)
        throw result.error

      const time = "time" in result
        ? result.time
        : Date.now()

      const cooldown = "cooldown" in result
        ? result.cooldown
        : Time.fromDelay(params.cooldown)

      const expiration = "expiration" in result
        ? result.expiration
        : Time.fromDelay(params.expiration)

      return await core.apply(cacheKey, () => ({
        data: result.data,
        error: undefined,
        time: time,
        cooldown: cooldown,
        expiration: expiration
      }), params, { action: "unset", uuid })
    } catch (error: unknown) {
      await core.apply(cacheKey, (previous) => previous && ({
        data: previous.realData,
        time: previous.realTime
      }), params, { action: "unset", uuid })

      throw error
    }
  }
}