import { Core, Fetcher, Poster, Updater } from "./core.js";
import { State } from "./storages/storage.js";
import { getTimeFromDelay, TimeParams } from "./time.js";

export class Single {
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
    tparams: TimeParams = {},
    force = false
  ): Promise<State<D, E> | undefined> {
    if (key === undefined) return
    if (skey === undefined) return

    const {
      cooldown: dcooldown = this.core.cooldown,
      expiration: dexpiration = this.core.expiration,
      timeout: dtimeout = this.core.timeout,
    } = tparams

    let current = await this.core.get<D, E>(skey)
    if (current?.aborter)
      return current
    if (this.core.shouldCooldown(current, force))
      return current

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      current = await this.core.apply(skey, current, { aborter })

      const {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(key, { signal })

      return await this.core.apply<D, E>(skey, current, { data, cooldown, expiration })
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.apply<D, E>(skey, current, { error, cooldown, expiration })
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
    tparams: TimeParams = {},
  ) {
    if (key === undefined) return
    if (skey === undefined) return

    const {
      cooldown: dcooldown = this.core.cooldown,
      expiration: dexpiration = this.core.expiration,
      timeout: dtimeout = this.core.timeout,
    } = tparams

    const current = await this.core.get<D, E>(skey)
    const updated = updater(current?.data)

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      await this.core.mutate(skey, { data: updated, time: current?.time })

      const {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await poster(key, { data: updated, signal })

      return await this.core.mutate<D, E>(skey, { data, cooldown, expiration })
    } catch (error: any) {
      this.core.mutate<D, E>(skey, current)
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }
}