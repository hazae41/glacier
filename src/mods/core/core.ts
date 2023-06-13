import { Mutex } from "@hazae41/mutex"
import { Option, Optional, Some } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { Mutator, Setter } from "mods/types/mutator.js"
import { GlobalSettings, QuerySettings } from "mods/types/settings.js"
import { DataState, FailState, FakeState, RealState, State, StoredState } from "mods/types/state.js"

export type Listener<D, F> =
  (x: Optional<State<D, F>>) => void

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

interface Counter {
  value: number,
  timeout?: NodeJS.Timeout
}

export class Core {

  readonly states = new Ortho<string, State<any, any>>()
  readonly aborters = new Ortho<string, Optional<AbortController>>()

  readonly #states = new Map<string, State<any, any>>()

  readonly #optimisers = new Map<string, Map<string, Mutator<any, any>>>()

  readonly #counters = new Mutex(new Map<string, Counter>())

  readonly #fetches = new Map<string, Mutex<void>>()
  readonly #replaces = new Map<string, Mutex<void>>()

  readonly #aborters = new Map<string, AbortController>()

  #mounted = true

  constructor(
    readonly settings: GlobalSettings
  ) {
    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  clean() {
    for (const counter of this.#counters.inner.values())
      clearTimeout(counter.timeout)
    this.#mounted = false
  }

  getAborter(cacheKey: string) {
    return this.#aborters.get(cacheKey)
  }

  async lockOrError<T, E>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<T, E>>): Promise<Result<T, E | PendingFetchError>> {
    let mutex = this.#fetches.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#fetches.set(cacheKey, mutex)
    }

    const pending = this.#aborters.get(cacheKey)

    if (pending !== undefined)
      return new Err(new PendingFetchError())

    return await mutex.lock(async () => {
      this.#aborters.set(cacheKey, aborter)
      this.aborters.publish(cacheKey, aborter)

      const result = await callback()

      this.#aborters.delete(cacheKey)
      this.aborters.publish(cacheKey, undefined)

      return result
    })
  }

  async abortAndLock<T, E>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    let mutex = this.#fetches.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#fetches.set(cacheKey, mutex)
    }

    this.#aborters.get(cacheKey)?.abort(`Replaced`)

    return await mutex.lock(async () => {
      try {
        this.#aborters.set(cacheKey, aborter)
        this.aborters.publish(cacheKey, aborter)

        return await callback()
      } finally {
        this.#aborters.delete(cacheKey)
        this.aborters.publish(cacheKey, undefined)
      }
    })
  }

  getSync<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Result<State<D, F>, AsyncStorageError> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return new Ok(cached)

    if (!settings.storage) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    if (settings.storage.storage.async)
      return new Err(new AsyncStorageError())

    const stored = settings.storage.storage.get<D, F>(cacheKey, settings.storage as any)

    if (stored === undefined) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      if (stored.data !== undefined) {
        const data = new Data(stored.data, times)
        const substate = new DataState<D, F>(data)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const substate = new FailState<D, F>(fail)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const substate = new DataState<D, F>(data)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const substate = new FailState<D, F>(fail)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    const state = new RealState<D, F>(undefined)
    this.#states.set(cacheKey, state)
    this.states.publish(cacheKey, state)
    return new Ok(state)
  }

  async get<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return cached

    if (!settings.storage) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    const stored = await settings.storage.storage.get<D, F>(cacheKey, settings.storage as any)

    if (stored === undefined) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      if (stored.data !== undefined) {
        const data = new Data(stored.data, times)
        const substate = new DataState<D, F>(data)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      if (stored.error !== undefined) {
        const fail = new Fail(stored.error, times)
        const substate = new FailState<D, F>(fail)
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const substate = new DataState<D, F>(data)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const substate = new FailState<D, F>(fail)
      const state = new RealState(substate)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    const state = new RealState<D, F>(undefined)
    this.#states.set(cacheKey, state)
    this.states.publish(cacheKey, state)
    return state
  }

  async #replace<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>) {
    let mutex = this.#replaces.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#replaces.set(cacheKey, mutex)
    }

    return await mutex.lock(async () => {
      const previous = await this.get(cacheKey, settings)
      const state = await setter(previous)

      if (state === previous)
        return state

      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)

      const { storage } = settings

      if (!storage?.storage)
        return state

      if (state.real === undefined) {
        await storage.storage.delete(cacheKey, storage as any)
        return state
      }

      const { time, cooldown, expiration } = state.real.current

      let stored: StoredState<D, F>

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

  #mergeRealStateWithFetched<D, F>(previous: State<D, F>, fetched: Optional<Fetched<D, F>>): RealState<D, F> {
    if (fetched === undefined)
      return new RealState(undefined)

    if (fetched.isData())
      return new RealState(new DataState(fetched))
    return new RealState(new FailState(fetched, previous.real?.data))
  }

  #mergeFakeStateWithFetched<D, F>(previous: State<D, F>, fetched: Optional<Fetched<D, F>>): FakeState<D, F> {
    if (fetched === undefined)
      return new FakeState(undefined, previous.real)

    if (fetched.isData())
      return new FakeState(new DataState(fetched), previous.real)
    return new FakeState(new FailState(fetched, previous.data), previous.real)
  }

  /**
   * Apply fetched result to previous state, optimize it, and publish it
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param settings 
   * @returns 
   */
  async mutate<K, D, F>(cacheKey: string, mutator: Mutator<D, F>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    return await this.#replace(cacheKey, async (previous) => {
      const { equals = DEFAULT_EQUALS } = settings

      const init = await mutator(previous)

      if (init.isNone())
        return previous

      const fetched = Option.mapSync(init.get(), Fetched.from)

      let next: RealState<D, F> = this.#mergeRealStateWithFetched(previous, fetched)

      if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
        return previous

      if (next.real?.current.isData())
        next = new RealState(new DataState(await this.#normalize(next.real.current, settings)))

      if (next.real?.current.isData() && previous.real?.current.isData() && equals(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new DataState(new Data(previous.real.current.inner, next.real.current)))

      if (next.real?.current.isFail() && previous.real?.current.isFail() && equals(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new FailState(new Fail(previous.real.current.inner, next.real.current), previous.real.data))

      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)
      return await this.#reoptimize(next, optimizers)
    }, settings)
  }

  /**
   * Mutate real state to undefined (keep fake state)
   * @param cacheKey 
   * @param settings 
   * @returns 
   */
  async delete<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.mutate(cacheKey, () => new Some(undefined), settings)
  }

  #getOrCreateOptimizers<D, F>(cacheKey: string): Map<string, Mutator<D, F>> {
    const current = this.#optimisers.get(cacheKey)

    if (current !== undefined)
      return current

    const next = new Map<string, Mutator<D, F>>()
    this.#optimisers.set(cacheKey, next)
    return next
  }


  /**
   * Erase and reapply all optimizations
   * @param state 
   * @param optimizers 
   * @returns 
   */
  async #reoptimize<D, F>(state: State<D, F>, optimizers: Map<string, Mutator<D, F>>): Promise<State<D, F>> {
    let reoptimized: State<D, F> = new RealState(state.real)

    for (const optimizer of optimizers.values()) {
      const optimized = await optimizer(reoptimized)

      if (optimized.isNone())
        continue

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      reoptimized = this.#mergeFakeStateWithFetched(reoptimized, fetched)
    }

    return reoptimized
  }

  async reoptimize<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.#replace(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)

      return this.#reoptimize(previous, optimizers)
    }, settings)
  }

  async optimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.#replace(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)

      if (optimizers.has(uuid)) {
        optimizers.delete(uuid)

        previous = await this.#reoptimize(previous, optimizers)
      }

      optimizers.set(uuid, optimizer)

      const optimized = await optimizer(previous)

      if (optimized.isNone())
        return previous

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      return this.#mergeFakeStateWithFetched(previous, fetched)
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    this.#getOrCreateOptimizers(cacheKey).delete(uuid)
  }

  async runWithTimeout<T>(
    callback: (signal: AbortSignal) => Promiseable<T>,
    aborter: AbortController,
    delay?: number
  ): Promise<Result<T, AbortedError>> {
    const timeout = delay ? setTimeout(() => {
      aborter.abort(new TimeoutError())
    }, delay) : undefined

    try {
      const result = await callback(aborter.signal)

      if (aborter.signal.aborted)
        return new Err(AbortedError.from(aborter.signal.reason))

      return new Ok(result)
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Transform children into refs and normalize them
   * @param data 
   * @param settings 
   * @returns 
   */
  async #normalize<K, D, F>(data: Data<D>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer === undefined)
      return data

    const more = { core: this, times: data, shallow: false }
    const normalized = await settings.normalizer(data.inner, more)

    return new Data(normalized, data)
  }

  /**
   * Transform children into refs but do not normalize them
   * @param data 
   * @param settings 
   * @returns 
   */
  async prenormalize<K, D, F>(data: Data<D>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer === undefined)
      return data

    const more = { core: this, times: data, shallow: true }
    const normalized = await settings.normalizer(data.inner, more)

    return new Data(normalized, data)
  }

  async increment<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    await this.#counters.lock(async counts => {
      let counter = counts.get(cacheKey)

      if (counter === undefined) {
        counter = { value: 0 }
        counts.set(cacheKey, counter)
      }

      counter.value++
      clearTimeout(counter.timeout)
    })
  }

  async decrement<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const eraseAfterTimeout = async () => {
      if (!this.#mounted)
        return

      const counter = this.#counters.inner.get(cacheKey)

      if (counter === undefined)
        return

      if (counter.value > 0)
        return

      await this.delete(cacheKey, settings)
    }

    await this.#counters.lock(async (counters) => {
      const counter = counters.get(cacheKey)

      if (counter === undefined)
        return

      counter.value--

      if (counter.value > 0)
        return

      const current = this.#states.get(cacheKey)
      const expiration = current?.real?.current.expiration

      if (expiration === undefined)
        return

      if (Date.now() > expiration) {
        await this.delete(cacheKey, settings)
        return
      }

      const delay = expiration - Date.now()
      counter.timeout = setTimeout(eraseAfterTimeout, delay)
    })
  }
}