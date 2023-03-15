import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";

export namespace Scroll {

  export function getStorageKey<D, K>(key: K | undefined, params: QueryParams<D, K>) {
    if (key === undefined)
      return undefined
    if (typeof key === "string")
      return key

    const {
      serializer = DEFAULT_SERIALIZER
    } = params

    return `scroll:${serializer.stringify(key)}`
  }

  /**
   * Fetch first page
   * @param storageKey Storage key
   * @param scroller Key scroller
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param replacePending Should replace pending request
   * @param ignoreCooldown Should ignore cooldown
   * @returns The new state
   */
  export async function first<D, K>(
    core: Core,
    scroller: Scroller<D, K> | undefined,
    storageKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (storageKey === undefined)
      return

    const current = await core.get(storageKey, params)

    if (scroller === undefined)
      return current
    if (fetcher === undefined)
      return current

    if (current?.aborter)
      if (replacePending)
        current.aborter.abort("Replaced")
      else
        return current

    if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
      return current

    const key = scroller(undefined)

    if (key === undefined)
      return current

    const {
      equals = DEFAULT_EQUALS,
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    await core.lock<D[], K>(storageKey, async () => {

      const timeout = setTimeout(() => {
        aborter.abort("First timed out")
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

        return async (previous) => {
          const state: State<D[]> = {
            data: [result.data],
            error: undefined,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
          }

          const normalized = await core.normalize(true, { data: [result.data] }, params)

          if (equals(normalized?.[0], current?.data?.[0]))
            state.data = current?.data

          return state
        }
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
  }

  /**
   * Scroll to the next page
   * @param storageKey Storage key
   * @param scroller Key scroller
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param replacePending Should ignore cooldown
   * @returns The new state
   */
  export async function scroll<D, K>(
    core: Core,
    scroller: Scroller<D, K> | undefined,
    storageKey: string | undefined,
    fetcher: Fetcher<D, K> | undefined,
    aborter = new AbortController(),
    params: QueryParams<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (storageKey === undefined)
      return

    const current = await core.get(storageKey, params)

    if (scroller === undefined)
      return current
    if (fetcher === undefined)
      return current

    if (current?.aborter)
      if (replacePending)
        current.aborter.abort("Replaced")
      else
        return current

    if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
      return current

    const previouses = current?.data ?? []
    const previous = Arrays.last(previouses)
    const key = scroller(previous)

    if (key === undefined)
      return current

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    await core.lock<D[], K>(storageKey, async () => {

      const timeout = setTimeout(() => {
        aborter.abort("Scroll timed out")
      }, dtimeout)

      try {
        const { signal } = aborter

        const result = await fetcher(key, { signal })

        if (signal.aborted)
          throw new AbortError(signal)

        let {
          time = Date.now(),
          cooldown = Time.fromDelay(dcooldown),
          expiration = Time.fromDelay(dexpiration)
        } = result

        if (expiration !== undefined && current?.expiration !== undefined)
          expiration = Math.min(expiration, current?.expiration)

        if ("error" in result)
          return () => ({
            error: result.error,
            time: time,
            cooldown: cooldown,
            expiration: expiration
          })

        return (previous) => ({
          data: [...(previous?.data ?? []), result.data],
          error: undefined,
          time: time,
          cooldown: cooldown,
          expiration: expiration
        })
      } catch (error: unknown) {
        return () => ({
          error: error,
          cooldown: dcooldown,
          expiration: dexpiration
        })
      } finally {
        clearTimeout(timeout)
      }
    }, aborter, params)
  }
}