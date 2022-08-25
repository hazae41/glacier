import { Core, DEFAULT_COOLDOWN, DEFAULT_TIMEOUT, Fetcher, Poster, Updater } from "./core";
import { State } from "./storage";

export class Single {
  constructor(readonly core: Core) { }

  /**
   * Simple fetch
   * @param key
   * @param fetcher We don't care if it's not memoized 
   * @param cooldown 
   * @returns state
   */
  async fetch<D = any, E = any>(
    key: string | undefined,
    fetcher: Fetcher<D>,
    cooldown = DEFAULT_COOLDOWN,
    timeout = DEFAULT_TIMEOUT,
    aborter = new AbortController()
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = this.core.get<D, E>(key)
    if (current?.aborter)
      return current
    if (this.core.cooldown(current, cooldown))
      return current

    const t = setTimeout(() => {
      aborter.abort("Timed out")
    }, timeout)

    try {
      const { signal } = aborter

      this.core.mutate(key, { aborter })
      const { data, expiration } = await fetcher(key, { signal })
      return this.core.mutate<D, E>(key, { data, expiration })
    } catch (error: any) {
      return this.core.mutate<D, E>(key, { error })
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
  async update<D = any, E = any>(
    key: string | undefined,
    poster: Poster<D>,
    updater: Updater<D>,
    timeout = DEFAULT_TIMEOUT,
    aborter = new AbortController()
  ) {
    if (!key) return

    const current = this.core.get<D, E>(key)
    const updated = updater(current.data)

    const t = setTimeout(() => {
      aborter.abort("Timed out")
    }, timeout)

    try {
      const { signal } = aborter

      this.core.mutate(key, { data: updated, time: current.time })
      const { data, expiration } = await poster(key, { data: updated, signal })
      return this.core.mutate<D, E>(key, { data, expiration })
    } catch (error: any) {
      this.core.mutate<D, E>(key, current)
      throw error
    } finally {
      clearTimeout(t)
    }
  }
}