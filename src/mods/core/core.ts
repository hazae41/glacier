import { Mutex } from "@hazae41/mutex"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Equals } from "mods/equals/equals.js"
import { FullMutator, Mutator } from "mods/types/mutator.js"
import { OptimisticParams } from "mods/types/optimism.js"
import { GlobalParams, QueryParams, SyncStorageQueryParams } from "mods/types/params.js"
import { State } from "mods/types/state.js"

export type Listener<D> =
  (x?: State<D>) => void

export class Core extends Ortho<string, State | undefined> {

  readonly #states = new Map<string, State>()

  readonly #optimisersByKey = new Map<string, Map<string, Mutator<any>>>()

  readonly #counts = new Map<string, number>()
  readonly #timeouts = new Map<string, NodeJS.Timeout>()

  readonly #mutexes = new Map<string, Mutex<undefined>>()
  readonly #aborters = new Map<string, AbortController>()

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

  async lock<T>(
    cacheKey: string,
    callback: () => Promise<T>,
    aborter = new AbortController(),
    replacePending = false
  ) {
    let mutex = this.#mutexes.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#mutexes.set(cacheKey, mutex)
    }

    const pending = this.#aborters.get(cacheKey)

    if (pending)
      if (replacePending)
        pending.abort(`Replaced`)
      else
        return

    return await mutex.lock(async () => {
      this.#aborters.set(cacheKey, aborter)

      const result = await callback()

      this.#aborters.delete(cacheKey)

      return result
    })
  }

  async run<D, K>(
    cacheKey: string,
    callback: () => Promise<Mutator<D>>,
    aborter: AbortController,
    params: QueryParams<D, K> = {},
  ) {
    await this.apply(cacheKey, () => ({ aborter }), params)

    const mutator = await callback()

    return await this.apply(cacheKey, (previous) => {
      const mutated: State<D> | undefined = mutator(previous)

      if (mutated === undefined)
        return mutated

      if ("error" in mutated) {
        mutated.error = mutated.error
      } else {
        mutated.data = mutated.data
        mutated.error = undefined
      }

      mutated.aborter = undefined

      return mutated
    }, params)
  }

  getSync<D, K>(
    cacheKey: string | undefined,
    params: QueryParams<D, K> = {}
  ): State<D> | undefined | null {
    if (cacheKey === undefined)
      return undefined

    if (this.#states.has(cacheKey)) {
      const cached = this.#states.get(cacheKey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage?.storage)
      return undefined
    if (storage.storage.async)
      return null

    const state = storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (state !== undefined)
      this.#states.set(cacheKey, state)

    return state
  }

  async get<D, K>(
    cacheKey: string | undefined,
    params: QueryParams<D, K> = {}
  ): Promise<State<D> | undefined> {
    if (cacheKey === undefined)
      return undefined

    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return cached as State<D>

    const { storage } = params

    if (!storage?.storage)
      return undefined

    const stored = storage.storage.async
      ? await storage.storage.get<D>(cacheKey, storage)
      : storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (stored === undefined)
      return undefined

    const { realData, realTime, cooldown, expiration } = stored
    const state = { data: realData, time: realTime, realData, realTime, cooldown, expiration }

    this.#states.set(cacheKey, state)

    return state
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param cacheKey Key
   * @param state New state
   * @returns 
   */
  async set<D, K>(
    cacheKey: string | undefined,
    state: State<D>,
    params: QueryParams<D, K> = {}
  ) {
    if (cacheKey === undefined)
      return

    this.#states.set(cacheKey, state)
    this.publish(cacheKey, state)

    const { storage } = params

    if (!storage?.storage)
      return

    const { realData, realTime, cooldown, expiration } = state
    const stored = { realData, realTime, cooldown, expiration }

    if (storage.storage.async)
      await storage.storage.set(cacheKey, stored, storage)
    else
      storage.storage.set(cacheKey, stored, storage as SyncStorageQueryParams<D>)
  }

  /**
   * Delete key and publish undefined
   * @param cacheKey 
   * @returns 
   */
  async delete<D, K>(
    cacheKey: string | undefined,
    params: QueryParams<D, K> = {}
  ) {
    if (!cacheKey)
      return

    this.#states.delete(cacheKey)
    this.#mutexes.delete(cacheKey)
    this.#optimisersByKey.delete(cacheKey)
    this.publish(cacheKey, undefined)

    const { storage } = params

    if (!storage?.storage)
      return

    await storage.storage.delete(cacheKey)
  }

  async mutate<D, K>(
    cacheKey: string | undefined,
    mutator: Mutator<D>,
    params: QueryParams<D, K> = {}
  ) {
    return await this.apply(cacheKey, (previous) => {
      const mutated: State<D> | undefined = mutator(previous)

      if (mutated === undefined)
        return mutated

      mutated.time ??= Date.now()

      if ("error" in mutated) {
        mutated.error = mutated.error
      } else {
        mutated.data = mutated.data
        mutated.error = undefined
      }

      return mutated
    }, params)
  }

  /**
   * The most important function
   * @param cacheKey 
   * @param current 
   * @param mutator 
   * @param params 
   * @returns 
   */
  async apply<D, K>(
    cacheKey: string | undefined,
    mutator: FullMutator<D>,
    params: QueryParams<D, K> = {},
    optimistic?: OptimisticParams
  ): Promise<State<D> | undefined> {
    if (cacheKey === undefined)
      return

    const {
      equals = DEFAULT_EQUALS
    } = params

    const current = await this.get(cacheKey, params)

    const mutated = mutator(current)

    if (mutated === undefined) {
      await this.delete(cacheKey, params)
      return
    }

    let next = { ...current, ...mutated }

    if (optimistic?.action !== "set") {
      if (Time.isBefore(next.time, current?.realTime))
        return current

      next.data = await this.normalize(next, params)

      if (equals(next.data, current?.data))
        next.data = current?.data

      next.realData = next.data
      next.realTime = next.time
    }

    /**
     * OPTIMISTIC
     */

    let optimisers = this.#optimisersByKey.get(cacheKey)

    if (!optimisers) {
      optimisers = new Map()
      this.#optimisersByKey.set(cacheKey, optimisers)
    }

    if (optimistic?.action === "set")
      optimisers.set(optimistic.uuid, mutator)
    if (optimistic?.action === "unset")
      optimisers.delete(optimistic.uuid)

    if (optimistic?.action !== "set") {
      for (const optimiser of optimisers.values()) {
        const optimistic = optimiser(next)
        next = { ...next, ...optimistic }
      }
    }

    next.optimistic = Boolean(optimisers.size)

    /**
     * DONE
     */

    if (Equals.shallow(next, current))
      return current

    await this.set(cacheKey, next, params)

    return next as State<D>
  }

  async normalize<D, K>(
    parent: State<D>,
    params: QueryParams<D, K> = {},
    more: { shallow?: boolean } = {}
  ) {
    const { shallow } = more

    if (parent.data === undefined)
      return

    if (params.normalizer === undefined)
      return parent.data

    return await params.normalizer(parent.data, { core: this, parent, shallow })
  }

  once<D, K>(
    key: string | undefined,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
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
    cacheKey: string | undefined,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
  ) {
    if (!cacheKey)
      return

    super.on(cacheKey, listener as Listener<unknown>)

    const count = this.#counts.get(cacheKey) ?? 0
    this.#counts.set(cacheKey, count + 1)

    const timeout = this.#timeouts.get(cacheKey)

    if (timeout === undefined)
      return

    clearTimeout(timeout)
    this.#timeouts.delete(cacheKey)
  }

  async off<D, K>(
    cacheKey: string | undefined,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
  ) {
    if (!cacheKey)
      return

    super.off(cacheKey, listener as Listener<unknown>)

    const count = this.#counts.get(cacheKey)

    if (count === undefined)
      throw new Error("Undefined count")

    if (count > 1) {
      this.#counts.set(cacheKey, count - 1)
      return
    }

    this.#counts.delete(cacheKey)

    const current = this.#states.get(cacheKey)

    if (current?.expiration === undefined)
      return
    if (current.expiration < 0)
      return

    const erase = async () => {
      if (!this.#mounted)
        return

      const count = this.#counts.get(cacheKey)

      if (count !== undefined)
        return

      this.#timeouts.delete(cacheKey)
      await this.delete(cacheKey, params)
    }

    if (Date.now() > current.expiration) {
      await erase()
      return
    }

    const delay = current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.#timeouts.set(cacheKey, timeout)
  }
}