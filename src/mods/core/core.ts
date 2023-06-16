import { Future } from "@hazae41/future"
import { Mutex } from "@hazae41/mutex"
import { None, Option, Optional, Some } from "@hazae41/option"
import { Err, Ok, Result } from "@hazae41/result"
import { FetchError } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { Bicoder, SyncIdentity } from "mods/serializers/serializer.js"
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

interface Counter {
  value: number,
  timeout?: NodeJS.Timeout
}

interface Slot<T> {
  current?: T
}

interface Pending<D, F> {
  aborter: AbortController
  promise: Promise<Result<State<D, F>, FetchError>>
}

export interface Metadata {
  readonly stateMutex: Mutex<Slot<State<any, any>>>,
  readonly pendingMutex: Mutex<Slot<Pending<any, any>>>,
  readonly fetchMutex: Mutex<void>,
  readonly optimizersMutex: Mutex<Map<string, Mutator<any, any>>>
  readonly counterMutex: Mutex<Counter>,
}

export class Core {

  readonly states = new Ortho<string, State<any, any>>()
  readonly aborters = new Ortho<string, Optional<AbortController>>()

  readonly #metadatas = new Mutex(new Map<string, Metadata>())

  #mounted = true

  constructor(
    readonly settings: GlobalSettings
  ) {
    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  clean() {
    for (const metadata of this.#metadatas.inner.values())
      clearTimeout(metadata.counterMutex.inner.timeout)
    this.#mounted = false
  }

  getAborterSync(cacheKey: string): Optional<AbortController> {
    return this.#metadatas.inner.get(cacheKey)?.pendingMutex.inner.current?.aborter
  }

  getStateSync<D, F>(cacheKey: string): Optional<State<D, F>> {
    return this.#metadatas.inner.get(cacheKey)?.stateMutex.inner.current
  }

  async #getOrCreateMetadata(cacheKey: string) {
    const metadata = this.#metadatas.inner.get(cacheKey)

    if (metadata !== undefined)
      return metadata

    return await this.#metadatas.lock(async (inner) => {
      let metadata = inner.get(cacheKey)

      if (metadata !== undefined)
        return metadata

      const stateMutex = new Mutex({})
      const pendingMutex = new Mutex({})
      const fetchMutex = new Mutex(undefined)
      const counterMutex = new Mutex({ value: 0 })
      const optimizersMutex = new Mutex(new Map())

      metadata = { stateMutex, pendingMutex, fetchMutex, counterMutex, optimizersMutex }

      inner.set(cacheKey, metadata)
      return metadata
    })
  }

  async lockOrWait<D, F>(cacheKey: string, pendingLock: Future<void>, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<State<D, F>, FetchError>> {
    const { fetchMutex, pendingMutex } = await this.#getOrCreateMetadata(cacheKey)

    return await fetchMutex.lock(async () => {
      try {
        const promise = callback()

        pendingMutex.inner.current = { aborter, promise }
        this.aborters.publish(cacheKey, aborter)
        pendingLock.resolve()

        return await promise
      } finally {
        await pendingMutex.lock(async (pendingSlot) => {
          pendingSlot.current = undefined
          this.aborters.publish(cacheKey, undefined)
        })
      }
    })
  }

  async lockOrError<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<Result<State<D, F>, FetchError>, PendingFetchError>> {
    const { pendingMutex } = await this.#getOrCreateMetadata(cacheKey)

    const pendingLock = new Future<void>()

    try {
      await pendingMutex.lock(() => pendingLock.promise)

      if (pendingMutex.inner.current !== undefined)
        return new Err(new PendingFetchError())

      return new Ok(await this.lockOrWait(cacheKey, pendingLock, aborter, callback))
    } finally {
      pendingLock.resolve()
    }
  }

  async lockOrReplace<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<State<D, F>, FetchError>> {
    const { pendingMutex } = await this.#getOrCreateMetadata(cacheKey)

    const pendingLock = new Future<void>()

    try {
      await pendingMutex.lock(() => pendingLock.promise)

      pendingMutex.inner.current?.aborter.abort(`Replaced`)

      return await this.lockOrWait(cacheKey, pendingLock, aborter, callback)
    } finally {
      pendingLock.resolve()
    }
  }

  async lockOrJoin<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<State<D, F>, FetchError>> {
    const { pendingMutex } = await this.#getOrCreateMetadata(cacheKey)

    const pendingLock = new Future<void>()

    try {
      await pendingMutex.lock(() => pendingLock.promise)

      if (pendingMutex.inner.current !== undefined)
        return await pendingMutex.inner.current.promise

      return await this.lockOrWait(cacheKey, pendingLock, aborter, callback)
    } finally {
      pendingLock.resolve()
    }
  }

  async #get<K, D, F>(cacheKey: string, stateSlot: Slot<State<D, F>>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const cached = stateSlot.current

    if (cached !== undefined)
      return cached

    const stored = await settings.storage?.get(cacheKey)
    const state = await this.unstore(stored, settings)
    stateSlot.current = state
    this.states.publish(cacheKey, state)
    return state
  }

  async get<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const { stateMutex } = await this.#getOrCreateMetadata(cacheKey)

    const cached = stateMutex.inner.current

    if (cached !== undefined)
      return cached

    return await stateMutex.lock(async (stateSlot) => await this.#get(cacheKey, stateSlot, settings))
  }

  async store<K, D, F>(state: State<D, F>, settings: QuerySettings<K, D, F>): Promise<Optional<StoredState<unknown, unknown>>> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (state.real === undefined)
      return undefined

    const { time, cooldown, expiration } = state.real.current

    const data = await Option.map(state.real.data, d => d.map(dataSerializer.stringify))
    const error = await Option.map(state.real.error, d => d.mapErr(errorSerializer.stringify))

    return { version: 2, data, error, time, cooldown, expiration }
  }

  async unstore<K, D, F>(stored: Optional<StoredState<unknown, unknown>>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (stored === undefined)
      return new RealState<D, F>(undefined)

    if (stored.version === undefined) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      const data = Option.wrap(stored.data).mapSync(x => new Data(dataSerializer.parse(x) as D, times))
      const error = Option.wrap(stored.error).mapSync(x => new Fail(errorSerializer.parse(x) as F, times))

      if (error.isSome())
        return new RealState(new FailState<D, F>(error.get(), data.get()))

      if (data.isSome())
        return new RealState(new DataState<D, F>(data.get()))

      return new RealState<D, F>(undefined)
    }

    if (stored.version === 2) {
      const data = await Option.wrap(stored.data).map(x => Data.from(x).map(dataSerializer.parse))
      const error = await Option.wrap(stored.error).map(x => Fail.from(x).mapErr(errorSerializer.parse))

      if (error.isSome())
        return new RealState(new FailState<D, F>(error.get(), data.get()))

      if (data.isSome())
        return new RealState(new DataState<D, F>(data.get()))

      return new RealState<D, F>(undefined)
    }

    return new RealState<D, F>(undefined)
  }

  /**
   * Set full state and store it in storage
   * @param cacheKey 
   * @param setter 
   * @param settings 
   * @returns 
   */
  async set<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>) {
    const { stateMutex } = await this.#getOrCreateMetadata(cacheKey)

    return await stateMutex.lock(async (stateSlot) => {
      const previous = await this.#get(cacheKey, stateSlot, settings)

      const set = await setter(previous)

      if (set.isNone())
        return previous

      if (set.get() === previous)
        return previous

      const next = set.get()

      stateSlot.current = next
      this.states.publish(cacheKey, next)

      if (!settings.storage)
        return next

      const stored = await this.store(next, settings)

      if (stored === undefined) {
        await settings.storage.delete(cacheKey)
        return next
      }

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

      const { optimizersMutex } = await this.#getOrCreateMetadata(cacheKey)

      const optimized = await optimizersMutex.lock(async (optimizers) =>
        await this.#reoptimize(next, optimizers))

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
      const { optimizersMutex } = await this.#getOrCreateMetadata(cacheKey)

      const optimized = await optimizersMutex.lock(async (optimizers) =>
        await this.#reoptimize(previous, optimizers))

      return new Some(optimized)
    }, settings)
  }

  async optimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.set(cacheKey, async (previous) => {
      const { optimizersMutex } = await this.#getOrCreateMetadata(cacheKey)

      return await optimizersMutex.lock(async (optimizers) => {
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
      })
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    const { optimizersMutex } = await this.#getOrCreateMetadata(cacheKey)

    return await optimizersMutex.lock(async (optimizers) => optimizers.delete(uuid))
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
    const { counterMutex } = await this.#getOrCreateMetadata(cacheKey)

    await counterMutex.lock(async (counter) => {
      counter.value++
      clearTimeout(counter.timeout)
      counter.timeout = undefined
    })
  }

  async decrement<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const { counterMutex, stateMutex } = await this.#getOrCreateMetadata(cacheKey)

    const eraseAfterTimeout = async () => {
      if (!this.#mounted)
        return

      if (counterMutex.inner.value > 0)
        return
      await this.delete(cacheKey, settings)
    }

    await counterMutex.lock(async (counter) => {
      counter.value--

      if (counter.value > 0)
        return

      const expiration = stateMutex.inner.current?.real?.current.expiration

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