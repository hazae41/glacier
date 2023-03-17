import { Mutex } from "@hazae41/mutex"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Equals } from "mods/equals/equals.js"
import { isAsyncStorage } from "mods/storages/storage.js"
import { FullMutator, Mutator } from "mods/types/mutator.js"
import { OptimisticParams } from "mods/types/optimism.js"
import { GlobalParams, QueryParams } from "mods/types/params.js"
import { State } from "mods/types/state.js"

export type Listener<D> =
  (x?: State<D>) => void

export class Core extends Ortho<string, State | undefined> {

  readonly #states = new Map<string, State>()
  readonly #optimisers = new Map<string, Map<number, Mutator<any>>>()

  readonly #counts = new Map<string, number>()
  readonly #timeouts = new Map<string, NodeJS.Timeout>()

  readonly #mutexes = new Map<string, Mutex>()
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

  aborter(storageKey?: string) {
    if (!storageKey) return

    return this.#aborters.get(storageKey)
  }

  optimistic(storageKey?: string) {
    if (!storageKey) return

    const optimisers = this.#optimisers.get(storageKey)

    return Boolean(optimisers?.size)
  }

  async lock<T>(
    storageKey: string,
    callback: () => Promise<T>,
    aborter = new AbortController(),
    replacePending = false
  ) {
    let mutex = this.#mutexes.get(storageKey)

    if (mutex === undefined) {
      mutex = new Mutex()
      this.#mutexes.set(storageKey, mutex)
    }

    const pending = this.#aborters.get(storageKey)

    if (pending)
      if (replacePending)
        pending.abort(`Replaced`)
      else
        return

    return await mutex.lock(async () => {
      this.#aborters.set(storageKey, aborter)

      const result = await callback()

      this.#aborters.delete(storageKey)

      return result
    })
  }

  async run<D, K>(
    storageKey: string,
    callback: () => Promise<Mutator<D>>,
    aborter: AbortController,
    params: QueryParams<D, K> = {},
  ) {
    await this.apply(storageKey, () => ({ aborter }), params)

    const mutator = await callback()

    return await this.apply(storageKey, (previous) => {
      const mutated: State<D> | undefined = mutator(previous)

      if (mutated === undefined)
        return mutated

      mutated.error = mutated.error

      mutated.realData = mutated.data
      mutated.realTime = mutated.time

      mutated.aborter = undefined

      return mutated
    }, params)
  }

  getSync<D, K>(
    storageKey: string | undefined,
    params: QueryParams<D, K> = {}
  ): State<D> | undefined | null {
    if (storageKey === undefined)
      return

    if (this.#states.has(storageKey)) {
      const cached = this.#states.get(storageKey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return undefined
    if (isAsyncStorage(storage))
      return null

    const state = storage.get<State<D>>(storageKey)

    if (state !== undefined)
      this.#states.set(storageKey, state)

    return state
  }

  async get<D, K>(
    storageKey: string | undefined,
    params: QueryParams<D, K> = {},
    ignore = false
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

    if (this.#states.has(storageKey)) {
      const cached = this.#states.get(storageKey)
      return cached as State<D>
    }

    const { storage } = params

    if (!storage)
      return

    const state = await storage.get<State<D>>(storageKey, ignore)

    if (state !== undefined)
      this.#states.set(storageKey, state)

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
    params: QueryParams<D, K> = {}
  ) {
    if (storageKey === undefined)
      return

    this.#states.set(storageKey, state)
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
    params: QueryParams<D, K> = {}
  ) {
    if (!storageKey)
      return

    this.#states.delete(storageKey)
    this.#mutexes.delete(storageKey)
    this.publish(storageKey, undefined)

    const { storage } = params

    if (!storage)
      return

    await storage.delete(storageKey)
  }

  async mutate<D, K>(
    storageKey: string | undefined,
    mutator: Mutator<D>,
    params: QueryParams<D, K> = {}
  ) {
    return await this.apply(storageKey, (previous) => {
      const mutated: State<D> | undefined = mutator(previous)

      if (mutated === undefined)
        return mutated

      mutated.time ??= Date.now()
      mutated.error = mutated.error

      mutated.realData = mutated.data
      mutated.realTime = mutated.time

      return mutated
    }, params)
  }

  /**
   * The most important function
   * @param storageKey 
   * @param current 
   * @param mutator 
   * @param params 
   * @returns 
   */
  async apply<D, K>(
    storageKey: string | undefined,
    mutator: FullMutator<D>,
    params: QueryParams<D, K> = {},
    optimistic?: OptimisticParams
  ): Promise<State<D> | undefined> {
    if (storageKey === undefined)
      return

    const {
      equals = DEFAULT_EQUALS
    } = params

    const current = await this.get(storageKey, params)

    let optimisers = this.#optimisers.get(storageKey)

    if (!optimisers) {
      optimisers = new Map()
      this.#optimisers.set(storageKey, optimisers)
    }

    if (optimistic?.action === "set")
      optimisers.set(optimistic.value, mutator)
    if (optimistic?.action === "unset")
      optimisers.delete(optimistic.value)

    let next = current

    if (optimistic?.action !== "set") {
      const mutated = mutator(current)

      next = mutated
        ? { ...next, ...mutated }
        : undefined
    }

    for (const optimiser of optimisers.values()) {
      const optimistic = optimiser(next)

      next = optimistic
        ? { ...next, ...optimistic }
        : undefined
    }

    if (Time.isBefore(next?.time, current?.time))
      return current

    if (next === undefined) {
      await this.delete(storageKey, params)
      return
    }

    next.data = await this.normalize(false, next, params, optimistic)

    if (equals(next.data, current?.data))
      next.data = current?.data

    next.optimistic = Boolean(optimisers.size)

    if (Equals.shallow(next, current))
      return current

    await this.set(storageKey, next, params)

    return next as State<D>
  }

  async normalize<D, K>(
    shallow: boolean,
    root: State<D>,
    params: QueryParams<D, K> = {},
    optimistic?: OptimisticParams
  ) {
    if (root.data === undefined)
      return

    if (params.normalizer === undefined)
      return root.data

    return await params.normalizer(root.data, { core: this, shallow, root, optimistic })
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
    key: string | undefined,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
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
    params: QueryParams<D, K> = {}
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
    if (current?.expiration < 0)
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