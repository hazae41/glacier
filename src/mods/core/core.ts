import { Mutex } from "@hazae41/mutex"
import { Option, Optional, Some } from "@hazae41/option"
import { Result } from "@hazae41/result"
import { Ortho } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { Bicoder, SyncIdentity } from "mods/serializers/serializer.js"
import { FetchError } from "mods/types/fetcher.js"
import { Mutator, Setter } from "mods/types/mutator.js"
import { QuerySettings } from "mods/types/settings.js"
import { DataState, FailState, FakeState, RawState, RealState, State } from "mods/types/state.js"

export class AsyncStorageError extends Error {
  readonly #class = AsyncStorageError
  readonly name = this.#class.name

  constructor() {
    super(`Storage is asynchronous`)
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

export interface QueryMetadata<D, F> {
  cacheKey: string,
  counter: number,
  state?: State<D, F>,
  timeout?: NodeJS.Timeout
  aborter?: AbortController
  pending?: Promise<Result<State<D, F>, FetchError>>
  optimizers: Map<string, Mutator<D, F>>
}

export class Core {

  readonly onState = new Ortho<State<any, any>>()
  readonly onAborter = new Ortho<Optional<AbortController>>()

  readonly #queries = new Map<string, Mutex<QueryMetadata<any, any>>>()

  readonly raw = new Map<string, Option<RawState>>()

  #mounted = true

  constructor() {
    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  clean() {
    for (const metadata of this.#queries.values())
      clearTimeout(metadata.inner.timeout)
    this.#mounted = false
  }

  getAborterSync(cacheKey: string): Optional<AbortController> {
    return this.#queries.get(cacheKey)?.inner?.aborter
  }

  getStateSync<D, F>(cacheKey: string): Optional<State<D, F>> {
    return this.#queries.get(cacheKey)?.inner?.state
  }

  #getOrCreateMetadata<D, F>(cacheKey: string): Mutex<QueryMetadata<D, F>> {
    let metadata = this.#queries.get(cacheKey)

    if (metadata != null)
      return metadata

    const counter = 0
    const optimizers = new Map()

    metadata = new Mutex({ cacheKey, counter, optimizers })

    this.#queries.set(cacheKey, metadata)
    return metadata
  }

  async fetchOrReplace<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<State<D, F>, FetchError>> {
    const metadata = this.#getOrCreateMetadata(cacheKey)

    if (metadata.inner.aborter != null)
      metadata.inner.aborter.abort()

    try {
      const promise = callback()

      metadata.inner.pending = promise
      metadata.inner.aborter = aborter
      this.onAborter.dispatch(cacheKey, aborter)

      return await promise
    } finally {
      if (metadata.inner.aborter === aborter) {
        metadata.inner.aborter = undefined
        metadata.inner.pending = undefined
        this.onAborter.dispatch(cacheKey, undefined)
      }
    }
  }

  async fetchOrJoin<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, FetchError>>): Promise<Result<State<D, F>, FetchError>> {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    if (metadata.inner.pending != null)
      return await metadata.inner.pending

    try {
      const promise = callback()

      metadata.inner.aborter = aborter
      metadata.inner.pending = promise
      this.onAborter.dispatch(cacheKey, aborter)

      return await promise
    } finally {
      if (metadata.inner.aborter === aborter) {
        metadata.inner.aborter = undefined
        metadata.inner.pending = undefined
        this.onAborter.dispatch(cacheKey, undefined)
      }
    }
  }

  async #get<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    if (metadata.inner.state != null)
      return metadata.inner.state

    const stored = await settings.storage?.get?.(cacheKey)
    const state = await this.unstore(stored, settings)

    metadata.inner.state = state

    this.raw.set(cacheKey, Option.wrap(stored))

    this.onState.dispatch(cacheKey, state)

    return state
  }

  async get<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)
    return await metadata.lock(async () => await this.#get(cacheKey, settings))
  }

  async store<K, D, F>(state: State<D, F>, settings: QuerySettings<K, D, F>): Promise<Optional<RawState>> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (state.real == null)
      return undefined

    const { time, cooldown, expiration } = state.real.current

    const data = await Option.map(state.real.data, d => d.map(dataSerializer.stringify))
    const error = await Option.map(state.real.error, d => d.mapErr(errorSerializer.stringify))

    return { version: 2, data, error, time, cooldown, expiration }
  }

  async unstore<K, D, F>(stored: Optional<RawState>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (stored == null)
      return new RealState<D, F>(undefined)

    if (stored.version == null) {
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
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await metadata.lock(async () => {
      const previous = await this.#get(cacheKey, settings)
      const current = await setter(previous)

      if (current === previous)
        return previous

      const stored = await this.store(current, settings)

      metadata.inner.state = current

      this.raw.set(cacheKey, Option.wrap(stored))
      this.onState.dispatch(cacheKey, current)

      if (settings.storage)
        await settings.storage.set?.(cacheKey, stored)

      await settings.indexer?.({ current, previous })
      return current
    })
  }

  #mergeRealStateWithFetched<D, F>(previous: State<D, F>, fetched: Optional<Fetched<D, F>>): RealState<D, F> {
    if (fetched == null)
      return new RealState(undefined)

    if (fetched.isData())
      return new RealState(new DataState(fetched))

    return new RealState(new FailState(fetched, previous.real?.data))
  }

  #mergeFakeStateWithFetched<D, F>(previous: State<D, F>, fetched: Optional<Fetched<D, F>>): FakeState<D, F> {
    if (fetched == null)
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
    const { dataEqualser = DEFAULT_EQUALS, errorEqualser = DEFAULT_EQUALS } = settings

    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await this.set(cacheKey, async (previous) => {
      const updated = await setter(previous)

      if (updated === previous)
        return previous

      let next = new RealState(updated.real)

      if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
        return previous

      next = this.#mergeRealStateWithFetched(next, await this.#normalize(next.real?.current, settings))

      if (next.real?.current.isData() && previous.real?.current.isData() && dataEqualser(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new DataState(new Data(previous.real.current.inner, next.real.current)))

      if (next.real?.current.isFail() && previous.real?.current.isFail() && errorEqualser(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new FailState(new Fail(previous.real.current.inner, next.real.current), previous.real.data))

      return await this.#reoptimize(metadata.inner, next)
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
        return previous

      const fetched = Option.mapSync(mutate.get(), Fetched.from)
      return this.#mergeRealStateWithFetched(previous, fetched)
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
  async #reoptimize<D, F>(metadata: QueryMetadata<D, F>, state: State<D, F>): Promise<State<D, F>> {
    let reoptimized: State<D, F> = new RealState(state.real)

    for (const optimizer of metadata.optimizers.values()) {
      const optimized = await optimizer(reoptimized)

      if (optimized.isNone())
        continue

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      reoptimized = this.#mergeFakeStateWithFetched(reoptimized, fetched)
    }

    return reoptimized
  }

  async reoptimize<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await this.set(cacheKey, async (previous) => {
      return await this.#reoptimize(metadata.inner, previous)
    }, settings)
  }

  async optimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await this.set(cacheKey, async (previous) => {

      if (metadata.inner.optimizers.has(uuid)) {
        metadata.inner.optimizers.delete(uuid)

        previous = await this.#reoptimize(metadata.inner, previous)
      }

      metadata.inner.optimizers.set(uuid, optimizer)

      const optimized = await optimizer(previous)

      if (optimized.isNone())
        return previous

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      return this.#mergeFakeStateWithFetched(previous, fetched)
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    return this.#getOrCreateMetadata(cacheKey).inner.optimizers.delete(uuid)
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
  async #normalize<K, D, F>(fetched: Optional<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer == null)
      return fetched
    return await settings.normalizer(fetched, { shallow: false })
  }

  /**
   * Transform children into refs but do not normalize them
   * @param data 
   * @param settings 
   * @returns 
   */
  async prenormalize<K, D, F>(fetched: Optional<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer == null)
      return fetched
    return await settings.normalizer(fetched, { shallow: true })
  }

  /**
   * Assume cacheKey changed and reindex it
   * @param cacheKey 
   * @param settings 
   */
  async reindex<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const current = await this.get(cacheKey, settings)
    await settings.indexer?.({ current })
  }

  async increment<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const metadata = this.#getOrCreateMetadata(cacheKey)

    metadata.inner.counter++
    clearTimeout(metadata.inner.timeout)
    metadata.inner.timeout = undefined
  }

  async decrement<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const metadata = this.#getOrCreateMetadata(cacheKey)

    const eraseAfterTimeout = async () => {
      if (!this.#mounted)
        return

      if (metadata.inner.counter > 0)
        return
      await this.delete(cacheKey, settings)
    }

    metadata.inner.counter--

    if (metadata.inner.counter > 0)
      return

    const expiration = metadata.inner.state?.real?.current.expiration

    if (expiration == null)
      return

    if (Date.now() > expiration) {
      await this.delete(cacheKey, settings)
      return
    }

    const delay = expiration - Date.now()
    metadata.inner.timeout = setTimeout(eraseAfterTimeout, delay)
  }
}

export const core = new Core()