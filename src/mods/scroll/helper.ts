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
   * @param skey Storage key
   * @param scroller Key scroller
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param force Should ignore cooldown
   * @returns The new state
   */
  export async function first<D, K>(
    core: Core,
    scroller: Scroller<D, K> | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D[], K> = {},
    force = false,
    ignore = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (skey === undefined)
      return

    let { current, skip, first } = await core.lock(skey, async () => {
      let current = await core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter && !force)
        return { current, skip: true }
      if (current?.aborter && force)
        current.aborter.abort("Replaced")

      if (Time.isAfterNow(current?.cooldown) && !ignore)
        return { current, skip: true }

      const first = scroller(undefined)

      if (first === undefined)
        return { current, skip: true }

      current = await core.mutate(skey, current,
        c => ({ time: c?.time, aborter }),
        params)
      return { current, first }
    })

    if (skip)
      return current
    if (first === undefined)
      throw new Error("Undefined first")

    const {
      equals = DEFAULT_EQUALS,
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const timeout = setTimeout(() => {
      aborter.abort("First timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const result = await fetcher(first, { signal })

      const {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      current = await core.get(skey, params)

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

      return await core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await core.mutate(skey, current,
        () => ({ aborter: undefined, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Scroll to the next page
   * @param skey Storage key
   * @param scroller Key scroller
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param force Should ignore cooldown
   * @returns The new state
   */
  export async function scroll<D, K>(
    core: Core,
    scroller: Scroller<D, K> | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D[], K> = {},
    force = false,
    ignore = false
  ): Promise<State<D[]> | undefined> {
    if (scroller === undefined)
      return
    if (skey === undefined)
      return

    let { current, skip, last } = await core.lock(skey, async () => {
      let current = await core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter && !force)
        return { current, skip: true }
      if (current?.aborter && force)
        current.aborter.abort("Replaced")

      if (Time.isAfterNow(current?.cooldown) && !ignore)
        return { current, skip: true }

      const pages = current?.data ?? []
      const last = scroller(Arrays.lastOf(pages))

      if (last === undefined)
        return { current, skip: true }

      current = await core.mutate(skey, current,
        c => ({ time: c?.time, aborter }),
        params)
      return { current, last }
    })

    if (skip)
      return current
    if (last === undefined)
      throw new Error("Undefined last")

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const timeout = setTimeout(() => {
      aborter.abort("Scroll timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const result = await fetcher(last, { signal })

      let {
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = result

      if (signal.aborted)
        throw new AbortError(signal)

      if (expiration !== undefined && current?.expiration !== undefined)
        expiration = Math.min(expiration, current?.expiration)

      current = await core.get(skey, params)

      const state: State<D[]> = {}

      if ("data" in result) {
        state.data = [...(current?.data ?? []), result.data]
        state.error = undefined
      } else {
        state.error = result.error
      }

      return await core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: unknown) {
      current = await core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await core.mutate(skey, current,
        () => ({ aborter: undefined, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
  }
}