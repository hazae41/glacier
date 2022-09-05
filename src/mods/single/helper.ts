import { getTimeFromDelay } from "libs/time";
import { Core } from "mods/core";
import { AbortError } from "mods/errors";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_COOLDOWN, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "mods/utils/defaults";

export class SingleHelper {
  constructor(readonly core: Core) { }

  /**
   * Fetch
   * @param key Key (passed to fetcher)
   * @param skey Storage key
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param force Should ignore cooldown
   * @returns The new state
   */
  async fetch<D = any, E = any, K = any>(
    key: K | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, E, K>,
    aborter = new AbortController(),
    params: Params<D, E> = {},
    force = false
  ): Promise<State<D, E> | undefined> {
    if (key === undefined) return
    if (skey === undefined) return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    let current = await this.core.get<D, E>(skey, params)

    if (current?.aborter && !force)
      return current
    if (current?.aborter && current?.optimistic)
      return current
    if (current?.aborter)
      current.aborter.abort("Replaced")
    if (this.core.shouldCooldown(current, force))
      return current

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    const state: State<D, E> = {}

    try {
      const { signal } = aborter

      current = await this.core.apply(skey, current, { time: current?.time, aborter }, params)

      const {
        data,
        error,
        time = Date.now(),
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(key, { signal })

      if (signal.aborted)
        throw new AbortError(signal)

      current = await this.core.get(skey, params)

      if (data !== undefined)
        state.data = data
      state.error = error

      return await this.core.apply<D, E>(skey, current, { time, cooldown, expiration, ...state }, params, aborter)
    } catch (error: any) {
      return await this.core.mutate<D, E>(skey, { error }, params, aborter)
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Optimistic update
   * @param key Key (:K) (passed to poster)
   * @param skey Storage key
   * @param poster Resource poster
   * @param updater Mutation function
   * @param aborter AbortController
   * @param tparams Time parameters
   * @returns The new state
   * @throws Error
   */
  async update<D = any, E = any, K = any>(
    key: K | undefined,
    skey: string | undefined,
    poster: Poster<D, E, K>,
    updater: Updater<D>,
    aborter = new AbortController(),
    params: Params<D, E> = {},
  ) {
    if (key === undefined) return
    if (skey === undefined) return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    const current = await this.core.get<D, E>(skey, params)

    if (current?.aborter && current?.optimistic)
      return current
    if (current?.aborter)
      current.aborter.abort("Replaced")

    const updated = updater(current?.data)

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      {
        const data = updated
        const time = current?.time
        const optimistic = true

        await this.core.apply(skey, current, { time, data, aborter, optimistic }, params)
      }

      const {
        data,
        error,
        time = Date.now(),
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await poster(key, { data: updated, signal })

      if (signal.aborted)
        throw new AbortError(signal)

      if (error !== undefined) {
        const time = current?.time
        const data = current?.data

        return await this.core.mutate<D, E>(skey, { time, cooldown, expiration, data, error }, params, aborter)
      }

      const state: State<D, E> = {}

      if (data !== undefined)
        state.data = data
      state.error = error

      return await this.core.mutate<D, E>(skey, { time, cooldown, expiration, ...state }, params, aborter)
    } catch (error: any) {
      const time = current?.time
      const data = current?.data

      return await this.core.mutate<D, E>(skey, { time, data, error }, params, aborter)
    } finally {
      clearTimeout(timeout)
    }
  }
}