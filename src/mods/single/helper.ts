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
    fetcher: Fetcher<D, K>,
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

    const count = (current?.count ?? 0) + 1

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      current = await this.core.apply(skey, current, { count, aborter }, params)

      const {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(key, { signal })

      if (signal.aborted)
        throw new AbortError(signal)

      return await this.core.mutate<D, E>(skey, { count, data, cooldown, expiration }, params)
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.mutate<D, E>(skey, { count, error, cooldown, expiration }, params)
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
    poster: Poster<D, K>,
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

    const count = (current?.count ?? 0) + 1

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      const time = current?.time
      const error = current?.error

      await this.core.apply(skey, current, { count, time, data: updated, error, aborter, optimistic: true }, params)

      const {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await poster(key, { data: updated, signal })

      if (signal.aborted)
        throw new AbortError(signal)

      return await this.core.mutate<D, E>(skey, { count, data, cooldown, expiration }, params)
    } catch (error: any) {
      const time = current?.time
      const data = current?.data

      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.mutate<D, E>(skey, { count, time, data, error, cooldown, expiration }, params)
    } finally {
      clearTimeout(timeout)
    }
  }
}