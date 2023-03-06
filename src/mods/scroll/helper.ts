import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_SERIALIZER, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Params } from "mods/types/params.js";
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

  export function getStorageKey<D, K>(key: K | undefined, params: Params<D, K>) {
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
    params: Params<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (storageKey === undefined)
      return

    const {
      equals = DEFAULT_EQUALS,
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const skipable = await core.lock(storageKey, async () => {
      let current = await core.get(storageKey, params)

      if (current?.optimistic)
        return { skip: true, current }

      if (current?.aborter) {
        if (replacePending)
          current.aborter.abort("Replaced")
        else
          return { skip: true, current }
      }

      if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
        return { skip: true, current }

      const first = scroller(undefined)

      if (first === undefined)
        return { skip: true, current }

      const pending: State<D[]> = {
        time: current?.time,
        aborter: aborter
      }

      current = await core.mutate(storageKey, current, () => pending, params)

      return { skip: false, current, first }
    }) as Skipable<D[], K>

    if (skipable.skip)
      return skipable.current

    let current = skipable.current

    const timeout = setTimeout(() => {
      aborter.abort("First timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const result = await fetcher(skipable.key, { signal })

      const {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(storageKey, params)

      const state: State<D[]> = {}

      if ("data" in result) {
        state.data = [result.data]
        state.error = undefined
      } else {
        state.error = result.error
      }

      if ("data" in result) {
        const norm = await core.normalize(true, { data: [result.data] }, params)
        if (equals(norm?.[0], current?.data?.[0])) delete state.data
      }

      return await core.mutate(storageKey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: unknown) {
      current = await core.get(storageKey, params)

      if (current?.aborter !== aborter)
        return current
      return await core.mutate(storageKey, current,
        () => ({ aborter: undefined, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
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
    params: Params<D[], K> = {},
    replacePending = false,
    ignoreCooldown = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (storageKey === undefined)
      return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const skipable = await core.lock(storageKey, async () => {
      let current = await core.get(storageKey, params)

      if (current?.optimistic)
        return { skip: true, current }

      if (current?.aborter) {
        if (replacePending) {
          current.aborter.abort("Replaced")
        } else {
          return { skip: true, current }
        }
      }

      if (Time.isAfterNow(current?.cooldown) && !ignoreCooldown)
        return { skip: true, current }

      const pages = current?.data ?? []
      const last = scroller(Arrays.lastOf(pages))

      if (last === undefined)
        return { skip: true, current }

      const pending: State<D[]> = {
        time: current?.time,
        aborter: aborter
      }

      current = await core.mutate(storageKey, current, () => pending, params)

      return { skip: false, current, last }
    }) as Skipable<D[], K>

    if (skipable.skip)
      return skipable.current

    let current = skipable.current

    const timeout = setTimeout(() => {
      aborter.abort("Scroll timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const result = await fetcher(skipable.key, { signal })

      let {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      if (expiration !== undefined && current?.expiration !== undefined)
        expiration = Math.min(expiration, current?.expiration)

      current = await core.get(storageKey, params)

      const state: State<D[]> = {
        time: time,
        cooldown: cooldown,
        expiration: expiration,
        aborter: undefined
      }

      if ("data" in result) {
        state.data = [...(current?.data ?? []), result.data]
        state.error = undefined
      } else {
        state.error = result.error
      }

      return await core.mutate(storageKey, current, () => state, params)
    } catch (error: unknown) {
      current = await core.get(storageKey, params)

      if (current?.aborter !== aborter)
        return current

      const state: State<D[]> = {
        error: error,
        aborter: undefined
      }

      return await core.mutate(storageKey, current, () => state, params)
    } finally {
      clearTimeout(timeout)
    }
  }
}