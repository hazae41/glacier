import { lastOf } from "libs/arrays";
import { getTimeFromDelay } from "libs/time";
import { Core } from "mods/core";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "mods/utils/defaults";

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
  async first<D = any, E = any, K = any>(
    skey: string | undefined,
    scroller: Scroller<D, K>,
    fetcher: Fetcher<D, K>,
    aborter = new AbortController(),
    params: Params<D[], E> = {},
    force = false
  ): Promise<State<D[], E>> {
    if (skey === undefined) return

    const {
      equals = DEFAULT_EQUALS,
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    let current = await this.core.get<D[], E>(skey, params)
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

      current = await this.core.apply(skey, current, { aborter }, params)

      const {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(first, { signal })

      return equals(data, pages[0])
        ? await this.core.apply<D[], E>(skey, current, { cooldown, expiration }, params)
        : await this.core.apply<D[], E>(skey, current, { data: [data], cooldown, expiration }, params)
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.apply<D[], E>(skey, current, { error, cooldown, expiration }, params)
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
    params: Params<D[], E> = {},
    force = false
  ): Promise<State<D[], E>> {
    if (skey === undefined) return

    const {
      cooldown: dcooldown = DEFAULT_COOLDOWN,
      expiration: dexpiration = DEFAULT_EXPIRATION,
      timeout: dtimeout = DEFAULT_TIMEOUT,
    } = params

    let current = await this.core.get<D[], E>(skey, params)
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

      current = await this.core.apply(skey, current, { aborter }, params)

      let {
        data,
        cooldown = getTimeFromDelay(dcooldown),
        expiration = getTimeFromDelay(dexpiration)
      } = await fetcher(last, { signal })

      expiration = Math.min(expiration, current.expiration)

      return await this.core.apply<D[], E>(skey, current, { data: [...pages, data], cooldown, expiration }, params)
    } catch (error: any) {
      const cooldown = getTimeFromDelay(dcooldown)
      const expiration = getTimeFromDelay(dexpiration)

      return await this.core.apply<D[], E>(skey, current, { error, cooldown, expiration }, params)
    } finally {
      clearTimeout(timeout)
    }
  }
}