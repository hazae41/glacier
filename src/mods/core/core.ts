import { Mutex } from "libs/mutex/mutex.js"
import { Ortho } from "libs/ortho/ortho.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Equals } from "mods/equals/equals.js"
import { ScrollHelper } from "mods/scroll/helper.js"
import { SingleHelper } from "mods/single/helper.js"
import { isAsyncStorage } from "mods/storages/storage.js"
import { Mutator } from "mods/types/mutator.js"
import { Params } from "mods/types/params.js"
import { State } from "mods/types/state.js"

export type Listener<D = any, E = any, K = any> =
  (x?: State<D, E, K>) => void

export class Core extends Ortho<string, State | undefined> {
  readonly single = new SingleHelper(this)
  readonly scroll = new ScrollHelper(this)

  readonly cache = new Map<string, State>()
  readonly locks = new Map<string, Mutex>()

  private _mounted = true

  constructor(
    readonly params: Params
  ) { super() }

  get mounted() { return this._mounted }

  mount() {
    this._mounted = true
  }

  unmount() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this._mounted = false
  }

  async lock<T>(skey: string, callback: () => Promise<T>) {
    const lock = this.locks.get(skey)

    if (lock !== undefined)
      return await lock.lock(callback)

    const lock2 = new Mutex()
    this.locks.set(skey, lock2)
    return await lock2.lock(callback)
  }

  getSync<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {}
  ): State<D, E, K> | undefined | null {
    if (skey === undefined) return

    const cached = this.cache.get(skey)
    if (cached !== undefined) return cached

    const { storage } = params
    if (!storage) return

    if (isAsyncStorage(storage))
      return null
    const state = storage.get(skey)
    this.cache.set(skey, state)
    return state
  }

  async get<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {},
    ignore = false
  ): Promise<State<D, E, K> | undefined> {
    if (skey === undefined) return

    const cached = this.cache.get(skey)
    if (cached !== undefined) return cached

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
  async set<D = any, E = any, K = any>(
    skey: string | undefined,
    state: State<D, E, K>,
    params: Params<D, E, K> = {}
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
  async delete<D = any, E = any, K = any>(
    skey: string | undefined,
    params: Params<D, E, K> = {}
  ) {
    if (!skey) return

    this.cache.delete(skey)
    this.locks.delete(skey)
    this.publish(skey, undefined)

    const { storage } = params
    if (!storage) return
    await storage.delete(skey)
  }

  /**
   * The most important function
   * @param skey 
   * @param current 
   * @param mutator 
   * @param params 
   * @returns 
   */
  async mutate<D = any, E = any, K = any>(
    skey: string | undefined,
    current: State<D, E, K> | undefined,
    mutator: Mutator<D, E, K>,
    params: Params<D, E, K> = {}
  ): Promise<State<D, E, K> | undefined> {
    if (skey === undefined) return

    /**
     * Apply mutator to the current state
     */
    const state = mutator(current)

    /**
     * Delete and return if the new state is undefined
     */
    if (state === undefined) {
      await this.delete(skey, params)
      return
    }


    if (current !== undefined) {
      /**
       * Do not apply older states
       */
      if (state.time !== undefined && current.time !== undefined && state.time < current.time)
        return current

      /**
       * Do not apply on an optimistic state
       * 
       * (optimistic=false means it's the end of the optimistic mutation)
       */
      if (state.optimistic === undefined && current.optimistic === true)
        return current
    }

    /**
     * Merge the current state with the new state
     */
    const next: State<D, E, K> = {
      ...current,
      ...state
    }

    /**
     * Normalize the new data
     */
    next.data = await this.normalize(false, next, params)

    const {
      equals = DEFAULT_EQUALS
    } = params

    /**
     * Optimization: Do not modify data if it's "equal" to the previous data
     */
    if (equals(next.data, current?.data))
      next.data = current?.data

    /**
     * Forcefully set time if it's unset
     */
    if (next.time === undefined)
      next.time = Date.now()

    /**
     * Set the data and time as real if optimistic is unset
     */
    if (next.optimistic !== true) {
      next.realData = next.data
      next.realTime = next.time
    }

    /**
     * Do not apply if the new state if shallowly equal to the current state
     */
    if (Equals.shallow(next, current))
      return current

    /**
     * Publish and return the new state
     */
    await this.set(skey, next, params)
    return next as State<D, E, K>
  }

  async normalize<D = any, E = any, K = any>(
    shallow: boolean,
    root: State<D, E, K>,
    params: Params<D, E, K> = {},
  ) {
    if (root.data === undefined) return
    if (params.normalizer === undefined) return root.data
    return await params.normalizer(root.data, { core: this, shallow, root })
  }

  /**
   * True if we should cooldown this resource
   */
  shouldCooldown<D = any, E = any, K = any>(
    current?: State<D, E, K>
  ) {
    if (current?.cooldown === undefined)
      return false
    return Date.now() < current.cooldown
  }

  counts = new Map<string, number>()
  timeouts = new Map<string, NodeJS.Timeout>()

  once<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    const f: Listener<D, E, K> = (x) => {
      this.off(key, f, params)
      listener(x)
    }

    this.on(key, f, params)
  }

  on<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    super.on(key, listener)

    const count = this.counts.get(key) ?? 0
    this.counts.set(key, count + 1)

    const timeout = this.timeouts.get(key)
    if (timeout === undefined) return

    clearTimeout(timeout)
    this.timeouts.delete(key)
  }

  async off<D = any, E = any, K = any>(
    key: string | undefined,
    listener: Listener<D, E, K>,
    params: Params<D, E, K> = {}
  ) {
    if (!key) return

    super.off(key, listener)

    const count = this.counts.get(key)

    if (count === undefined)
      throw new Error("Undefined count")

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