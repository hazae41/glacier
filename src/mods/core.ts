import { Ortho } from "libs/ortho"
import { ScrollHelper } from "mods/scroll"
import { SingleHelper } from "mods/single"
import { Mutator } from "mods/types/mutator"
import { Normal } from "mods/types/normal"
import { Params } from "mods/types/params"
import { State } from "mods/types/state"
import { isAsyncStorage } from "mods/types/storage"
import { DEFAULT_EQUALS } from "mods/utils/defaults"
import { shallowEquals } from "mods/utils/equals"

export type Listener<D = any, E = any, N = D, K = any> =
  (x?: State<D, E, N, K>) => void

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

  getSync<D = any, E = any, N = D, K = any>(
    skey: string | undefined,
    params: Params<D, E, N, K> = {}
  ): State<D, E, N, K> | undefined | null {
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

  async get<D = any, E = any, N = D, K = any>(
    skey: string | undefined,
    params: Params<D, E, N, K> = {},
    ignore = false
  ): Promise<State<D, E, N, K> | undefined> {
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
  async set<D = any, E = any, N = D, K = any>(
    skey: string | undefined,
    state: State<D, E, N, K>,
    params: Params<D, E, N, K> = {}
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
  async delete<D = any, E = any, N = D, K = any>(
    skey: string | undefined,
    params: Params<D, E, N, K> = {}
  ) {
    if (!skey) return

    this.cache.delete(skey)
    this.publish(skey, undefined)

    const { storage } = params
    if (!storage) return
    await storage.delete(skey)
  }

  async mutate<D = any, E = any, N = D, K = any>(
    skey: string | undefined,
    current: State<D, E, N, K> | undefined,
    mutator: Mutator<D, E, N, K>,
    params: Params<D, E, N, K> = {},
    aborter?: AbortController
  ): Promise<State<D, E, N, K> | undefined> {
    if (skey === undefined) return
    const state = mutator(current)

    if (!state) {
      await this.delete(skey, params)
      return
    }

    const next: State<D, E, D | N, K> = {
      time: Date.now(),
      data: current?.data,
      error: current?.error,
      cooldown: current?.cooldown,
      expiration: current?.expiration,
      aborter: current?.aborter,
      optimistic: undefined,
      ...state
    }

    if (next.time !== undefined && next.time < (current?.time ?? 0)) { // Keep the current state if the new state is older
      next.time = current?.time
      next.data = current?.data
      next.error = current?.error
      next.cooldown = current?.cooldown
      next.expiration = current?.expiration
      next.optimistic = current?.optimistic
      next.aborter = current?.aborter
    }

    if (aborter) // Force unset or ignore aborter
      next.aborter = aborter === current?.aborter
        ? state.aborter
        : current?.aborter

    const {
      equals = DEFAULT_EQUALS,
      normalizer
    } = params

    if (equals(next.data, current?.data)) // Prevent some renders if the data is the same
      next.data = current?.data
    if (shallowEquals(next, current)) // Shallow comparison because aborter is not serializable
      return current

    if (normalizer !== undefined && next.data !== undefined && next.data !== current?.data) {
      const transformed = normalizer(next.data as D)
      next.data = await this.normalize(transformed, next)
    }

    await this.set(skey, next, params)
    return next as State<D, E, N, K>
  }

  async normalize<T = any, N = any>(
    transformed: T,
    state: State
  ): Promise<N> {
    const { time, cooldown, expiration, optimistic } = state

    if (typeof transformed !== "object")
      return transformed as any as N
    if (transformed === null)
      return transformed as N

    for (const key in transformed) {
      const item = transformed[key]
      if (item instanceof Normal) {
        const object = item.schema.make(this, undefined)
        await object.mutate(() => ({ data: item.data, time, cooldown, expiration, optimistic }))
        transformed[key] = item.result
      } else {
        transformed[key] = await this.normalize(item, state)
      }
    }

    return transformed as N
  }

  /**
   * True if we should cooldown this resource
   */
  shouldCooldown<D = any, E = any, N = D, K = any>(
    current?: State<D, E, N, K>,
    force?: boolean
  ) {
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

  subscribe<D = any, E = any, N = D, K = any>(
    key: string | undefined,
    listener: Listener<D, E, N, K>,
    params: Params<D, E, N, K> = {}
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

  async unsubscribe<D = any, E = any, N = D, K = any>(
    key: string | undefined,
    listener: Listener<D, E, N, K>,
    params: Params<D, E, N, K> = {}
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