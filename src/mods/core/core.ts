import { Mutex } from "@hazae41/mutex"
import { Ortho } from "libs/ortho/ortho.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Equals } from "mods/equals/equals.js"
import { isAsyncStorage } from "mods/storages/storage.js"
import { Mutator } from "mods/types/mutator.js"
import { GlobalParams, Params } from "mods/types/params.js"
import { State } from "mods/types/state.js"

export type Listener<D> =
  (x?: State<D>) => void

export class Core extends Ortho<string, State | undefined> {

  readonly #cache = new Map<string, State | undefined>()
  readonly #counts = new Map<string, number>()
  readonly #timeouts = new Map<string, NodeJS.Timeout>()
  readonly #mutexes = new Map<string, Mutex>()

  #mounted = true

  constructor(
    readonly params: GlobalParams
  ) { super() }

  get mounted() {
    return this.#mounted
  }

  mount() {
    this.#mounted = true
  }

  unmount() {
    for (const timeout of this.#timeouts.values())
      clearTimeout(timeout)
    this.#mounted = false
  }

  async lock<T>(skey: string, callback: () => Promise<T>) {
    let mutex = this.#mutexes.get(skey)

    if (mutex === undefined) {
      mutex = new Mutex()
      this.#mutexes.set(skey, mutex)
    }

    return await mutex.lock(callback)
  }

  getSync<D, K>(
    skey: string | undefined,
    params: Params<D, K> = {}
  ): State<D> | undefined | null {
    if (skey === undefined) return

    if (this.#cache.has(skey)) {
      const cached = this.#cache.get(skey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return undefined
    if (isAsyncStorage(storage))
      return null

    const state = storage.get<State<D>>(skey)
    this.#cache.set(skey, state)
    return state
  }

  async get<D, K>(
    skey: string | undefined,
    params: Params<D, K> = {},
    ignore = false
  ): Promise<State<D> | undefined> {
    if (skey === undefined) return

    if (this.#cache.has(skey)) {
      const cached = this.#cache.get(skey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return undefined

    const state = await storage.get<State<D>>(skey, ignore)
    this.#cache.set(skey, state)
    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param skey Key
   * @param state New state
   * @returns 
   */
  async set<D, K>(
    skey: string | undefined,
    state: State<D>,
    params: Params<D, K> = {}
  ) {
    if (skey === undefined) return

    this.#cache.set(skey, state)
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
  async delete<D, K>(
    skey: string | undefined,
    params: Params<D, K> = {}
  ) {
    if (!skey) return

    this.#cache.delete(skey)
    this.#mutexes.delete(skey)
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
  async mutate<D, K>(
    skey: string | undefined,
    current: State<D> | undefined,
    mutator: Mutator<D>,
    params: Params<D, K> = {}
  ): Promise<State<D> | undefined> {
    if (skey === undefined) return

    const {
      equals = DEFAULT_EQUALS
    } = params

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
      if (current.optimistic === true && state.optimistic !== undefined)
        return current
    }

    /**
     * Merge the current state with the new state
     */
    const next: State<D> = {
      ...current,
      ...state
    }

    /**
     * Normalize the new data
     */
    next.data = await this.normalize(false, next, params)

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
     * Publish the new state
     */
    await this.set(skey, next, params)

    return next as State<D>
  }

  async normalize<D, K>(
    shallow: boolean,
    root: State<D>,
    params: Params<D, K> = {},
  ) {
    if (root.data === undefined) return
    if (params.normalizer === undefined) return root.data
    return await params.normalizer(root.data, { core: this, shallow, root })
  }

  /**
   * True if we should cooldown this resource
   */
  shouldCooldown<D>(
    current?: State<D>
  ) {
    if (current?.cooldown === undefined)
      return false
    return Date.now() < current.cooldown
  }

  once<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: Params<D, K> = {}
  ) {
    if (!key) return

    const f: Listener<D> = (x) => {
      this.off(key, f, params)
      listener(x)
    }

    this.on(key, f, params)
  }

  on<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: Params<D, K> = {}
  ) {
    if (!key) return

    super.on(key, listener as Listener<unknown>)

    const count = this.#counts.get(key) ?? 0
    this.#counts.set(key, count + 1)

    const timeout = this.#timeouts.get(key)
    if (timeout === undefined) return

    clearTimeout(timeout)
    this.#timeouts.delete(key)
  }

  async off<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: Params<D, K> = {}
  ) {
    if (!key) return

    super.off(key, listener as Listener<unknown>)

    const count = this.#counts.get(key)

    if (count === undefined)
      throw new Error("Undefined count")

    if (count > 1) {
      this.#counts.set(key, count - 1)
      return
    }

    this.#counts.delete(key)

    const current = await this.get(key, params, true)
    if (current?.expiration === undefined) return
    if (current?.expiration === -1) return

    const erase = async () => {
      if (!this.#mounted) return

      const count = this.#counts.get(key)
      if (count !== undefined) return

      this.#timeouts.delete(key)
      await this.delete(key, params)
    }

    if (Date.now() > current.expiration) {
      await erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.#timeouts.set(key, timeout)
  }
}