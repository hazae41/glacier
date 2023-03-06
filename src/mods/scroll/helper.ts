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

  type Skipable<D, K> =
    | Skiped<D>
    | Unskiped<D, K>

  interface Unskiped<D, K> {
    skip?: false,
    current?: State<D>
    key: K
  }

  interface Skiped<D> {
    skip: true,
    current?: State<D>
  }

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
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: QueryParams<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (storageKey === undefined)
      return

    let current = await core.get(storageKey, params)

    if (current?.optimistic)
      return current

    if (current?.aborter)
      if (replacePending)
        current.aborter.abort("Replaced")
      else
        return current

    if (Time.isAfterNow(current?.cooldown))
      if (!ignoreCooldown)
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


    await core.lock(storageKey, async () => {

      const timeout = setTimeout(() => {
        aborter.abort("First timed out")
      }, dtimeout)

      current = await core.get(storageKey, params)

      current = await core.apply(storageKey, current, {
        aborter: aborter
      }, params)

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

        if ("error" in result) {
          return await core.apply(storageKey, current, {
            error: result.error,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
            aborter: undefined
          }, params)
        } else {
          const state: State<D[]> = {
            data: [result.data],
            error: undefined,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
            aborter: undefined
          }

          const normalized = await core.normalize(true, { data: [result.data] }, params)

          if (equals(normalized?.[0], current?.data?.[0]))
            state.data = current?.data

          return await core.apply(storageKey, current, state, params)
        }
      } catch (error: unknown) {
        return await core.apply(storageKey, current, {
          error: error,
          time: Date.now(),
          aborter: undefined
        }, params)
      } finally {
        clearTimeout(timeout)
      }
    })
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
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: QueryParams<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (storageKey === undefined)
      return

    let current = await core.get(storageKey, params)

    if (current?.optimistic)
      return current

    if (current?.aborter)
      if (replacePending)
        current.aborter.abort("Replaced")
      else
        return current

    if (Time.isAfterNow(current?.cooldown))
      if (!ignoreCooldown)
        return current

    const previouses = current?.data ?? []
    const previous = Arrays.lastOf(previouses)
    const key = scroller(previous)

    if (key === undefined)
      return current

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    await core.lock(storageKey, async () => {

      const timeout = setTimeout(() => {
        aborter.abort("Scroll timed out")
      }, dtimeout)

      current = await core.get(storageKey, params)

      current = await core.apply(storageKey, current, {
        aborter: aborter
      }, params)

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

        if ("data" in result) {
          const previouses = current?.data ?? []

          return await core.apply(storageKey, current, {
            data: [...previouses, result.data],
            error: undefined,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
            aborter: undefined
          }, params)
        } else {
          return await core.apply(storageKey, current, {
            error: result.error,
            time: time,
            cooldown: cooldown,
            expiration: expiration,
            aborter: undefined
          }, params)
        }
      } catch (error: unknown) {
        return await core.apply(storageKey, current, {
          error: error,
          time: Date.now(),
          aborter: undefined
        }, params)
      } finally {
        clearTimeout(timeout)
      }
    })
  }
}