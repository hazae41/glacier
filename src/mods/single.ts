import { Core, Fetcher, Poster } from "./core";
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
    cooldown?: number
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = this.core.get<D, E>(key)
    if (current?.loading)
      return current
    if (this.core.cooldown(current, cooldown))
      return current

    try {
      this.core.mutate(key, { loading: true })
      const data = await fetcher(key)
      return this.core.mutate<D, E>(key, { data })
    } catch (error: any) {
      return this.core.mutate<D, E>(key, { error })
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
    data: D,
  ) {
    if (!key) return

    const current = this.core.get<D, E>(key)

    try {
      this.core.mutate(key, { data, time: current.time })
      const updated = await poster(key, data)
      return this.core.mutate<D, E>(key, { data: updated })
    } catch (error: any) {
      this.core.mutate<D, E>(key, current)
      throw error
    }
  }
}