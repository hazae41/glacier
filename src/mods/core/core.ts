import { Mutex } from "@hazae41/mutex"
import { Nullable, Option, Some } from "@hazae41/option"
import { Ok, Result } from "@hazae41/result"
import { CustomEventTarget } from "libs/ortho/ortho.js"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/result/data.js"
import { Fail } from "mods/result/fail.js"
import { Fetched } from "mods/result/fetched.js"
import { Bicoder, SyncIdentity } from "mods/serializers/coder.js"
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
  pending?: Promise<Result<State<D, F>, Error>>
  optimizers: Map<string, Mutator<D, F>>
}

export class Core {

  readonly onState = new CustomEventTarget<{
    [cacheKey: string]: State<any, any>
  }>()

  readonly onAborter = new CustomEventTarget<{
    [cacheKey: string]: Nullable<AbortController>
  }>()

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

  getAborterSync(cacheKey: string): Nullable<AbortController> {
    return this.#queries.get(cacheKey)?.inner?.aborter
  }

  getStateSync<D, F>(cacheKey: string): Nullable<State<D, F>> {
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

  async fetchOrReplace<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, Error>>): Promise<Result<State<D, F>, Error>> {
    const metadata = this.#getOrCreateMetadata(cacheKey)

    if (metadata.inner.aborter != null)
      metadata.inner.aborter.abort()

    try {
      const promise = callback()

      metadata.inner.pending = promise
      metadata.inner.aborter = aborter
      this.onAborter.dispatchEvent(new CustomEvent(cacheKey, { detail: aborter }))

      return await promise
    } finally {
      if (metadata.inner.aborter === aborter) {
        metadata.inner.aborter = undefined
        metadata.inner.pending = undefined
        this.onAborter.dispatchEvent(new CustomEvent(cacheKey, { detail: undefined }))
      }
    }
  }

  async fetchOrJoin<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, Error>>): Promise<Result<State<D, F>, Error>> {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    if (metadata.inner.pending != null)
      return await metadata.inner.pending

    try {
      const promise = callback()

      metadata.inner.aborter = aborter
      metadata.inner.pending = promise
      this.onAborter.dispatchEvent(new CustomEvent(cacheKey, { detail: aborter }))

      return await promise
    } finally {
      if (metadata.inner.aborter === aborter) {
        metadata.inner.aborter = undefined
        metadata.inner.pending = undefined
        this.onAborter.dispatchEvent(new CustomEvent(cacheKey, { detail: undefined }))
      }
    }
  }

  async #tryGet<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.unthrow(async t => {
      const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

      if (metadata.inner.state != null)
        return new Ok(metadata.inner.state)

      const stored = await Promise
        .resolve(settings.storage?.tryGet?.(cacheKey))
        .then(r => r?.ok().inner)

      const state = await this.tryUnstore(stored, settings).then(r => r.throw(t))

      metadata.inner.state = state

      this.raw.set(cacheKey, Option.wrap(stored))

      this.onState.dispatchEvent(new CustomEvent(cacheKey, { detail: state }))

      return new Ok(state)
    })
  }

  async tryGet<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)
    return await metadata.lock(async () => await this.#tryGet(cacheKey, settings))
  }

  async tryStore<K, D, F>(state: State<D, F>, settings: QuerySettings<K, D, F>): Promise<Result<Nullable<RawState>, Error>> {
    return await Result.unthrow(async t => {
      const {
        dataSerializer = SyncIdentity as Bicoder<D, unknown>,
        errorSerializer = SyncIdentity as Bicoder<F, unknown>
      } = settings

      if (state.real == null)
        return new Ok(undefined)

      const { time, cooldown, expiration } = state.real.current

      const data = await Option.map(state.real.data, d => d.map(async x => await Promise.resolve(dataSerializer.tryEncode(x)).then(r => r.throw(t))))
      const error = await Option.map(state.real.error, d => d.mapErr(async x => await Promise.resolve(errorSerializer.tryEncode(x)).then(r => r.throw(t))))

      return new Ok({ version: 2, data, error, time, cooldown, expiration })
    })
  }

  async tryUnstore<K, D, F>(stored: Nullable<RawState>, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.unthrow(async t => {
      const {
        dataSerializer = SyncIdentity as Bicoder<D, unknown>,
        errorSerializer = SyncIdentity as Bicoder<F, unknown>
      } = settings

      if (stored == null)
        return new Ok(new RealState<D, F>(undefined))

      if (stored.version == null) {
        const { time, cooldown, expiration } = stored
        const times = { time, cooldown, expiration }

        const data = await Option.wrap(stored.data).map(async x => new Data(await Promise.resolve(dataSerializer.tryDecode(x)).then(r => r.throw(t)), times))
        const error = await Option.wrap(stored.error).map(async x => new Fail(await Promise.resolve(errorSerializer.tryDecode(x)).then(r => r.throw(t)), times))

        if (error.isSome())
          return new Ok(new RealState(new FailState<D, F>(error.get(), data.get())))

        if (data.isSome())
          return new Ok(new RealState(new DataState<D, F>(data.get())))

        return new Ok(new RealState<D, F>(undefined))
      }

      if (stored.version === 2) {
        const data = await Option.wrap(stored.data).map(x => Data.from(x).map(async x => await Promise.resolve(dataSerializer.tryDecode(x)).then(r => r.throw(t))))
        const error = await Option.wrap(stored.error).map(x => Fail.from(x).mapErr(async x => await Promise.resolve(errorSerializer.tryDecode(x)).then(r => r.throw(t))))

        if (error.isSome())
          return new Ok(new RealState(new FailState<D, F>(error.get(), data.get())))

        if (data.isSome())
          return new Ok(new RealState(new DataState<D, F>(data.get())))

        return new Ok(new RealState<D, F>(undefined))
      }

      return new Ok(new RealState<D, F>(undefined))
    })
  }

  /**
   * Set full state and store it in storage
   * @param cacheKey 
   * @param setter 
   * @param settings 
   * @returns 
   */
  async trySet<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.unthrow(async t => {
      const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

      return await metadata.lock(async () => {
        const previous = await this.#tryGet(cacheKey, settings).then(r => r.throw(t))
        const current = await setter(previous)

        if (current === previous)
          return new Ok(previous)

        const stored = await this.tryStore(current, settings).then(r => r.throw(t))

        metadata.inner.state = current

        this.raw.set(cacheKey, Option.wrap(stored))
        this.onState.dispatchEvent(new CustomEvent(cacheKey, { detail: current }))

        await Promise
          .resolve(settings.storage?.trySet?.(cacheKey, stored))
          .then(r => r?.throw(t))

        await settings.indexer?.({ current, previous })
        return new Ok(current)
      })
    })
  }

  #mergeRealStateWithFetched<D, F>(previous: State<D, F>, fetched: Nullable<Fetched<D, F>>): RealState<D, F> {
    if (fetched == null)
      return new RealState(undefined)

    if (fetched.isData())
      return new RealState(new DataState(fetched))

    return new RealState(new FailState(fetched, previous.real?.data))
  }

  #mergeFakeStateWithFetched<D, F>(previous: State<D, F>, fetched: Nullable<Fetched<D, F>>): FakeState<D, F> {
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
  async tryUpdate<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>) {
    const { dataEqualser = DEFAULT_EQUALS, errorEqualser = DEFAULT_EQUALS } = settings

    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await this.trySet(cacheKey, async (previous) => {
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
  async tryMutate<K, D, F>(cacheKey: string, mutator: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.tryUpdate(cacheKey, async (previous) => {
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
  async tryDelete<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.tryMutate(cacheKey, () => new Some(undefined), settings)
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

    return await this.trySet(cacheKey, async (previous) => {
      return await this.#reoptimize(metadata.inner, previous)
    }, settings)
  }

  async optimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    const metadata = this.#getOrCreateMetadata<D, F>(cacheKey)

    return await this.trySet(cacheKey, async (previous) => {

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
  async #normalize<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
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
  async prenormalize<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer == null)
      return fetched
    return await settings.normalizer(fetched, { shallow: true })
  }

  /**
   * Assume cacheKey changed and reindex it
   * @param cacheKey 
   * @param settings 
   */
  async tryReindex<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<void, Error>> {
    return await Result.unthrow(async t => {
      const current = await this.tryGet(cacheKey, settings).then(r => r.throw(t))
      await settings.indexer?.({ current })
      return Ok.void()
    })
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
      await this.tryDelete(cacheKey, settings)
    }

    metadata.inner.counter--

    if (metadata.inner.counter > 0)
      return

    const expiration = metadata.inner.state?.real?.current.expiration

    if (expiration == null)
      return

    if (Date.now() > expiration) {
      await this.tryDelete(cacheKey, settings)
      return
    }

    const delay = expiration - Date.now()
    metadata.inner.timeout = setTimeout(eraseAfterTimeout, delay)
  }
}

export const core = new Core()