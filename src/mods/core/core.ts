import { Mutex } from "@hazae41/mutex"
import { None, Option, Optional, Some } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { SyncBicoder, SyncIdentity } from "mods/serializers/serializer.js"
import { Mutator, Setter } from "mods/types/mutator.js"
import { GlobalSettings, QuerySettings } from "mods/types/settings.js"
import { DataState, FailState, FakeState, RealState, State, StoredState2 } from "mods/types/state.js"

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

  async lockOrReplace<T, E>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
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

    if (settings.storage.async)
      return new Err(new AsyncStorageError())

    const stored = settings.storage.get(cacheKey)

    if (stored === undefined) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return new Ok(state)
    }

    const {
      dataSerializer = SyncIdentity as SyncBicoder<D, unknown>,
      errorSerializer = SyncIdentity as SyncBicoder<F, unknown>
    } = settings

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      const data = Option.wrap(stored.data)
        .mapSync(x => dataSerializer.parse(x) as D)
        .mapSync(x => new Data(x, times))

      const error = Option.wrap(stored.error)
        .mapSync(x => errorSerializer.parse(x) as F)
        .mapSync(x => new Fail(x, times))

      if (error.isSome()) {
        const substate = new FailState<D, F>(error.get(), data.get())
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      if (data.isSome()) {
        const substate = new DataState<D, F>(data.get())
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

    if (stored.version === 2) {
      const data = Option.wrap(stored.data).mapSync(x => Data.from(x).mapSync(dataSerializer.parse))
      const error = Option.wrap(stored.error).mapSync(x => Fail.from(x).mapErrSync(errorSerializer.parse))

      if (error.isSome()) {
        const substate = new FailState<D, F>(error.get(), data.get())
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return new Ok(state)
      }

      if (data.isSome()) {
        const substate = new DataState<D, F>(data.get())
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

    const stored = await settings.storage.get(cacheKey)

    if (stored === undefined) {
      const state = new RealState<D, F>(undefined)
      this.#states.set(cacheKey, state)
      this.states.publish(cacheKey, state)
      return state
    }

    const {
      dataSerializer = SyncIdentity as SyncBicoder<D, unknown>,
      errorSerializer = SyncIdentity as SyncBicoder<F, unknown>
    } = settings

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      const data = Option.wrap(stored.data)
        .mapSync(x => dataSerializer.parse(x) as D)
        .mapSync(x => new Data(x, times))

      const error = Option.wrap(stored.error)
        .mapSync(x => errorSerializer.parse(x) as F)
        .mapSync(x => new Fail(x, times))

      if (error.isSome()) {
        const substate = new FailState<D, F>(error.get(), data.get())
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      if (data.isSome()) {
        const substate = new DataState<D, F>(data.get())
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

    if (stored.version === 2) {
      const data = Option.wrap(stored.data).mapSync(x => Data.from(x).mapSync(dataSerializer.parse))
      const error = Option.wrap(stored.error).mapSync(x => Fail.from(x).mapErrSync(errorSerializer.parse))

      if (error.isSome()) {
        const substate = new FailState<D, F>(error.get(), data.get())
        const state = new RealState(substate)
        this.#states.set(cacheKey, state)
        this.states.publish(cacheKey, state)
        return state
      }

      if (data.isSome()) {
        const substate = new DataState<D, F>(data.get())
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

    const state = new RealState<D, F>(undefined)
    this.#states.set(cacheKey, state)
    this.states.publish(cacheKey, state)
    return state
  }

  /**
   * Set full state and store it in storage
   * @param cacheKey 
   * @param setter 
   * @param settings 
   * @returns 
   */
  async set<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>) {
    let mutex = this.#replaces.get(cacheKey)

    if (mutex === undefined) {
      mutex = new Mutex(undefined)
      this.#replaces.set(cacheKey, mutex)
    }

    return await mutex.lock(async () => {
      const previous = await this.get(cacheKey, settings)
      const set = await setter(previous)

      if (set.isNone())
        return previous

      if (set.get() === previous)
        return previous

      const next = set.get()

      this.#states.set(cacheKey, next)
      this.states.publish(cacheKey, next)

      if (!settings.storage)
        return next

      if (next.real === undefined) {
        await settings.storage.delete(cacheKey)
        return next
      }

      const {
        dataSerializer = SyncIdentity as SyncBicoder<D, unknown>,
        errorSerializer = SyncIdentity as SyncBicoder<F, unknown>
      } = settings

      const { time, cooldown, expiration } = next.real.current

      const data = Option.mapSync(next.real.data, d => d.mapSync(dataSerializer.stringify))
      const error = Option.mapSync(next.real.error, d => d.mapErrSync(errorSerializer.stringify))

      const stored: StoredState2<unknown, unknown> = { version: 2, data, error, time, cooldown, expiration }

      await settings.storage.set(cacheKey, stored)
      return next
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
   * Set real state, compare times, compare data/error, and then reoptimize
   * @param cacheKey 
   * @param setter 
   * @param settings 
   * @returns 
   */
  async update<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>) {
    const { equals = DEFAULT_EQUALS } = settings

    return await this.set(cacheKey, async (previous) => {
      const set = await setter(previous)

      if (set.isNone())
        return new None()

      if (set.get() === previous)
        return new None()

      let next = new RealState(set.get().real)

      if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
        return new None()

      if (next.real?.current.isData())
        next = new RealState(new DataState(await this.#normalize(next.real.current, settings)))

      if (next.real?.current.isData() && previous.real?.current.isData() && equals(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new DataState(new Data(previous.real.current.inner, next.real.current)))

      if (next.real?.current.isFail() && previous.real?.current.isFail() && equals(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new FailState(new Fail(previous.real.current.inner, next.real.current), previous.real.data))

      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)
      const optimized = await this.#reoptimize(next, optimizers)

      return new Some(optimized)
    }, settings)
  }

  /**
   * Apply fetched result to previous state, and update it
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param settings 
   * @returns 
   */
  async mutate<K, D, F>(cacheKey: string, mutator: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.update(cacheKey, async (previous) => {
      const mutate = await mutator(previous)

      if (mutate.isNone())
        return new None()

      const fetched = Option.mapSync(mutate.get(), Fetched.from)
      const next = this.#mergeRealStateWithFetched(previous, fetched)

      return new Some(next)
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
    return await this.set(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)
      const optimized = await this.#reoptimize(previous, optimizers)

      return new Some(optimized)
    }, settings)
  }

  async optimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.set(cacheKey, async (previous) => {
      const optimizers = this.#getOrCreateOptimizers<D, F>(cacheKey)

      if (optimizers.has(uuid)) {
        optimizers.delete(uuid)

        previous = await this.#reoptimize(previous, optimizers)
      }

      optimizers.set(uuid, optimizer)

      const optimized = await optimizer(previous)

      if (optimized.isNone())
        return new None()

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      const next = this.#mergeFakeStateWithFetched(previous, fetched)

      return new Some(next)
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    this.#getOrCreateOptimizers(cacheKey).delete(uuid)
  }

  async runWithTimeout<T>(
    callback: (signal: AbortSignal) => Promiseable<T>,
    aborter: AbortController,
    delay?: number
  ): Promise<T> {
    const timeout = delay ? setTimeout(() => {
      aborter.abort(new TimeoutError())
    }, delay) : undefined

    try {
      return await callback(aborter.signal)
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