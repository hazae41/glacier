import { Mutex } from "@hazae41/mutex"
import { Optional } from "@hazae41/option"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { Data, DataState, Fail, FailState, FakeState, Fetched, RealState, State, StoredState } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
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

export class PendingFetchError extends Error {
  readonly #class = PendingFetchError
  readonly name = this.#class.name

  constructor() {
    super(`A fetch is already pending`)
  }

}

export class TimeoutError extends Error {
  readonly #class = TimeoutError
  readonly name = this.#class.name

  constructor() {
    super(`Timed out`)
  }

}

export class CooldownError extends Error {
  readonly #class = CooldownError
  readonly name = this.#class.name

  constructor() {
    super(`Cooled down`)
  }

}

export class ScrollError extends Error {
  readonly #class = ScrollError
  readonly name = this.#class.name

  constructor() {
    super(`Scroller returned undefined`)
  }

}

export class MissingKeyError extends Error {
  readonly #class = MissingKeyError
  readonly name = this.#class.name

  constructor() {
    super(`Missing a key`)
  }

}

export class MissingFetcherError extends Error {
  readonly #class = MissingFetcherError
  readonly name = this.#class.name

  constructor() {
    super(`Missing a fetcher`)
  }

}

export class AbortedError extends Error {
  readonly #class = AbortedError
  readonly name = this.#class.name

  static from(cause: unknown) {
    return new AbortedError(`Aborted`, { cause })
  }

}

export class Core {

  readonly states = new Ortho<string, State>()
  readonly aborters = new Ortho<string, Optional<AbortController>>()

  readonly #states = new Map<string, State>()

  readonly #optimisers = new Map<string, Map<string, Mutator<any>>>()

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

  aborter(cacheKey: string) {
    return this.#aborters.get(cacheKey)
  }

  async fetchOrError<T, E>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<T, E>>): Promise<Result<T, E | PendingFetchError>> {
    let mutex = this.#fetches.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#fetches.set(cacheKey, mutex)
    }

    const pending = this.#aborters.get(cacheKey)

    if (pending !== undefined)
      return new Err(new PendingFetchError())

    const result = await mutex.lock(async () => {
      this.#aborters.set(cacheKey, aborter)
      this.aborters.publish(cacheKey, aborter)

      const result = await callback()

      this.#aborters.delete(cacheKey)
      this.aborters.publish(cacheKey, undefined)

      return result
    })

    return result
  }

  async abortAndFetch<T, E>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
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
        const substate = new DataState<D, unknown>(data)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const substate = new FailState<D, unknown>(fail)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      throw new Panic(`Invalid stored state`)
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const substate = new DataState<D, unknown>(data)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const substate = new FailState<D, unknown>(fail)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
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
        const substate = new DataState<D, unknown>(data)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const substate = new FailState<D, unknown>(fail)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      throw new Panic(`Invalid stored state`)
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const substate = new DataState<D, unknown>(data)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const substate = new FailState<D, unknown>(fail)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
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

      if (state === previous)
        return state

      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)

      const { storage } = params

      if (!storage?.storage)
        return state

      if (state.real === undefined) {
        await storage.storage.delete(cacheKey, storage as any)
        return state
      }

      const { time, cooldown, expiration } = state.real.current

      let stored: StoredState<D>

      if (state.real.current.isData()) {
        const data = { inner: state.real.current.data }
        stored = { version: 2, data, time, cooldown, expiration }
      } else {
        const error = { inner: state.real.current.error }
        stored = { version: 2, error, time, cooldown, expiration }
      }

      await storage.storage.set(cacheKey, stored, storage as any)
      return state
    })
  }

  #mergeRealStateWithFetched<D>(previous: State<D>, fetched: Optional<Fetched<D>>): RealState<D> {
    if (fetched === undefined)
      return new RealState(undefined)

    const times = { ...previous.real?.current, ...fetched }

    if (fetched.isData())
      return new RealState(new DataState(new Data(fetched.data, times)))
    return new RealState(new FailState(new Fail(fetched.error, times), previous.real?.data))
  }

  #mergeFakeStateWithFetched<D>(previous: State<D>, fetched: Optional<Fetched<D>>): FakeState<D> {
    if (fetched === undefined)
      return new FakeState(undefined, previous.real)

    const times = { ...previous.current?.current, ...fetched }

    if (fetched.isData())
      return new FakeState(new DataState(new Data(fetched.inner, times)), previous.real)
    return new FakeState(new FailState(new Fail(fetched.inner, times), previous.current?.data), previous.real)
  }

  /**
   * Apply fetched result to previous state, optimize it, and publish it
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param params 
   * @returns 
   */
  async mutate<D, K>(cacheKey: string, mutator: Mutator<D>, params: QueryParams<D, K>): Promise<State<D>> {
    return await this.#replace(cacheKey, async (previous) => {
      const { equals = DEFAULT_EQUALS } = params

      const fetched = await mutator(previous)

      let next: RealState<D, unknown> = this.#mergeRealStateWithFetched(previous, fetched)

      if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
        return previous

      if (next.real?.current.isData())
        next = new RealState(new DataState(await this.#normalize(next.real.current, params)))

      if (next.real?.current.isData() && previous.real?.current.isData() && equals(next.real.current.inner, previous.real.current.inner))
        return previous

      if (next.real?.current.isFail() && previous.real?.current.isFail() && equals(next.real.current.inner, previous.real.current.inner))
        return previous

      const optimizers = this.#getOrCreateOptimizers<D>(cacheKey)
      return await this.#reoptimize(next, optimizers)
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

  #getOrCreateOptimizers<D>(cacheKey: string): Map<string, Mutator<D>> {
    const current = this.#optimisers.get(cacheKey)

    if (current !== undefined)
      return current as Map<string, Mutator<D>>

    const next = new Map<string, Mutator>()
    this.#optimisers.set(cacheKey, next)
    return next as Map<string, Mutator<D>>
  }

  /**
   * Erase and reapply all optimizations
   * @param cacheKey 
   * @param state 
   * @param params 
   * @returns 
   */
  async #reoptimize<D, K>(state: State<D>, optimizers: Map<string, Mutator<D>>): Promise<State<D>> {
    let optimized: State<D> = new RealState<D>(state.real)

    for (const optimizer of optimizers.values())
      optimized = this.#mergeFakeStateWithFetched(optimized, await optimizer(optimized))

    return optimized
  }

  async optimize<D, K>(cacheKey: string, uuid: string, optimizer: Mutator<D>, params: QueryParams<D, K>) {
    return await this.#replace(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D>(cacheKey)

      if (optimizers.has(uuid)) {
        optimizers.delete(uuid)

        previous = await this.#reoptimize(previous, optimizers)
      }

      optimizers.set(uuid, optimizer)

      return this.#mergeFakeStateWithFetched(previous, await optimizer(previous))
    }, params)
  }

  async deoptimize<D, K>(cacheKey: string, uuid: string, params: QueryParams<D, K>) {
    return await this.#replace(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D>(cacheKey)

      optimizers.delete(uuid)

      return this.#reoptimize(previous, optimizers)
    }, params)
  }

  async catchAndTimeout<T>(callback: (signal: AbortSignal) => Promiseable<T>, aborter: AbortController, delay?: number): Promise<Result<T, AbortedError>> {
    const timeout = delay ? setTimeout(() => {
      aborter.abort(new TimeoutError())
    }, delay) : undefined

    try {
      const result = await callback(aborter.signal)

      if (aborter.signal.aborted)
        return new Err(AbortedError.from(aborter.signal.reason))

      return new Ok(result)
    } catch (e: unknown) {
      return new Err(AbortedError.from(e))
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Transform children into refs and normalize them
   * @param data 
   * @param params 
   * @returns 
   */
  async #normalize<D, K>(data: Data<D>, params: QueryParams<D, K>) {
    if (params.normalizer === undefined)
      return data
    const more = { core: this, times: data, shallow: false }
    const normalized = await params.normalizer(data.inner, more)
    return new Data(normalized, data)
  }

  /**
   * Transform children into refs but do not normalize them
   * @param data 
   * @param params 
   * @returns 
   */
  async prenormalize<D, K>(data: Data<D>, params: QueryParams<D, K>) {
    if (params.normalizer === undefined)
      return data
    const more = { core: this, times: data, shallow: true }
    const normalized = await params.normalizer(data.inner, more)
    return new Data(normalized, data)
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

    if (current?.real?.current.expiration === undefined)
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

    if (Date.now() > current.real.current.expiration) {
      await erase()
      return
    }

    const delay = current.real.current.expiration - Date.now()
    const timeout = setTimeout(erase, delay)
    this.#timeouts.set(cacheKey, timeout)
  }
}