import { Ortho } from "libs/ortho.js"
import { Scroll } from "mods/scroll"
import { Single } from "mods/single"
import { Params } from "mods/types/params"
import { State } from "mods/types/state"
import { isAsyncStorage } from "mods/types/storage"
import { DEFAULT_EQUALS } from "mods/utils/defaults"

export interface Result<D = any> {
  data: D,
  cooldown?: number
  expiration?: number
}

export type Fetcher<D = any, K = any> =
  (key: K, more: FetcherMore) => Promise<Result<D>>

export type FetcherMore<D = any> =
  { signal: AbortSignal }

export type Poster<D = any, K = any> =
  (key: K, more: PosterMore) => Promise<Result<D>>

export type PosterMore<D = any> =
  { signal: AbortSignal, data: D }

export type Scroller<D = any, K = any> =
  (previous?: D) => K | undefined

export type Updater<D = any> =
  (previous?: D) => D

export class Core extends Ortho<string, State | undefined> {
  readonly single = new Single(this)
  readonly scroll = new Scroll(this)

  readonly cache = new Map<string, State>()

  private _mounted = true

  constructor() { super() }

  get mounted() {
    return this._mounted
  }

  unmount() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this._mounted = false
  }

  hasSync<D = any, E = any>(
    key: string | undefined,
    params: Params<D, E> = {}
  ): boolean {
    if (!key) return

    if (this.cache.has(key))
      return true

    const { storage } = params
    if (!storage) return false
    if (isAsyncStorage(storage)) return false
    return storage.has(key)
  }

  async has<D = any, E = any>(
    key: string | undefined,
    params: Params<D, E> = {}
  ) {
    if (!key) return false

    if (this.cache.has(key))
      return true

    const { storage } = params
    if (!storage) return false
    return await storage.has(key)
  }

  getSync<D = any, E = any>(
    key: string | undefined,
    params: Params<D, E> = {}
  ): State<D, E> | undefined {
    if (!key) return

    if (this.cache.has(key))
      return this.cache.get(key)

    const { storage } = params
    if (!storage) return
    if (isAsyncStorage(storage)) return
    const state = storage.get(key)
    this.cache.set(key, state)
    return state
  }

  async get<D = any, E = any>(
    key: string | undefined,
    params: Params<D, E> = {}
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    if (this.cache.has(key))
      return this.cache.get(key)

    const { storage } = params
    if (!storage) return
    const state = await storage.get(key)
    this.cache.set(key, state)
    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param key Key
   * @param state New state
   * @returns 
   */
  async set<D = any, E = any>(
    key: string | undefined,
    state: State<D, E>,
    params: Params<D, E> = {}
  ) {
    if (!key) return

    this.cache.set(key, state)
    this.publish(key, state)

    const { storage } = params
    if (!storage) return
    await storage.set(key, state)
  }

  /**
   * Delete key and publish undefined
   * @param key 
   * @returns 
   */
  async delete<D = any, E = any>(
    key: string | undefined,
    params: Params<D, E> = {}
  ) {
    if (!key) return

    this.cache.delete(key)
    this.publish(key, undefined)

    const { storage } = params
    if (!storage) return
    await storage.delete(key)
  }

  async apply<D = any, E = any>(
    key: string | undefined,
    current?: State<D, E>,
    state?: State<D, E>,
    params: Params<D, E> = {}
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    if (!state) {
      await this.delete(key, params)
      return
    }

    if (state.time === undefined)
      state.time = Date.now()
    if (current?.time !== undefined && state.time < current.time)
      return current

    const { equals = DEFAULT_EQUALS } = params

    if (equals(state.data, current?.data))
      state.data = current?.data
    if (equals(state.error, current?.error))
      state.error = current?.error

    const next = { ...current, ...state }

    if (state.data !== undefined)
      delete next.error
    if (state.aborter === undefined)
      delete next.aborter
    if (state.expiration === -1)
      delete next.expiration
    if (state.cooldown === -1)
      delete next.cooldown

    if (equals(current, next))
      return current
    await this.set<D, E>(key, next, params)
    return next
  }

  async mutate<D = any, E = any>(
    key: string | undefined,
    state?: State<D, E>,
    params: Params<D, E> = {}
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = await this.get<D, E>(key, params)
    return await this.apply<D, E>(key, current, state, params)
  }

  /**
   * True if we should cooldown this resource
   */
  shouldCooldown<D = any, E = any>(current?: State<D, E>, force?: boolean) {
    if (force)
      return false
    if (current?.cooldown === undefined)
      return false
    if (Date.now() < current.cooldown)
      return true
    return false
  }

  counts = new Map<string, number>()
  timeouts = new Map<string, NodeJS.Timeout>()

  subscribe<D = any, E = any>(
    key: string | undefined,
    listener: (x: State<D, E>) => void,
    _: Params<D, E> = {}
  ) {
    if (!key) return

    super.subscribe(key, listener)

    const count = this.counts.get(key) ?? 0
    this.counts.set(key, count + 1)

    const timeout = this.timeouts.get(key)
    if (timeout === undefined) return

    clearTimeout(timeout)
    this.timeouts.delete(key)
  }

  async unsubscribe<D = any, E = any>(
    key: string | undefined,
    listener: (x: State<D, E>) => void,
    params: Params<D, E> = {}
  ) {
    if (!key) return

    super.unsubscribe(key, listener)

    const count = this.counts.get(key)!

    if (count > 1) {
      this.counts.set(key, count - 1)
      return
    }

    this.counts.delete(key)

    const current = await this.get(key, params)
    if (current?.expiration === undefined) return
    if (current?.expiration === -1) return

    const erase = async () => {
      if (!this._mounted) return

      const count = this.counts.get(key)
      if (count !== undefined) return

      this.timeouts.delete(key)
      await this.delete(key, params)
    }

    if (Date.now() > current.expiration) {
      await erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.timeouts.set(key, timeout)
  }
}