import { Core, Fetcher, Poster, Updater } from "./core.js";
import { DEFAULT_COOLDOWN, DEFAULT_TIMEOUT } from "./defaults.js";
import { State } from "./storage.js";

export class Single {
  constructor(readonly core: Core) { }

  /**
   * Simple fetch
   * @param key
   * @param fetcher We don't care if it's not memoized 
   * @param cooldown 
   * @returns state
   */
  async fetch<D = any, E = any, K = any>(
    key: K | undefined,
    skey: string | undefined,
    fetcher: Fetcher<D, K>,
    cooldown = DEFAULT_COOLDOWN,
    timeout = DEFAULT_TIMEOUT,
    aborter = new AbortController()
  ): Promise<State<D, E> | undefined> {
    if (key === undefined) return
    if (skey === undefined) return

    const current = this.core.get<D, E>(skey)
    if (current?.aborter)
      return current
    if (this.core.cooldown(current, cooldown))
      return current

    const t = setTimeout(() => {
      aborter.abort("Timed out")
    }, timeout)

    try {
      const { signal } = aborter

      this.core.mutate(skey, { aborter })
      const { data, expiration } = await fetcher(key, { signal })
      return this.core.mutate<D, E>(skey, { data, expiration })
    } catch (error: any) {
      return this.core.mutate<D, E>(skey, { error })
    } finally {
      clearTimeout(t)
    }
  }

  /**
   * Optimistic update
   * @param key 
   * @param fetcher 
   * @param data optimistic data, also passed to poster
   * @throws error
   * @returns updated state
   */
  async update<D = any, E = any, K = any>(
    key: K | undefined,
    skey: string | undefined,
    poster: Poster<D, K>,
    updater: Updater<D>,
    timeout = DEFAULT_TIMEOUT,
    aborter = new AbortController()
  ) {
    if (key === undefined) return
    if (skey === undefined) return

    const current = this.core.get<D, E>(skey)
    const updated = updater(current.data)

    const t = setTimeout(() => {
      aborter.abort("Timed out")
    }, timeout)

    try {
      const { signal } = aborter

      this.core.mutate(skey, { data: updated, time: current.time })
      const { data, expiration } = await poster(key, { data: updated, signal })
      return this.core.mutate<D, E>(skey, { data, expiration })
    } catch (error: any) {
      this.core.mutate<D, E>(skey, current)
      throw error
    } finally {
      clearTimeout(t)
    }
  }
}