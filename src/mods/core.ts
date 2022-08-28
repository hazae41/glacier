import { Ortho } from "../libs/ortho.js"
import { DEFAULT_COOLDOWN, DEFAULT_EQUALS, DEFAULT_EXPIRATION, DEFAULT_TIMEOUT } from "./defaults.js"
import { Equals } from "./equals.js"
import { Scroll } from "./scroll.js"
import { Single } from "./single.js"
import { isAsyncStorage, State, Storage } from "./storage.js"
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

  readonly storage: Storage<State>
  readonly equals: Equals

  readonly cooldown: number
  readonly expiration: number
  readonly timeout: number

  constructor(params?: CoreParams) {
    super()

    Object.assign(this, params)

    this.storage ??= new Map<string, State>()
    this.equals ??= DEFAULT_EQUALS
    this.cooldown ??= DEFAULT_COOLDOWN
    this.expiration ??= DEFAULT_EXPIRATION
    this.timeout ??= DEFAULT_TIMEOUT
  }

  /**
   * Check if key exists from storage
   * @param key Key
   * @returns boolean
   */
  async has(
    key: string | undefined
  ) {
    if (!key) return false

    return await this.storage.has(key)
  }

  get async() {
    return isAsyncStorage(this.storage)
  }

  getSync<D = any, E = any>(
    key: string | undefined
  ): State<D, E> | undefined {
    if (!key) return

    if (isAsyncStorage(this.storage)) return
    return this.storage.get(key)
  }

  /**
   * Grab current state from storage
   * @param key Key
   * @returns Current state
   */
  async get<D = any, E = any>(
    key: string | undefined
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    return await this.storage.get(key)
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

    await this.storage.set(key, state)
    this.publish(key, state)
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

    await this.storage.delete(key)
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
  async mutate<D = any, E = any>(
    key: string | undefined,
    state?: State<D, E>
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    if (!state) {
      this.delete(key)
      return
    }

    const current = await this.get<D, E>(key)

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

    const erase = () => {
      this.timeouts.delete(key)
      this.delete(key)
    }

    if (Date.now() > current.expiration) {
      erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.timeouts.set(key, timeout)
  }
}