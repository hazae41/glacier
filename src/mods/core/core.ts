import { Mutex } from "@hazae41/mutex"
import { Nullable, Option, Some } from "@hazae41/option"
import { SuperEventTarget } from "@hazae41/plume"
import { Result } from "@hazae41/result"
import { Awaitable } from "libs/promises/promises.js"
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
    "*": (cacheKey: string) => void
    [cacheKey: string]: (cacheKey: string) => void
  }>()

  readonly onAborter = new SuperEventTarget<{
    "*": (cacheKey: string) => void
    [cacheKey: string]: (cacheKey: string) => void
  }>()

  readonly mutexes = new Map<string, Mutex<void>>()

  readonly unstoreds = new Map<string, State<any, any>>()
  readonly storeds = new Map<string, RawState<any, any>>()

  readonly promises = new Map<string, Promise<unknown>>()
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

  async runOrReplace<T>(cacheKey: string, aborter: AbortController, callback: () => Promise<T>): Promise<T> {
    const previous = this.promises.get(cacheKey)

    if (previous != null)
      this.aborters.get(cacheKey)!.abort()

    try {
      const promise = callback()

      this.promises.set(cacheKey, promise)
      this.aborters.set(cacheKey, aborter)

      await this.onAborter.emit("*", [cacheKey])
      await this.onAborter.emit(cacheKey, [cacheKey])

      return await promise
    } finally {
      /**
       * Avoid cleaning if it has been replaced
       */
      if (this.aborters.get(cacheKey) === aborter) {
        this.aborters.delete(cacheKey)
        this.promises.delete(cacheKey)

        await this.onAborter.emit("*", [cacheKey])
        await this.onAborter.emit(cacheKey, [cacheKey])
      }
    }
  }

  async runOrJoin<T>(cacheKey: string, aborter: AbortController, callback: () => Promise<T>): Promise<T> {
    const previous = this.promises.get(cacheKey)

    if (previous != null)
      return await previous as T

    try {
      const promise = callback()

      this.promises.set(cacheKey, promise)
      this.aborters.set(cacheKey, aborter)

      await this.onAborter.emit("*", [cacheKey])
      await this.onAborter.emit(cacheKey, [cacheKey])

      return await promise
    } finally {
      /**
       * Avoid cleaning if it has been replaced
       */
      if (this.aborters.get(cacheKey) === aborter) {
        this.aborters.delete(cacheKey)
        this.promises.delete(cacheKey)

        await this.onAborter.emit("*", [cacheKey])
        await this.onAborter.emit(cacheKey, [cacheKey])
      }
    }
  }

  async #getOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    if (this.unstoreds.has(cacheKey))
      return this.unstoreds.get(cacheKey)!

    if (this.storeds.has(cacheKey)) {
      const stored = this.storeds.get(cacheKey)
      const unstored = await this.unstoreOrThrow(stored, settings)

      this.unstoreds.set(cacheKey, unstored)

      await this.onState.emit("*", [cacheKey])
      await this.onState.emit(cacheKey, [cacheKey])

      return unstored
    }

    const stored = await Result.runAndWrap(async () => {
      return settings.storage?.getOrThrow?.(cacheKey)
    }).then(r => r?.ok().inner)

    const unstored = await this.unstoreOrThrow(stored, settings)

    this.storeds.set(cacheKey, stored)
    this.unstoreds.set(cacheKey, unstored)

    await this.onState.emit("*", [cacheKey])
    await this.onState.emit(cacheKey, [cacheKey])

    return unstored
  }

  async getOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    return await this.getOrCreateMutex(cacheKey).lock(() => this.#getOrThrow(cacheKey, settings))
  }

  async tryGet<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.runAndDoubleWrap(() => this.getOrThrow(cacheKey, settings))
  }

  async storeOrThrow<K, D, F>(state: State<D, F>, settings: QuerySettings<K, D, F>): Promise<RawState> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (state.real == null)
      return undefined

    const { time, cooldown, expiration } = state.real.current

    const data = await Option.map(state.real.data, d => d.map(async x => await Promise.resolve(dataSerializer.encodeOrThrow(x))))
    const error = await Option.map(state.real.error, d => d.mapErr(async x => await Promise.resolve(errorSerializer.encodeOrThrow(x))))

    return { version: 2, data, error, time, cooldown, expiration }
  }

  async unstoreOrThrow<K, D, F>(stored: RawState, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const {
      dataSerializer = SyncIdentity as Bicoder<D, unknown>,
      errorSerializer = SyncIdentity as Bicoder<F, unknown>
    } = settings

    if (stored == null)
      return new RealState<D, F>(undefined)

    if (stored.version == null) {
      const { time, cooldown, expiration } = stored
      const times = { time, cooldown, expiration }

      const data = await Option.wrap(stored.data).map(async x => new Data(await Promise.resolve(dataSerializer.decodeOrThrow(x)), times))
      const error = await Option.wrap(stored.error).map(async x => new Fail(await Promise.resolve(errorSerializer.decodeOrThrow(x)), times))

      if (error.isSome())
        return new RealState(new FailState<D, F>(error.get(), data.get()))

      if (data.isSome())
        return new RealState(new DataState<D, F>(data.get()))

      return new RealState<D, F>(undefined)
    }

    if (stored.version === 2) {
      const data = await Option.wrap(stored.data).map(x => Data.from(x).map(async x => await Promise.resolve(dataSerializer.decodeOrThrow(x))))
      const error = await Option.wrap(stored.error).map(x => Fail.from(x).mapErr(async x => await Promise.resolve(errorSerializer.decodeOrThrow(x))))

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
  async setOrThrow<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    return await this.getOrCreateMutex(cacheKey).lock(async () => {
      const previous = await this.#getOrThrow(cacheKey, settings)
      const current = await Promise.resolve(setter(previous))

      if (current === previous)
        return previous

      const stored = await this.storeOrThrow(current, settings)

      this.storeds.set(cacheKey, stored)
      this.unstoreds.set(cacheKey, current)

      await this.onState.emit("*", [cacheKey])
      await this.onState.emit(cacheKey, [cacheKey])

      await Promise.resolve(settings.storage?.setOrThrow?.(cacheKey, stored))

      await settings.indexer?.({ current, previous })

      return current
    })
  }

  async trySet<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>): Promise<Result<State<D, F>, Error>> {
    return await Result.runAndDoubleWrap(() => this.setOrThrow(cacheKey, setter, settings))
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
  async updateOrThrow<K, D, F>(cacheKey: string, setter: Setter<D, F>, settings: QuerySettings<K, D, F>): Promise<State<D, F>> {
    const { dataEqualser = DEFAULT_EQUALS, errorEqualser = DEFAULT_EQUALS } = settings

    return await this.setOrThrow(cacheKey, async (previous) => {
      const updated = await Promise.resolve(setter(previous))

      if (updated === previous)
        return previous

      let next = new RealState(updated.real)

      if (next.real && previous.real && Time.isBefore(next.real?.current.time, previous.real.current.time))
        return previous

      const normalized = await this.#normalizeOrThrow(next.real?.current, settings)
      next = this.#mergeRealStateWithFetched(next, normalized)

      if (next.real?.current.isData() && previous.real?.current.isData() && dataEqualser(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new DataState(new Data(previous.real.current.inner, next.real.current)))

      if (next.real?.current.isFail() && previous.real?.current.isFail() && errorEqualser(next.real.current.inner, previous.real.current.inner))
        next = new RealState(new FailState(new Fail(previous.real.current.inner, next.real.current), previous.real.data))

      return await this.#reoptimizeOrThrow(cacheKey, next)
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
  async mutateOrThrow<K, D, F>(cacheKey: string, mutator: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.updateOrThrow(cacheKey, async (previous) => {
      const mutate = await Promise.resolve(mutator(previous))

      if (mutate.isNone())
        return previous

      const fetched = Option.mapSync(mutate.get(), Fetched.from)
      return this.#mergeRealStateWithFetched(previous, fetched)
    }, settings)
  }

  /**
   * Merge real state with given fetched
   * @param cacheKey 
   * @param fetched 
   * @param settings 
   * @returns 
   */
  async replaceOrThrow<K, D, F>(cacheKey: string, fetched: Nullable<FetchedInit<D, F>>, settings: QuerySettings<K, D, F>) {
    return await this.mutateOrThrow(cacheKey, () => new Some(fetched), settings)
  }

  /**
   * Set real state to undefined
   * @param cacheKey 
   * @param settings 
   * @returns 
   */
  async deleteOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.replaceOrThrow(cacheKey, undefined, settings)
  }

  /**
   * Erase and reapply all optimizations
   * @param state 
   * @param optimizers 
   * @returns 
   */
  async #reoptimizeOrThrow<D, F>(cacheKey: string, state: State<D, F>): Promise<State<D, F>> {
    let reoptimized: State<D, F> = new RealState(state.real)

    const optimizers = this.optimizers.get(cacheKey)

    if (optimizers == null)
      return reoptimized

    for (const optimizer of optimizers.values()) {
      const optimized = await optimizer(reoptimized)

      if (optimized.isNone())
        continue

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      reoptimized = this.#mergeFakeStateWithFetched(reoptimized, fetched)
    }

    return reoptimized
  }

  async reoptimizeOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
    return await this.setOrThrow(cacheKey, async (previous) => {
      return await this.#reoptimizeOrThrow(cacheKey, previous)
    }, settings)
  }

  async optimizeOrThrow<K, D, F>(cacheKey: string, uuid: string, optimizer: Mutator<D, F>, settings: QuerySettings<K, D, F>) {
    return await this.setOrThrow(cacheKey, async (previous) => {
      let optimizers = this.optimizers.get(cacheKey)

      if (optimizers == null) {
        optimizers = new Map()
        this.optimizers.set(cacheKey, optimizers)
      }

      if (optimizers.has(uuid)) {
        optimizers.delete(uuid)
        previous = await this.#reoptimizeOrThrow(cacheKey, previous)
      }

      optimizers.set(uuid, optimizer)

      const optimized = await Promise.resolve(optimizer(previous))

      if (optimized.isNone())
        return previous

      const fetched = Option.mapSync(optimized.get(), Fetched.from)
      return this.#mergeFakeStateWithFetched(previous, fetched)
    }, settings)
  }

  async deoptimize(cacheKey: string, uuid: string) {
    const optimizers = this.optimizers.get(cacheKey)

    if (optimizers == null)
      return
    optimizers.delete(uuid)
  }

  async runWithTimeout<T>(
    callback: (signal: AbortSignal) => Awaitable<T>,
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
  async #normalizeOrThrow<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>): Promise<Nullable<Fetched<D, F>>> {
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
  async prenormalizeOrThrow<K, D, F>(fetched: Nullable<Fetched<D, F>>, settings: QuerySettings<K, D, F>): Promise<Nullable<Fetched<D, F>>> {
    if (settings.normalizer == null)
      return fetched
    return await settings.normalizer(fetched, { shallow: true })
  }

  /**
   * Assume cacheKey changed and reindex it
   * @param cacheKey 
   * @param settings 
   */
  async reindexOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<void> {
    const current = await this.getOrThrow(cacheKey, settings)
    await settings.indexer?.({ current })
  }

  async increment<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>): Promise<void> {
    const counter = this.counters.get(cacheKey)
    const timeout = this.timeouts.get(cacheKey)

    this.counters.set(cacheKey, (counter || 0) + 1)

    if (timeout != null) {
      clearTimeout(timeout)
      this.timeouts.delete(cacheKey)
    }

    return
  }

  async decrementOrThrow<K, D, F>(cacheKey: string, settings: QuerySettings<K, D, F>) {
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

    const state = await this.getOrThrow(cacheKey, settings)
    const expiration = state.real?.current.expiration

    if (expiration == null)
      return

    if (Date.now() > expiration) {
      await this.deleteOrThrow(cacheKey, settings)
      return
    }

    const deleteOrThrow = async () => {
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

      await this.deleteOrThrow(cacheKey, settings)
    }

    const onTimeout = () => {
      deleteOrThrow().catch(console.warn)
    }

    const delay = expiration - Date.now()

    if (delay > (2 ** 31))
      return

    const timeout = setTimeout(onTimeout, delay)
    this.timeouts.set(cacheKey, timeout)
  }
}

export const core = new Core()