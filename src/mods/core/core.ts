import { Mutex } from "@hazae41/mutex"
import { Option } from "@hazae41/option"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { Data, Fail, FakeDataState, FakeFailState, FakeState, Fetched, RealDataState, RealFailState, RealState, State, StoredState, Times } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { Optional } from "libs/types/optional.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Mutator } from "mods/types/mutator.js"
import { GlobalParams, QueryParams, SyncStorageQueryParams } from "mods/types/params.js"

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

  readonly states = new Ortho<string, Optional<State>>()
  readonly aborters = new Ortho<string, Optional<AbortController>>()

  readonly #states = new Map<string, State>()

  readonly #optimisersByKey = new Map<string, Map<string, Mutator>>()

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

  async fetch<T>(
    cacheKey: string,
    callback: () => Promise<T>,
    aborter = new AbortController()
  ) {
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

  async abortAndFetch<T>(
    cacheKey: string,
    callback: () => Promise<T>,
    aborter = new AbortController(),
  ) {
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

  getSync<D, K>(
    cacheKey: string,
    params: QueryParams<D, K> = {}
  ): Result<Optional<State<D>>, AsyncStorageError> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return new Ok(cached as State<D>)

    const { storage } = params

    if (!storage?.storage)
      return new Ok(undefined)
    if (storage.storage.async)
      return new Err(new AsyncStorageError())

    const stored = storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (stored === undefined)
      return new Ok(undefined)

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealDataState(data)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealFailState(fail)
      this.#states.set(cacheKey, state)
      return new Ok(state)
    }

    throw new Panic(`Invalid stored state`)
  }

  async get<D, K>(
    cacheKey: string,
    params: QueryParams<D, K> = {}
  ): Promise<Optional<State<D>>> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return cached as State<D>

    const { storage } = params

    if (!storage?.storage)
      return undefined

    const stored = storage.storage.async
      ? await storage.storage.get<D>(cacheKey, storage)
      : storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (stored === undefined)
      return undefined

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealDataState(data)
      this.#states.set(cacheKey, state)
      return state
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealFailState(fail)
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
  async set<D, K>(
    cacheKey: string,
    state: Optional<State<D>>,
    params: QueryParams<D, K> = {}
  ) {
    if (state !== undefined)
      this.#states.set(cacheKey, state)
    else
      this.#states.delete(cacheKey)

    this.states.publish(cacheKey, state)

    const { storage } = params

    if (!storage?.storage)
      return
    if (state?.real === undefined)
      return

    const { time, cooldown, expiration } = state.real

    let stored: StoredState<D>

    if (state.real.isData()) {
      const data = { inner: state.real.data }
      stored = { data, time, cooldown, expiration }
    } else {
      const error = { inner: state.real.error }
      stored = { error, time, cooldown, expiration }
    }

    await storage.storage.set(cacheKey, stored, storage as any)
  }

  /**
   * Delete key and publish undefined
   * @param cacheKey 
   * @returns 
   */
  async delete<D, K>(
    cacheKey: string,
    params: QueryParams<D, K> = {}
  ) {
    this.#states.delete(cacheKey)
    this.#mutexes.delete(cacheKey)
    this.#optimisersByKey.delete(cacheKey)
    this.aborters.publish(cacheKey, undefined)
    this.states.publish(cacheKey, undefined)

    const { storage } = params

    if (!storage?.storage)
      return

    await storage.storage.delete(cacheKey)
  }

  async mutate<D, K>(
    cacheKey: string,
    mutator: Mutator<D>,
    params: QueryParams<D, K> = {}
  ) {
    const previous = await this.get(cacheKey, params)

    const fetched = Option.mapSync(mutator(previous), Fetched.from)

    return await this.apply(cacheKey, previous, fetched, params)
  }

  #realMerge<D>(fetched: Optional<Fetched<D>>, current: Optional<State<D>>): Optional<RealState<D>> {
    if (fetched === undefined)
      return undefined

    const times: Times = {
      ...current?.real satisfies Times | undefined,
      ...fetched satisfies Times
    }

    if (fetched.isData())
      return new RealDataState(new Data(fetched.data, times))
    return new RealFailState(new Fail(fetched.error, times))
  }

  #fakeMerge<D>(fetched: Optional<Fetched<D>>, current: Optional<State<D>>): Optional<FakeState<D>> {
    if (fetched === undefined)
      return undefined

    const times: Times = {
      ...current?.current satisfies Times | undefined,
      ...fetched satisfies Times
    }

    if (fetched.isData())
      return new FakeDataState(new Data(fetched.data, times), current?.real)
    return new FakeFailState(new Fail(fetched.error, times), current?.real)
  }

  /**
   * Apply fetched result to previous state, optimize it, and publish it
   * @param cacheKey 
   * @param previous 
   * @param fetched 
   * @param params 
   * @returns 
   */
  async apply<D, K>(
    cacheKey: string,
    previous: Optional<State<D>>,
    fetched: Optional<Fetched<D>>,
    params: QueryParams<D, K> = {}
  ): Promise<Optional<State<D>>> {
    const { equals = DEFAULT_EQUALS } = params

    const next = this.#realMerge(fetched, previous)

    if (next !== undefined) {
      if (previous?.real && Time.isBefore(next.real.time, previous.real.time))
        next.real = previous.real

      if (next.real.isData())
        next.real = next.real.set(await this.normalize(next.real.data, params))

      if (next.real.isData() && previous?.real?.isData() && equals(next.real.data, previous.real.data))
        next.real = next.real.set(previous.real.data)

      if (next.real.isFail() && previous?.real?.isFail() && equals(next.real.error, previous.real.error))
        next.real = next.real.setErr(previous.real.error)
    }

    const optimized = await this.optimize(cacheKey, next)
    await this.set(cacheKey, optimized, params)
    return optimized
  }

  async optimize<D>(
    cacheKey: string,
    real: Optional<RealState<D>>
  ): Promise<Optional<State<D>>> {
    const optimisers = this.#optimisersByKey.get(cacheKey) as Map<string, Mutator<D>>

    if (optimisers === undefined)
      return real

    let current: Optional<State<D>> = real

    for (const optimiser of optimisers.values()) {
      const optimistic = optimiser(current)
      const fetched = Option.mapSync(optimistic, Fetched.from)
      current = this.#fakeMerge(fetched, current)
    }

    return current
  }

  async normalize<D, K>(
    data: D,
    params: QueryParams<D, K> = {},
    more: { shallow?: boolean } = {}
  ) {
    const { shallow } = more

    if (params.normalizer === undefined)
      return data

    return await params.normalizer(data, { core: this, parent, shallow })
  }

  onState<D, K>(
    cacheKey: string,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
  ) {
    this.states.on(cacheKey, listener as Listener)

    const count = this.#counts.get(cacheKey) ?? 0
    this.#counts.set(cacheKey, count + 1)

    const timeout = this.#timeouts.get(cacheKey)

    if (timeout === undefined)
      return

    clearTimeout(timeout)
    this.#timeouts.delete(cacheKey)
  }

  async offState<D, K>(
    cacheKey: string,
    listener: Listener<D>,
    params: QueryParams<D, K> = {}
  ) {
    this.states.off(cacheKey, listener as Listener)

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