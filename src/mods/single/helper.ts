import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { ResultInit } from "mods/result/result.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";

export namespace Single {

  export function getStorageKey<D, K>(key: K | undefined, params: QueryParams<D, K>) {
    if (key === undefined)
      return undefined
    if (typeof key === "string")
      return key

    const {
      serializer = DEFAULT_SERIALIZER
    } = params

    return serializer.stringify(key)
  }

  /**
   * Fetch
   * @param key Key (passed to fetcher)
   * @param storageKey Storage key
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param replacePending Should ignore cooldown
   * @returns The new state
   */
  export async function fetch<D, K>(
    core: Core,
    key: K | undefined,
    storageKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D, K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    return await core.lock(storageKey, async () => {
      const current = await core.get(storageKey, params)

      if (key === undefined)
        return current
      if (fetcher === undefined)
        return current

      if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
        return current

      return await core.run<D, K>(storageKey, async () => {

        const timeout = setTimeout(() => {
          aborter.abort("Fetch timed out")
        }, dtimeout)

        try {
          const { signal } = aborter

          const result = await fetcher(key, { signal })

          if (signal.aborted)
            throw new AbortError(signal)

          const {
            time = Date.now(),
            cooldown = Time.fromDelay(dcooldown),
            expiration = Time.fromDelay(dexpiration)
          } = result

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
            cooldown: dcooldown,
            expiration: dexpiration,
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
   * @param storageKey Storage key
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
    storageKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    updater: Updater<D> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D, K> = {},
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

    const current = await core.get(storageKey, params)

    if (key === undefined)
      return current
    if (fetcher === undefined)
      return current
    if (updater === undefined)
      return current

    const uuid = crypto.randomUUID()

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    try {
      const { signal } = aborter

      const generator = updater({ signal })

      let final: ResultInit<D> | void

      while (true) {
        const { done, value } = await generator.next()

        if (signal.aborted)
          throw new AbortError(signal)

        if (done) {
          final = value
          break
        }

        await core.apply<D, K>(storageKey, (previous) => {
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
        const timeout = setTimeout(() => {
          aborter.abort("Fetch timed out")
        }, dtimeout)

        try {
          final = await fetcher(key, { signal, cache: "reload" })
        } finally {
          clearTimeout(timeout)
        }
      }

      if (signal.aborted)
        throw new AbortError(signal)

      const result = final

      const {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if ("error" in result)
        throw result.error

      return await core.apply(storageKey, () => ({
        data: result.data,
        realData: result.data,
        error: undefined,
        time: time,
        realTime: time,
        cooldown: cooldown,
        expiration: expiration
      }), params, { action: "unset", uuid })
    } catch (error: unknown) {
      await core.apply(storageKey, (previous) => ({
        data: previous?.realData,
        time: previous?.realTime,
        cooldown: dcooldown,
        expiration: dexpiration
      }), params, { action: "unset", uuid })

      throw error
    }
  }
}