import { Ortho } from "../libs/ortho.js"
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "./defaults.js"
import { Equals } from "./equals.js"
import { Scroll } from "./scroll.js"
import { Single } from "./single.js"
import { isAsyncStorage, State, Storage } from "./storages/storage.js"
import { TimeParams } from "./time.js"

export interface Result<D = any> {
  data: D,
  cooldown?: number
  expiration?: number
}

export type Fetcher<D = any, K = any,> =
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

export interface CoreParams extends TimeParams {
  storage?: Storage<State>
  equals?: Equals
}

export class Core extends Ortho<string, State | undefined> {
  readonly single = new Single(this)
  readonly scroll = new Scroll(this)

  readonly cache = new Map<string, State>()
  readonly storage?: Storage<State>

  readonly equals: Equals

  readonly cooldown: number
  readonly expiration: number
  readonly timeout: number

  protected mounted = true

  constructor(params?: CoreParams) {
    super()

    Object.assign(this, params)

    this.equals ??= DEFAULT_EQUALS
    this.cooldown ??= DEFAULT_COOLDOWN
    this.expiration ??= DEFAULT_EXPIRATION
    this.timeout ??= DEFAULT_TIMEOUT
  }

  get async() {
    if (!this.storage) return false
    return isAsyncStorage(this.storage)
  }

  hasSync(
    key: string | undefined
  ): boolean {
    if (!key) return

    if (this.cache.has(key))
      return true
    if (!this.storage)
      return false
    if (isAsyncStorage(this.storage))
      return false
    return this.storage.has(key)
  }

  async has(
    key: string | undefined
  ) {
    if (!key) return false

    if (this.cache.has(key))
      return true
    if (!this.storage)
      return false
    return await this.storage.has(key)
  }

  getSync<D = any, E = any>(
    key: string | undefined
  ): State<D, E> | undefined {
    if (!key) return

    if (this.cache.has(key))
      return this.cache.get(key)
    if (!this.storage)
      return
    if (isAsyncStorage(this.storage))
      return
    const state = this.storage.get(key)
    this.cache.set(key, state)
    return state
  }

  async get<D = any, E = any>(
    key: string | undefined
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    if (this.cache.has(key))
      return this.cache.get(key)
    if (!this.storage)
      return
    const state = await this.storage.get(key)
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
    state: State<D, E>
  ) {
    if (!key) return

    this.cache.set(key, state)
    this.publish(key, state)

    if (!this.storage)
      return
    await this.storage.set(key, state)
  }

  /**
   * Delete key and publish undefined
   * @param key 
   * @returns 
   */
  async delete(
    key: string | undefined
  ) {
    if (!key) return

    this.cache.delete(key)
    this.publish(key, undefined)

    if (!this.storage)
      return
    await this.storage.delete(key)
  }

  async apply<D = any, E = any>(
    key: string | undefined,
    current?: State<D, E>,
    state?: State<D, E>
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    if (!state) {
      await this.delete(key)
      return
    }

    if (state.time === undefined)
      state.time = Date.now()
    if (current?.time !== undefined && state.time < current.time)
      return current

    if (this.equals(state.data, current?.data))
      state.data = current?.data
    if (this.equals(state.error, current?.error))
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

    if (this.equals(current, next))
      return current
    await this.set(key, next)
    return next
  }

  async mutate<D = any, E = any>(
    key: string | undefined,
    state?: State<D, E>
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = await this.get<D, E>(key)
    return await this.apply(key, current, state)
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

  subscribe(
    key: string | undefined,
    listener: (x: State) => void
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

  async unsubscribe(
    key: string | undefined,
    listener: (x: State) => void
  ) {
    if (!key) return

    super.unsubscribe(key, listener)

    const count = this.counts.get(key)!

    if (count > 1) {
      this.counts.set(key, count - 1)
      return
    }

    this.counts.delete(key)

    const current = await this.get(key)
    if (current?.expiration === undefined) return
    if (current?.expiration === -1) return

    const erase = async () => {
      if (!this.mounted) return

      const count = this.counts.get(key)
      if (count !== undefined) return

      this.timeouts.delete(key)
      await this.delete(key)
    }

    if (Date.now() > current.expiration) {
      await erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.timeouts.set(key, timeout)
  }

  unmount() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this.mounted = false
  }
}