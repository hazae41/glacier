import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { Core } from "mods/core/core.js";
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "mods/defaults.js";
import { AbortError } from "mods/errors/abort.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Params } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";

export class ScrollHelper {
  constructor(readonly core: Core) { }

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
  async first<D, K>(
    skey: string | undefined,
    scroller: Scroller<D, K>,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D[], K> = {},
    force = false,
    ignore = false
  ): Promise<State<D[]> | undefined> {
    if (skey === undefined) return

    let { current, skip, first } = await this.core.lock(skey, async () => {
      let current = await this.core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter && !force)
        return { current, skip: true }
      if (current?.aborter && force)
        current.aborter.abort("Replaced")

      if (this.core.shouldCooldown(current) && !ignore)
        return { current, skip: true }

      const first = scroller(undefined)

      if (first === undefined)
        return { current, skip: true }

      current = await this.core.mutate(skey, current,
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

      const {
        data,
        error,
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = await fetcher(first, { signal })

      if (signal.aborted)
        throw new AbortError(signal)

      current = await this.core.get(skey, params)

      const state: State<D[]> = {}

      if (data !== undefined)
        state.data = [data]
      state.error = error

      if (data !== undefined) {
        const norm = await this.core.normalize(true, { data: [data] }, params)
        if (equals(norm?.[0], current?.data?.[0])) delete state.data
      }

      return await this.core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: any) {
      current = await this.core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await this.core.mutate(skey, current,
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
  async scroll<D, K>(
    skey: string | undefined,
    scroller: Scroller<D, K>,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D[], K> = {},
    force = false,
    ignore = false
  ): Promise<State<D[]> | undefined> {
    if (skey === undefined) return

    let { current, skip, last } = await this.core.lock(skey, async () => {
      let current = await this.core.get(skey, params)

      if (current?.optimistic)
        return { current, skip: true }
      if (current?.aborter && !force)
        return { current, skip: true }
      if (current?.aborter && force)
        current.aborter.abort("Replaced")

      if (this.core.shouldCooldown(current) && !ignore)
        return { current, skip: true }

      const pages = current?.data ?? []
      const last = scroller(Arrays.lastOf(pages))

      if (last === undefined)
        return { current, skip: true }

      current = await this.core.mutate(skey, current,
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

      let {
        data,
        error,
        time = Date.now(),
        cooldown = Time.fromDelay(dcooldown),
        expiration = Time.fromDelay(dexpiration)
      } = await fetcher(last, { signal })

      if (signal.aborted)
        throw new AbortError(signal)

      if (expiration !== undefined && current?.expiration !== undefined)
        expiration = Math.min(expiration, current?.expiration)

      current = await this.core.get(skey, params)

      const state: State<D[]> = {}

      if (data !== undefined)
        state.data = [...(current?.data ?? []), data]
      state.error = error

      return await this.core.mutate(skey, current,
        () => ({ time, cooldown, expiration, aborter: undefined, ...state }),
        params)
    } catch (error: any) {
      current = await this.core.get(skey, params)

      if (current?.aborter !== aborter)
        return current
      return await this.core.mutate(skey, current,
        () => ({ aborter: undefined, error }),
        params)
    } finally {
      clearTimeout(timeout)
    }
  }
}