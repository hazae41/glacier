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

  async lock<T>(storageKey: string, callback: () => Promise<T>) {
    let mutex = this.#mutexes.get(storageKey)

    if (mutex === undefined) {
      mutex = new Mutex()
      this.#mutexes.set(storageKey, mutex)
    }

    return await mutex.lock(callback)
  }

  getSync<D, K>(
    storageKey: string | undefined,
    params: Params<D, K> = {}
  ): State<D> | undefined | null {
    if (storageKey === undefined)
      return

    if (this.#cache.has(storageKey)) {
      const cached = this.#cache.get(storageKey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return undefined
    if (isAsyncStorage(storage))
      return null

    const state = storage.get<State<D>>(storageKey)
    this.#cache.set(storageKey, state)
    return state
  }

  async get<D, K>(
    storageKey: string | undefined,
    params: Params<D, K> = {},
    ignore = false
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

    if (this.#cache.has(storageKey)) {
      const cached = this.#cache.get(storageKey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return undefined

    const state = await storage.get<State<D>>(storageKey, ignore)
    this.#cache.set(storageKey, state)
    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param storageKey Key
   * @param state New state
   * @returns 
   */
  async set<D, K>(
    storageKey: string | undefined,
    state: State<D>,
    params: Params<D, K> = {}
  ) {
    if (storageKey === undefined)
      return

    this.#cache.set(storageKey, state)
    this.publish(storageKey, state)

    const { storage } = params

    if (!storage)
      return

    const { data, time, cooldown, expiration } = state
    await storage.set(storageKey, { data, time, cooldown, expiration })
  }

  /**
   * Delete key and publish undefined
   * @param storageKey 
   * @returns 
   */
  async delete<D, K>(
    storageKey: string | undefined,
    params: Params<D, K> = {}
  ) {
    if (!storageKey)
      return

    this.#cache.delete(storageKey)
    this.#mutexes.delete(storageKey)
    this.publish(storageKey, undefined)

    const { storage } = params

    if (!storage)
      return

    await storage.delete(storageKey)
  }

  /**
   * The most important function
   * @param storageKey 
   * @param current 
   * @param mutator 
   * @param params 
   * @returns 
   */
  async mutate<D, K>(
    storageKey: string | undefined,
    current: State<D> | undefined,
    mutator: Mutator<D>,
    params: Params<D, K> = {}
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

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
      await this.delete(storageKey, params)
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
      if (current.optimistic === true && state.optimistic === undefined)
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
    await this.set(storageKey, next, params)

    return next as State<D>
  }

  async normalize<D, K>(
    shallow: boolean,
    root: State<D>,
    params: Params<D, K> = {},
  ) {
    if (root.data === undefined)
      return

    if (params.normalizer === undefined)
      return root.data

    return await params.normalizer(root.data, { core: this, shallow, root })
  }

  once<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: Params<D, K> = {}
  ) {
    if (!key)
      return

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
    if (!key)
      return

    super.on(key, listener as Listener<unknown>)

    const count = this.#counts.get(key) ?? 0
    this.#counts.set(key, count + 1)

    const timeout = this.#timeouts.get(key)

    if (timeout === undefined)
      return

    clearTimeout(timeout)
    this.#timeouts.delete(key)
  }

  async off<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: Params<D, K> = {}
  ) {
    if (!key)
      return

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

    if (current?.expiration === undefined)
      return
    if (current?.expiration === -1)
      return

    const erase = async () => {
      if (!this.#mounted)
        return

      const count = this.#counts.get(key)

      if (count !== undefined)
        return

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