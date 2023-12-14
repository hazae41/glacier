import { Mutex } from "@hazae41/mutex"
import { Nullable, Option, Some } from "@hazae41/option"
import { SuperEventTarget } from "@hazae41/plume"
import { Ok, Result } from "@hazae41/result"
import { Promiseable } from "libs/promises/promises.js"
import { Time } from "libs/time/time.js"
import { Bicoder, SyncIdentity } from "mods/coders/coder.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Data } from "mods/fetched/data.js"
import { Fail } from "mods/fetched/fail.js"
import { Fetched, FetchedInit } from "mods/fetched/fetched.js"
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

export class Core {

  readonly onState = new SuperEventTarget<{
    [cacheKey: string]: () => void
  }>()

  readonly onAborter = new SuperEventTarget<{
    [cacheKey: string]: () => void
  }>()

  readonly mutexes = new Map<string, Mutex<void>>()

  readonly unstoreds = new Map<string, State<any, any>>()
  readonly storeds = new Map<string, RawState<any, any>>()

  readonly promises = new Map<string, Promise<Result<State<any, any>, Error>>>()
  readonly aborters = new Map<string, AbortController>()
  readonly timeouts = new Map<string, NodeJS.Timeout>()
  readonly counters = new Map<string, number>()

  readonly optimizers = new Map<string, Map<string, Mutator<any, any>>>()

  #mounted = true

  constructor() {
    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  clean() {
    for (const timeout of this.timeouts.values())
      clearTimeout(timeout)
    this.#mounted = false
  }

  getAborterSync(cacheKey: string): Nullable<AbortController> {
    return this.aborters.get(cacheKey)
  }

  getStateSync<D, F>(cacheKey: string): Nullable<State<D, F>> {
    return this.unstoreds.get(cacheKey)
  }

  getOrCreateMutex(cacheKey: string) {
    let mutex = this.mutexes.get(cacheKey)

    if (mutex != null)
      return mutex

    mutex = new Mutex(undefined)
    this.mutexes.set(cacheKey, mutex)
    return mutex
  }

  async fetchOrReplace<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, Error>>): Promise<Result<State<D, F>, Error>> {
    if (this.aborters.has(cacheKey))
      this.aborters.get(cacheKey)!.abort()

    try {
      const promise = callback()

      this.promises.set(cacheKey, promise)
      this.aborters.set(cacheKey, aborter)
      await this.onAborter.emit(cacheKey, [])

      return await promise
    } finally {
      /**
       * Avoid cleaning if it has been replaced
       */
      if (this.aborters.get(cacheKey) === aborter) {
        this.aborters.delete(cacheKey)
        this.promises.delete(cacheKey)
        await this.onAborter.emit(cacheKey, [])
      }
    }
  }

  async fetchOrJoin<D, F>(cacheKey: string, aborter: AbortController, callback: () => Promise<Result<State<D, F>, Error>>): Promise<Result<State<D, F>, Error>> {
    if (this.promises.has(cacheKey))
      return await this.promises.get(cacheKey)!

    try {
      const promise = callback()

      this.promises.set(cacheKey, promise)
      this.aborters.set(cacheKey, aborter)
      await this.onAborter.emit(cacheKey, [])

      return await promise
    } finally {
      /**
       * Avoid cleaning if it has been replaced
       */
      if (this.aborters.get(cacheKey) === aborter) {
        this.aborters.delete(cacheKey)
        this.promises.delete(cacheKey)
        await this.onAborter.emit(cacheKey, [])
      }
    }
  }

  async #tryGet<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.unthrow(async t => {
      if (this.unstoreds.has(cacheKey))
        return new Ok(this.unstoreds.get(cacheKey)!)

      if (this.storeds.has(cacheKey)) {
        const stored = this.storeds.get(cacheKey)
        const unstored = await this.tryUnstore(stored, settings).then(r => r.throw(t))

        this.unstoreds.set(cacheKey, unstored)
        await this.onState.emit(cacheKey, [])

        return new Ok(unstored)
      }

      const stored = await Promise.resolve(settings.storage?.getOrThrow?.(cacheKey)).then(r => r?.ok().inner)
      const unstored = await this.tryUnstore(stored, settings).then(r => r.throw(t))

      this.storeds.set(cacheKey, stored)
      this.unstoreds.set(cacheKey, unstored)
      await this.onState.emit(cacheKey, [])

      return new Ok(unstored)
    })
  }

  async tryGet<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await this.getOrCreateMutex(cacheKey).lock(async () => await this.#tryGet(cacheKey, settings))
  }

  async tryStore<K, D, F>(state: State<D, F>, settings: QuerySettings<K, D, F>): Promise<Result<RawState, Error>> {
    return await Result.unthrow(async t => {
      const {
        dataSerializer = SyncIdentity as Bicoder<D, unknown>,
        errorSerializer = SyncIdentity as Bicoder<F, unknown>
      } = settings

      if (state.real == null)
        return new Ok(undefined)

      const { time, cooldown, expiration } = state.real.current

      const data = await Option.map(state.real.data, d => d.map(async x => await Promise.resolve(dataSerializer.encodeOrThrow(x)).then(r => r.throw(t))))
      const error = await Option.map(state.real.error, d => d.mapErr(async x => await Promise.resolve(errorSerializer.encodeOrThrow(x)).then(r => r.throw(t))))

      return new Ok({ version: 2, data, error, time, cooldown, expiration })
    })
  }

  async tryUnstore<K, D, F>(stored: RawState, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
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

        const data = await Option.wrap(stored.data).map(async x => new Data(await Promise.resolve(dataSerializer.decodeOrThrow(x)).then(r => r.throw(t)), times))
        const error = await Option.wrap(stored.error).map(async x => new Fail(await Promise.resolve(errorSerializer.decodeOrThrow(x)).then(r => r.throw(t)), times))

        if (error.isSome())
          return new Ok(new RealState(new FailState<D, F>(error.get(), data.get())))

        if (data.isSome())
          return new Ok(new RealState(new DataState<D, F>(data.get())))

        return new Ok(new RealState<D, F>(undefined))
      }

      if (stored.version === 2) {
        const data = await Option.wrap(stored.data).map(x => Data.from(x).map(async x => await Promise.resolve(dataSerializer.decodeOrThrow(x)).then(r => r.throw(t))))
        const error = await Option.wrap(stored.error).map(x => Fail.from(x).mapErr(async x => await Promise.resolve(errorSerializer.decodeOrThrow(x)).then(r => r.throw(t))))

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
      return await this.getOrCreateMutex(cacheKey).lock(async () => {
        const previous = await this.#tryGet(cacheKey, settings).then(r => r.throw(t))
        const current = await Promise.resolve(setter(previous)).then(r => r.throw(t))

        if (current === previous)
          return new Ok(previous)

        const stored = await this.tryStore(current, settings).then(r => r.throw(t))

        this.storeds.set(cacheKey, stored)
        this.unstoreds.set(cacheKey, current)
        await this.onState.emit(cacheKey, [])

        await Promise.resolve(settings.storage?.setOrThrow?.(cacheKey, stored)).then(r => r?.throw(t))

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

    return await this.trySet(cacheKey, async (previous) => {
      return await Result.unthrow<Result<State<D, F>, Error>>(async t => {
        const updated = await Promise
          .resolve(setter(previous))
          .then(r => r.throw(t))

        if (updated === previous)
          return new Ok(previous)

        let next = new RealState(updated.real)

        if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
          return new Ok(previous)

        const normalized = await this.#tryNormalize(next.real?.current, settings).then(r => r.throw(t))
        next = this.#mergeRealStateWithFetched(next, normalized)

        if (next.real?.current.isData() && previous.real?.current.isData() && dataEqualser(next.real.current.inner, previous.real.current.inner))
          next = new RealState(new DataState(new Data(previous.real.current.inner, next.real.current)))

        if (next.real?.current.isFail() && previous.real?.current.isFail() && errorEqualser(next.real.current.inner, previous.real.current.inner))
          next = new RealState(new FailState(new Fail(previous.real.current.inner, next.real.current), previous.real.data))

        return await this.#tryReoptimize(cacheKey, next)
      })
    }, settings)
  }

  /**
   * Merge real state with returned Some(fetched), if None do nothing
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param settings 
   * @returns 
   */
  async tryMutate<K, D, F>(cacheKey: string, mutator: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.tryUpdate(cacheKey, async (previous) => {
      return await Result.unthrow(async t => {
        const mutate = await Promise.resolve(mutator(previous)).then(r => r.throw(t))

        if (mutate.isNone())
          return new Ok(previous)

        const fetched = Option.mapSync(mutate.get(), Fetched.from)
        const merged = this.#mergeRealStateWithFetched(previous, fetched)

        return new Ok(merged)
      })
    }, settings)
  }

  /**
   * Merge real state with given fetched
   * @param cacheKey 
   * @param fetched 
   * @param settings 
   * @returns 
   */
  async tryReplace<K, D, F>(cacheKey: string, fetched: Nullable<FetchedInit<D, F>>, settings: QuerySettings<K, D, F>) {
    return await this.tryMutate(cacheKey, () => new Ok(new Some(fetched)), settings)
  }

  /**
   * Set real state to undefined
   * @param cacheKey 
   * @param settings 
   * @returns 
   */
  async tryDelete<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.tryReplace(cacheKey, undefined, settings)
  }

  /**
   * Erase and reapply all optimizations
   * @param state 
   * @param optimizers 
   * @returns 
   */
  async #tryReoptimize<D, F>(cacheKey: string, state: State<D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.unthrow(async t => {
      let reoptimized: State<D, F> = new RealState(state.real)

      const optimizers = this.optimizers.get(cacheKey)

      if (optimizers == null)
        return new Ok(reoptimized)

      for (const optimizer of optimizers.values()) {
        const optimize = await optimizer(reoptimized)
        const optimized = optimize.throw(t)

        if (optimized.isNone())
          continue

        const fetched = Option.mapSync(optimized.get(), Fetched.from)
        reoptimized = this.#mergeFakeStateWithFetched(reoptimized, fetched)
      }

      return new Ok(reoptimized)
    })
  }

  async tryReoptimize<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.trySet(cacheKey, async (previous) => {
      return await this.#tryReoptimize(cacheKey, previous)
    }, settings)
  }

  async tryOptimize<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.trySet(cacheKey, async (previous) => {
      return await Result.unthrow(async t => {
        let optimizers = this.optimizers.get(cacheKey)

        if (optimizers == null) {
          optimizers = new Map()
          this.optimizers.set(cacheKey, optimizers)
        }

        if (optimizers.has(uuid)) {
          optimizers.delete(uuid)
          previous = await this.#tryReoptimize(cacheKey, previous).then(r => r.throw(t))
        }

        optimizers.set(uuid, optimizer)

        const optimized = await Promise.resolve(optimizer(previous)).then(r => r.throw(t))

        if (optimized.isNone())
          return new Ok(previous)

        const fetched = Option.mapSync(optimized.get(), Fetched.from)
        const merged = this.#mergeFakeStateWithFetched(previous, fetched)

        return new Ok(merged)
      })
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    const optimizers = this.optimizers.get(cacheKey)

    if (optimizers == null)
      return
    optimizers.delete(uuid)
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
  async #tryNormalize<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer == null)
      return new Ok(fetched)
    return await settings.normalizer(fetched, { shallow: false })
  }

  /**
   * Transform children into refs but do not normalize them
   * @param data 
   * @param settings 
   * @returns 
   */
  async tryPrenormalize<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>) {
    if (settings.normalizer == null)
      return new Ok(fetched)
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
    const counter = this.counters.get(cacheKey)
    const timeout = this.timeouts.get(cacheKey)

    this.counters.set(cacheKey, (counter || 0) + 1)

    if (timeout != null) {
      clearTimeout(timeout)
      this.timeouts.delete(cacheKey)
    }
  }

  async decrement<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    const counter = this.counters.get(cacheKey)

    /**
     * Already deleted
     */
    if (counter == null)
      return

    /**
     * Not deletable
     */
    if (counter > 1) {
      this.counters.set(cacheKey, counter - 1)
      return
    }

    /**
     * Counter can't go under 1
     */
    this.counters.delete(cacheKey)

    const state = this.unstoreds.get(cacheKey)

    if (state == null)
      return

    const expiration = state.real?.current.expiration

    if (expiration == null)
      return

    if (Date.now() > expiration) {
      await this.tryDelete(cacheKey, settings).then(r => r.inspectErrSync(console.warn))
      return
    }

    const onTimeout = async () => {
      /**
       * This should not happen but check anyway
       */
      if (!this.#mounted)
        return

      const counter = this.counters.get(cacheKey)

      /**
       * No longer deletable
       */
      if (counter != null)
        return

      await this.tryDelete(cacheKey, settings).then(r => r.inspectErrSync(console.warn))
    }

    const delay = expiration - Date.now()
    const timeout = setTimeout(onTimeout, delay)
    this.timeouts.set(cacheKey, timeout)
  }
}

export const core = new Core()