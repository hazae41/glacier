import { lastOf } from "../libs/arrays"
import { jsoneq } from "../libs/jsoneq"
import { Ortho } from "./ortho"
import { Scroller } from "./scroll"
import { State, Storage } from "./storage"

export type Fetcher<D = any> =
  (url: string) => Promise<D>

export type Listener<D = any, E = any> =
  (state?: State<D, E>) => void

export type Equals =
  (a: unknown, b: unknown) => boolean

export class Core extends Ortho<string, State | undefined> {
  constructor(
    readonly storage: Storage<State> = new Map<string, State>(),
    readonly equals: Equals = jsoneq
  ) {
    super()
  }

  /**
   * Check if key exists from storage
   * @param key Key
   * @returns boolean
   */
  has(
    key: string | undefined
  ): boolean {
    if (!key) return false

    return this.storage.has(key)
  }

  /**
   * Grab current state from storage
   * @param key Key
   * @returns Current state
   */
  get<D = any, E = any>(
    key: string | undefined
  ): State<D, E> | undefined {
    if (!key) return

    return this.storage.get(key)
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param key Key
   * @param state New state
   * @returns 
   */
  set<D = any, E = any>(
    key: string | undefined,
    state: State<D, E>
  ) {
    if (!key) return

    this.storage.set(key, state)
    this.publish(key, state)
  }

  /**
   * Delete key and publish undefined
   * @param key 
   * @returns 
   */
  delete(
    key: string | undefined
  ) {
    if (!key) return

    this.storage.delete(key)
    this.publish(key, undefined)
  }

  /**
   * Merge a new state with the old state
   * - Will check if the new time is after the old time
   * - Will check if it changed using this.equals
   * @param key 
   * @param state 
   * @returns 
   */
  mutate<D = any, E = any>(
    key: string | undefined,
    state: State<D, E>
  ): State<D, E> | undefined {
    if (!key) return

    const current = this.get<D, E>(key)
    if (state.time === undefined)
      state.time = Date.now()
    if (current?.time && state.time < current.time)
      return current
    const next = { ...current, ...state }

    if (this.equals(state.data, current?.data))
      next.data = current?.data
    if (this.equals(state.error, current?.error))
      next.error = current?.error
    if (state.data)
      delete next.error
    if (!state.loading)
      delete next.loading

    if (this.equals(current, next))
      return current
    this.set(key, next)
    return next
  }

  /**
   * True if we should cooldown this resource
   */
  private cooldown<D = any, E = any>(
    current?: State<D, E>,
    cooldown?: number
  ) {
    if (!cooldown)
      return false
    if (current?.time === undefined)
      return false
    if (Date.now() - current.time < cooldown)
      return true
    return false
  }

  /**
   * Simple fetch
   * @param key
   * @param fetcher We don't care if it's not memoized 
   * @param cooldown 
   * @returns 
   */
  async fetch<D = any, E = any>(
    key: string | undefined,
    fetcher: Fetcher<D>,
    cooldown?: number
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = this.get<D, E>(key)
    if (current?.loading)
      return current
    if (this.cooldown(current, cooldown))
      return current

    try {
      this.mutate(key, { loading: true })
      const data = await fetcher(key)
      return this.mutate<D, E>(key, { data })
    } catch (error: any) {
      return this.mutate<D, E>(key, { error })
    }
  }

  /**
   * 
   * @param key Key
   * @param scroller We don't care if it's not memoized
   * @param fetcher We don't care if it's not memoized
   * @param cooldown 
   * @returns 
   */
  async first<D = any, E = any>(
    key: string | undefined,
    scroller: Scroller<D>,
    fetcher: Fetcher<D>,
    cooldown?: number
  ) {
    if (!key) return

    const current = this.get<D[], E>(key)
    if (current?.loading)
      return current
    if (this.cooldown(current, cooldown))
      return current
    const pages = current?.data ?? []
    const first = scroller(undefined)
    if (!first) return current

    try {
      this.mutate(key, { loading: true })
      const page = await fetcher(first)

      if (this.equals(page, pages[0]))
        return this.mutate<D[], E>(key, { data: pages })
      else
        return this.mutate<D[], E>(key, { data: [page] })
    } catch (error: any) {
      return this.mutate<D[], E>(key, { error })
    }
  }

  /**
   * 
   * @param key 
   * @param scroller We don't care if it's not memoized
   * @param fetcher We don't care if it's not memoized
   * @param cooldown 
   * @returns 
   */
  async scroll<D = any, E = any>(
    key: string | undefined,
    scroller: Scroller<D>,
    fetcher: Fetcher<D>,
    cooldown?: number
  ) {
    if (!key) return

    const current = this.get<D[], E>(key)
    if (current?.loading)
      return current
    if (this.cooldown(current, cooldown))
      return current
    const pages = current?.data ?? []
    const last = scroller(lastOf(pages))
    if (!last) return current

    try {
      this.mutate(key, { loading: true })
      const data = [...pages, await fetcher(last)]
      return this.mutate<D[], E>(key, { data })
    } catch (error: any) {
      return this.mutate<D[], E>(key, { error })
    }
  }
}