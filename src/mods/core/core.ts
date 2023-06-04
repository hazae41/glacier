import { Mutex } from "@hazae41/mutex"
import { Option } from "@hazae41/option"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { Data, Fail, FakeState, Fetched, RealState, State, StoredState, Times } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { Optional } from "libs/types/optional.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Mutator } from "mods/types/mutator.js"
import { GlobalParams, QueryParams } from "mods/types/params.js"

export type Listener<D = unknown> =
  (x: Optional<State<D>>) => void

export class AsyncStorageError extends Error {
  readonly #class = AsyncStorageError
  readonly name = this.#class.name

  constructor() {
    super(`Storage is asynchronous`)
  }

}

export class Core {

  readonly states = new Ortho<string, State>()
  readonly aborters = new Ortho<string, Optional<AbortController>>()

  readonly #states = new Map<string, State>()

  readonly #optimisers = new Map<string, Set<Mutator<any>>>()

  readonly #counts = new Map<string, number>()
  readonly #timeouts = new Map<string, NodeJS.Timeout>()

  readonly #mutexes = new Map<string, Mutex<void>>()
  readonly #mutexes2 = new Map<string, Mutex<void>>()

  readonly #aborters = new Map<string, AbortController>()

  #mounted = true

  constructor(
    readonly params: GlobalParams
  ) { }

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

  async fetch<D, K, T>(cacheKey: string, callback: () => Promise<T>, aborter: AbortController, params: QueryParams<D, K>) {
    let mutex = this.#mutexes.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#mutexes.set(cacheKey, mutex)
    }

    const pending = this.#aborters.get(cacheKey)

    if (pending !== undefined)
      return

    return await mutex.lock(async () => {
      this.#aborters.set(cacheKey, aborter)
      this.aborters.publish(cacheKey, aborter)

      const result = await callback()

      this.#aborters.delete(cacheKey)
      this.aborters.publish(cacheKey, undefined)

      return result
    })
  }

  async abortAndFetch<T>(cacheKey: string, callback: () => Promise<T>, aborter: AbortController) {
    let mutex = this.#mutexes.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#mutexes.set(cacheKey, mutex)
    }

    this.#aborters.get(cacheKey)?.abort(`Replaced`)

    return await mutex.lock(async () => {
      this.#aborters.set(cacheKey, aborter)
      this.aborters.publish(cacheKey, aborter)

      const result = await callback()

      this.#aborters.delete(cacheKey)
      this.aborters.publish(cacheKey, undefined)

      return result
    })
  }

  getSync<D, K>(cacheKey: string, params: QueryParams<D, K>): Result<State<D>, AsyncStorageError> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return new Ok(cached as State<D>)

    if (!params.storage) {
      const state = new RealState<D, unknown>(undefined)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    if (params.storage.storage.async)
      return new Err(new AsyncStorageError())
    const stored = params.storage.storage.get<D>(cacheKey, params.storage as any)

    if (stored === undefined) {
      const state = new RealState<D, unknown>(undefined)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      if (stored.data !== undefined) {
        const data = new Data(stored.data, times)
        const state = new RealState<D, unknown>(data)
        this.#states.set(cacheKey, state)
        return new Ok(state)
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const state = new RealState<D, unknown>(fail)
        this.#states.set(cacheKey, state)
        return new Ok(state)
      }

      throw new Panic(`Invalid stored state`)
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealState<D, unknown>(data)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealState<D, unknown>(fail)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    throw new Panic(`Invalid stored state`)
  }

  async get<D, K>(cacheKey: string, params: QueryParams<D, K>): Promise<State<D>> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return cached as State<D>

    if (!params.storage) {
      const state = new RealState<D, unknown>(undefined)
      this.#states.set(cacheKey, state)
      return state
    }

    const stored = await params.storage.storage.get<D>(cacheKey, params.storage as any)

    if (stored === undefined) {
      const state = new RealState<D, unknown>(undefined)
      this.#states.set(cacheKey, state)
      return state
    }

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      if (stored.data !== undefined) {
        const data = new Data(stored.data, times)
        const state = new RealState<D, unknown>(data)
        this.#states.set(cacheKey, state)
        return state
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const state = new RealState<D, unknown>(fail)
        this.#states.set(cacheKey, state)
        return state
      }

      throw new Panic(`Invalid stored state`)
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealState<D, unknown>(data)
      this.#states.set(cacheKey, state)
      return state
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealState<D, unknown>(fail)
      this.#states.set(cacheKey, state)
      return state
    }

    throw new Panic(`Invalid stored state`)
  }

  /**
   * Force set a key to a state and publish it
   * No check, no merge
   * @param cacheKey Key
   * @param state New state
   * @returns 
   */
  async set<D, K>(cacheKey: string, state: State<D>, params: QueryParams<D, K>) {
    this.#states.set(cacheKey, state)
    this.states.publish(cacheKey, state)

    const { storage } = params

    if (!storage?.storage)
      return

    if (state.real === undefined) {
      await storage.storage.delete(cacheKey, storage as any)
      return
    }

    const { time, cooldown, expiration } = state.real

    let stored: StoredState<D>

    if (state.real.isData()) {
      const data = { inner: state.real.data }
      stored = { version: 2, data, time, cooldown, expiration }
    } else {
      const error = { inner: state.real.error }
      stored = { version: 2, error, time, cooldown, expiration }
    }

    await storage.storage.set(cacheKey, stored, storage as any)
  }

  async delete<D, K>(cacheKey: string, params: QueryParams<D, K>) {
    return await this.set<D, K>(cacheKey, new RealState(undefined), params)
  }

  async mutate<D, K>(cacheKey: string, mutator: Mutator<D>, params: QueryParams<D, K>) {
    let previous = await this.get(cacheKey, params)

    if (previous === undefined)
      previous = new RealState(undefined)

    const fetched = Option.mapSync(mutator(previous), Fetched.from)

    return await this.apply(cacheKey, previous, fetched, params)
  }

  #realMerge<D>(previous: State<D>, fetched: Optional<Fetched<D>>): RealState<D> {
    if (fetched === undefined)
      return new RealState(undefined)

    const times: Times = {
      ...previous.real satisfies Times | undefined,
      ...fetched satisfies Times
    }

    if (fetched.isData())
      return new RealState(new Data(fetched.data, times))
    return new RealState(new Fail(fetched.error, times))
  }

  #fakeMerge<D>(previous: State<D>, fetched: Optional<Fetched<D>>): FakeState<D> {
    if (fetched === undefined)
      return new FakeState(undefined, previous.real)

    const times: Times = {
      ...previous.current satisfies Times | undefined,
      ...fetched satisfies Times
    }

    if (fetched.isData())
      return new FakeState(new Data(fetched.data, times), previous.real)
    return new FakeState(new Fail(fetched.error, times), previous.real)
  }

  /**
   * Apply fetched result to previous state, optimize it, and publish it
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param params 
   * @returns 
   */
  async apply<D, K>(cacheKey: string, previous: State<D>, fetched: Optional<Fetched<D>>, params: QueryParams<D, K>): Promise<Optional<State<D>>> {
    const { equals = DEFAULT_EQUALS } = params

    const next = this.#realMerge(previous, fetched)

    if (next.real !== undefined) {
      if (previous?.real && Time.isBefore(next.real.time, previous.real.time))
        next.real = previous.real

      if (next.real.isData())
        next.real = next.real.set(await this.normalize(next.real.data, params))

      if (next.real.isData() && previous?.real?.isData() && equals(next.real.data, previous.real.data))
        next.real = next.real.set(previous.real.data)

      if (next.real.isFail() && previous?.real?.isFail() && equals(next.real.error, previous.real.error))
        next.real = next.real.setErr(previous.real.error)
    }

    return await this.#reoptimize(cacheKey, next, params)
  }

  getOrCreateOptimizers<D>(cacheKey: string): Set<Mutator<D>> {
    const current = this.#optimisers.get(cacheKey)

    if (current !== undefined)
      return current as Set<Mutator<D>>

    const next = new Set<Mutator>()
    this.#optimisers.set(cacheKey, next)
    return next as Set<Mutator<D>>
  }

  async #reoptimize<D, K>(cacheKey: string, state: RealState<D>, params: QueryParams<D, K>): Promise<State<D>> {
    const optimizers = this.getOrCreateOptimizers<D>(cacheKey)

    let optimized: State<D> = state

    for (const optimizer of optimizers) {
      const fetched = Option.mapSync(optimizer(optimized), Fetched.from)

      optimized = this.#fakeMerge(optimized, fetched)
    }

    await this.set(cacheKey, optimized, params)
    return optimized
  }

  async optimize<D, K>(cacheKey: string, state: State<D>, optimizer: Mutator<D>, params: QueryParams<D, K>) {
    this.getOrCreateOptimizers<D>(cacheKey).add(optimizer)
    const fetched = Option.mapSync(optimizer(state), Fetched.from)

    const optimized = this.#fakeMerge(state, fetched)
    await this.set(cacheKey, optimized, params)
    return optimized
  }

  async normalize<D, K>(data: D, params: QueryParams<D, K>) {
    if (params.normalizer === undefined)
      return data
    return await params.normalizer(data, { core: this, parent, shallow: false })
  }

  async prenormalize<D, K>(data: D, params: QueryParams<D, K>) {
    if (params.normalizer === undefined)
      return data
    return await params.normalizer(data, { core: this, parent, shallow: true })
  }

  async increment<D, K>(cacheKey: string, params: QueryParams<D, K>) {
    const count = this.#counts.get(cacheKey) ?? 0
    this.#counts.set(cacheKey, count + 1)

    const timeout = this.#timeouts.get(cacheKey)

    if (timeout === undefined)
      return
    clearTimeout(timeout)
    this.#timeouts.delete(cacheKey)
  }

  async decrement<D, K>(cacheKey: string, params: QueryParams<D, K>) {
    const count = this.#counts.get(cacheKey)

    if (count === undefined)
      throw new Panic(`Count is undefined`)

    if (count > 1) {
      this.#counts.set(cacheKey, count - 1)
      return
    }

    this.#counts.delete(cacheKey)

    const current = this.#states.get(cacheKey)

    if (current?.real?.expiration === undefined)
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

    if (Date.now() > current.real.expiration) {
      await erase()
      return
    }

    const delay = current.real.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.#timeouts.set(cacheKey, timeout)
  }
}