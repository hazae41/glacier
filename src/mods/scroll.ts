import { lastOf } from "../libs/arrays.js";
import { Core, Fetcher, Scroller } from "./core.js";
import { getTimeFromDelay, TimeParams } from "./time.js";

export class Scroll {
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
  async first<D = any, E = any, K = any>(
    skey: string | undefined,
    scroller: Scroller<D, K>,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    tparams: TimeParams = {},
    force = false
  ) {
    if (skey === undefined) return

    const {
      cooldown: dcooldown = this.core.cooldown,
      expiration: dexpiration = this.core.expiration,
      timeout: dtimeout = this.core.timeout,
    } = tparams

    let current = await this.core.get<D[], E>(skey)
    if (current?.aborter)
      return current
    if (this.core.shouldCooldown(current, force))
      return current

    const pages = current?.data ?? []
    const first = scroller(undefined)
    if (!first) return current

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
      } = await fetcher(first, { signal })

      return this.core.equals(data, pages[0])
        ? await this.core.apply<D[], E>(skey, current, { cooldown, expiration })
        : await this.core.apply<D[], E>(skey, current, { data: [data], cooldown, expiration })
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.apply<D[], E>(skey, current, { error, cooldown, expiration })
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
  async scroll<D = any, E = any, K = any>(
    skey: string | undefined,
    scroller: Scroller<D, K>,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    tparams: TimeParams = {},
    force = false
  ) {
    if (skey === undefined) return

    const {
      cooldown: dcooldown = this.core.cooldown,
      expiration: dexpiration = this.core.expiration,
      timeout: dtimeout = this.core.timeout,
    } = tparams

    let current = await this.core.get<D[], E>(skey)
    if (current?.aborter)
      return current
    if (this.core.shouldCooldown(current, force))
      return current

    const pages = current?.data ?? []
    const last = scroller(lastOf(pages))
    if (!last) return current

    const timeout = setTimeout(() => {
      aborter.abort("Timed out")
    }, dtimeout)

    try {
      const { signal } = aborter

      current = await this.core.apply(skey, current, { aborter })

      let {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(last, { signal })

      expiration = Math.min(expiration, current.expiration)

      return await this.core.apply<D[], E>(skey, current, { data: [...pages, data], cooldown, expiration })
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.apply<D[], E>(skey, current, { error, cooldown, expiration })
    } finally {
      clearTimeout(timeout)
    }
  }
}