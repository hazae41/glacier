import { Ortho } from "libs/ortho"
import { ScrollHelper } from "mods/scroll"
import { SingleHelper } from "mods/single"
import { Params } from "mods/types/params"
import { State } from "mods/types/state"
import { isAsyncStorage } from "mods/types/storage"
import { DEFAULT_EQUALS } from "mods/utils/defaults"
import { shallowEquals } from "mods/utils/equals"

export type Listener<D = any, E = any> =
  (x?: State<D, E>) => void

export class Core extends Ortho<string, State | undefined> {
  readonly single = new SingleHelper(this)
  readonly scroll = new ScrollHelper(this)

  readonly cache = new Map<string, State>()

  private _mounted = true

  constructor() { super() }

  get mounted() { return this._mounted }

  unmount() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this._mounted = false
  }

  getSync<D = any, E = any>(
    skey: string | undefined,
    params: Params<D, E> = {}
  ): State<D, E> | undefined | null {
    if (skey === undefined) return

    if (this.cache.has(skey))
      return this.cache.get(skey)

    const { storage } = params
    if (!storage) return

    if (isAsyncStorage(storage))
      return null
    const state = storage.get(skey)
    this.cache.set(skey, state)
    return state
  }

  async get<D = any, E = any>(
    skey: string | undefined,
    params: Params<D, E> = {},
    ignore = false
  ): Promise<State<D, E> | undefined> {
    if (skey === undefined) return

    if (this.cache.has(skey))
      return this.cache.get(skey)

    const { storage } = params
    if (!storage) return

    const state = await storage.get(skey, ignore)
    this.cache.set(skey, state)
    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param skey Key
   * @param state New state
   * @returns 
   */
  async set<D = any, E = any>(
    skey: string | undefined,
    state: State<D, E>,
    params: Params<D, E> = {}
  ) {
    if (skey === undefined) return

    this.cache.set(skey, state)
    this.publish(skey, state)

    const { storage } = params
    if (!storage) return
    const { data, time, cooldown, expiration } = state
    await storage.set(skey, { data, time, cooldown, expiration })
  }

  /**
   * Delete key and publish undefined
   * @param skey 
   * @returns 
   */
  async delete<D = any, E = any>(
    skey: string | undefined,
    params: Params<D, E> = {}
  ) {
    if (!skey) return

    this.cache.delete(skey)
    this.publish(skey, undefined)

    const { storage } = params
    if (!storage) return
    await storage.delete(skey)
  }

  async apply<D = any, E = any>(
    skey: string | undefined,
    current?: State<D, E>,
    state?: State<D, E>,
    params: Params<D, E> = {},
    aborter?: AbortController
  ): Promise<State<D, E> | undefined> {
    if (skey === undefined) return

    if (!state) {
      await this.delete(skey, params)
      return
    }

    const next: State<D, E> = {
      time: Date.now(),
      data: current?.data,
      error: current?.error,
      cooldown: current?.cooldown,
      expiration: current?.expiration,
      aborter: current?.aborter,
      optimistic: undefined,
      ...state
    }

    // Keep the current state if the new state is older
    if (next.time !== undefined && next.time < (current?.time ?? 0)) {
      next.time = current?.time
      next.data = current?.data
      next.error = current?.error
      next.cooldown = current?.cooldown
      next.expiration = current?.expiration
      next.optimistic = current?.optimistic
      next.aborter = current?.aborter
    }

    // Force unset or ignore aborter
    if (aborter)
      next.aborter = aborter === current?.aborter
        ? state.aborter
        : current?.aborter

    const { equals = DEFAULT_EQUALS } = params

    // Prevent some renders if the data is the same
    if (equals(next.data, current?.data))
      next.data = current?.data

    // Shallow comparison because aborter is not serializable
    if (shallowEquals(next, current))
      return current

    await this.set<D, E>(skey, next, params)
    return next
  }

  async mutate<D = any, E = any>(
    key: string | undefined,
    state?: State<D, E>,
    params: Params<D, E> = {},
    aborter?: AbortController
  ): Promise<State<D, E> | undefined> {
    if (!key) return

    const current = await this.get<D, E>(key, params)
    return await this.apply<D, E>(key, current, state, params, aborter)
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
    listener: Listener<D, E>,
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
    listener: Listener<D, E>,
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

    const current = await this.get(key, params, true)
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