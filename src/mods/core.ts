import { Ortho } from "../libs/ortho"
import { Equals, jsoneq } from "./equals"
import { Scroll } from "./scroll"
import { Single } from "./single"
import { State, Storage } from "./storage"

export const DEFAULT_COOLDOWN = 1 * 1000
export const DEFAULT_TIMEOUT = 5 * 1000

export interface Result<D = any> {
  data: D,
  expiration?: number
}

export type Fetcher<D = any> =
  (url: string, more: FetcherMore) => Promise<Result<D>>

export type FetcherMore<D = any> =
  { signal: AbortSignal }

export type Poster<D = any> =
  (url: string, more: PosterMore) => Promise<Result<D>>

export type PosterMore<D = any> =
  { signal: AbortSignal, data: D }

export type Scroller<D = any> =
  (previous?: D) => string | undefined

export type Updater<D = any> =
  (previous?: D) => D

export type Listener<D = any, E = any> =
  (state?: State<D, E>) => void

export function isAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === "AbortError"
}

export class Core extends Ortho<string, State | undefined> {
  readonly single = new Single(this)
  readonly scroll = new Scroll(this)

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
    if (current?.time !== undefined && state.time < current.time)
      return current

    const next = { ...current, ...state }

    if (this.equals(state.data, current?.data))
      next.data = current?.data
    if (this.equals(state.error, current?.error))
      next.error = current?.error

    if (state.data !== undefined)
      delete next.error
    if (state.aborter === undefined)
      delete next.aborter

    if (this.equals(current, next))
      return current
    this.set(key, next)
    return next
  }

  /**
   * True if we should cooldown this resource
   */
  cooldown<D = any, E = any>(
    current?: State<D, E>,
    cooldown?: number
  ) {
    if (cooldown === undefined)
      return false
    if (current?.time === undefined)
      return false
    if (Date.now() - current.time < cooldown)
      return true
    return false
  }

  counts = new Map<string, number>()
  timeouts = new Map<string, number>()

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

  unsubscribe(
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

    const { expiration } = this.get(key) ?? {}
    if (expiration === undefined) return

    const erase = () => {
      this.timeouts.delete(key)
      this.delete(key)
    }

    if (Date.now() > expiration) {
      erase()
      return
    }

    const delay = expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.timeouts.set(key, timeout)
  }
}