import { Mutex } from "@hazae41/mutex"
import { Option } from "@hazae41/option"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { Data, Fail, FakeState, Fetched, RealState, State, StoredState, Times } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { Optional } from "libs/types/optional.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Mutator, Setter } from "mods/types/mutator.js"
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

  readonly #fetches = new Map<string, Mutex<void>>()
  readonly #replaces = new Map<string, Mutex<void>>()

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
    let mutex = this.#fetches.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#fetches.set(cacheKey, mutex)
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
    let mutex = this.#fetches.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#fetches.set(cacheKey, mutex)
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

  async #replace<D, K>(cacheKey: string, setter: Setter<D>, params: QueryParams<D, K>) {
    let mutex = this.#replaces.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#replaces.set(cacheKey, mutex)
    }

    return await mutex.lock(async () => {
      const previous = await this.get(cacheKey, params)
      const state = await setter(previous)

      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)

      const { storage } = params

      if (!storage?.storage)
        return state

      if (state.real === undefined) {
        await storage.storage.delete(cacheKey, storage as any)
        return state
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
      return state
    })
  }

  #mergeRealStateWithFetched<D>(previous: State<D>, fetched: Optional<Fetched<D>>): RealState<D> {
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

  #mergeFakeStateWithFetched<D>(previous: State<D>, fetched: Optional<Fetched<D>>): FakeState<D> {
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
  async mutate<D, K>(cacheKey: string, mutator: Mutator<D>, params: QueryParams<D, K>): Promise<Optional<State<D>>> {
    return await this.#replace(cacheKey, async (previous) => {
      const { equals = DEFAULT_EQUALS } = params

      const fetched = Option.mapSync(await mutator(previous), Fetched.from)

      const next = this.#mergeRealStateWithFetched(previous, fetched)

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
    }, params)
  }

  /**
   * Mutate real state to undefined (keep fake state)
   * @param cacheKey 
   * @param params 
   * @returns 
   */
  async delete<D, K>(cacheKey: string, params: QueryParams<D, K>) {
    return await this.mutate<D, K>(cacheKey, () => undefined, params)
  }

  #getOrCreateOptimizers<D>(cacheKey: string): Set<Mutator<D>> {
    const current = this.#optimisers.get(cacheKey)

    if (current !== undefined)
      return current as Set<Mutator<D>>

    const next = new Set<Mutator>()
    this.#optimisers.set(cacheKey, next)
    return next as Set<Mutator<D>>
  }

  /**
   * Apply all optimizations
   * @param cacheKey 
   * @param state 
   * @param params 
   * @returns 
   */
  async #reoptimize<D, K>(cacheKey: string, state: RealState<D>, params: QueryParams<D, K>): Promise<State<D>> {
    const optimizers = this.#getOrCreateOptimizers<D>(cacheKey)

    let optimized: State<D> = state

    for (const optimizer of optimizers) {
      const fetched = Option.mapSync(await optimizer(optimized), Fetched.from)

      optimized = this.#mergeFakeStateWithFetched(optimized, fetched)
    }

    return optimized
  }

  /**
   * Apply a single optimization
   * @param cacheKey 
   * @param state 
   * @param optimizer 
   * @param params 
   * @returns 
   */
  async #optimize<D, K>(cacheKey: string, state: State<D>, optimizer: Mutator<D>, params: QueryParams<D, K>) {
    this.#getOrCreateOptimizers<D>(cacheKey).add(optimizer)
    const fetched = Option.mapSync(await optimizer(state), Fetched.from)

    return this.#mergeFakeStateWithFetched(state, fetched)
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