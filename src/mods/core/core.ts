import { Mutex } from "@hazae41/mutex"
import { None, Option, Some } from "@hazae41/option"
import { Err, Ok, Panic, Result } from "@hazae41/result"
import { Data, Fail, FakeDataState, FakeFailState, FakeState, Fetched, RealDataState, RealFailState, RealState, State, StoredState, Times } from "index.js"
import { Ortho } from "libs/ortho/ortho.js"
import { Time } from "libs/time/time.js"
import { DEFAULT_EQUALS } from "mods/defaults.js"
import { Mutator } from "mods/types/mutator.js"
import { GlobalParams, QueryParams, SyncStorageQueryParams } from "mods/types/params.js"

export type Listener<D = unknown> =
  (x?: State<D>) => void

export class AsyncStorageError extends Error {
  readonly #class = AsyncStorageError
  readonly name = this.#class.name

  constructor() {
    super(`Storage is asynchronous`)
  }

}

export class Core {

  readonly states = new Ortho<string, Option<State>>()
  readonly aborters = new Ortho<string, Option<AbortController>>()

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
  ): Result<Option<State<D>>, AsyncStorageError> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return new Ok(new Some(cached as State<D>))

    const { storage } = params

    if (!storage?.storage)
      return new Ok(new None())
    if (storage.storage.async)
      return new Err(new AsyncStorageError())

    const stored = storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (stored === undefined)
      return new Ok(new None())

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealDataState(data)
      this.#states.set(cacheKey, state)
      return new Ok(new Some(state))
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealFailState(fail)
      this.#states.set(cacheKey, state)
      return new Ok(new Some(state))
    }

    throw new Panic(`Invalid stored state`)
  }

  async get<D, K>(
    cacheKey: string,
    params: QueryParams<D, K> = {}
  ): Promise<Option<State<D>>> {
    const cached = this.#states.get(cacheKey)

    if (cached !== undefined)
      return new Some(cached as State<D>)

    const { storage } = params

    if (!storage?.storage)
      return new None()

    const stored = storage.storage.async
      ? await storage.storage.get<D>(cacheKey, storage)
      : storage.storage.get<D>(cacheKey, storage as SyncStorageQueryParams<D>)

    if (stored === undefined)
      return new None()

    const { time, cooldown, expiration } = stored
    const times = { time, cooldown, expiration }

    if (stored.data !== undefined) {
      const data = new Data(stored.data.inner, times)
      const state = new RealDataState(data)
      this.#states.set(cacheKey, state)
      return new Some(state)
    }

    if (stored.error !== undefined) {
      const fail = new Fail(stored.error.inner, times)
      const state = new RealFailState(fail)
      this.#states.set(cacheKey, state)
      return new Some(state)
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
    state: Option<State<D>>,
    params: QueryParams<D, K> = {}
  ) {
    this.#states.set(cacheKey, state)
    this.states.publish(cacheKey, state)

    const { storage } = params

    if (!storage?.storage)
      return
    if (state.real === undefined)
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

    if (storage.storage.async)
      await storage.storage.set(cacheKey, stored, storage)
    else
      storage.storage.set(cacheKey, stored, storage as SyncStorageQueryParams<D>)
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
    this.aborters.publish(cacheKey, new None())
    this.states.publish(cacheKey, new None())

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
    const fetched = mutator(previous).mapSync(x => Fetched.from(x))

    return await this.apply(cacheKey, previous, fetched, params)
  }

  #realMerge<D>(fetched: Option<Fetched<D>>, current: Option<State<D>>): Option<RealState<D>> {
    if (fetched.isNone())
      return new None()

    const times: Times = {
      ...current.inner?.real satisfies Times | undefined,
      ...fetched.inner satisfies Times
    }

    if (fetched.inner.isData())
      return new Some(new RealDataState(new Data(fetched.inner.data, times)))
    return new Some(new RealFailState(new Fail(fetched.inner.error, times)))
  }

  #fakeMerge<D>(fetched: Option<Fetched<D>>, current: Option<State<D>>): Option<FakeState<D>> {
    if (fetched.isNone())
      return new None()

    const times: Times = {
      ...current.inner?.current satisfies Times | undefined,
      ...fetched.inner satisfies Times
    }

    if (fetched.inner.isData())
      return new Some(new FakeDataState(new Data(fetched.inner.data, times), current.inner?.real))
    return new Some(new FakeFailState(new Fail(fetched.inner.error, times), current.inner?.real))
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
    previous: Option<State<D>>,
    fetched: Option<Fetched<D>>,
    params: QueryParams<D, K> = {}
  ): Promise<Option<State<D>>> {
    const { equals = DEFAULT_EQUALS } = params

    const next = this.#realMerge(fetched, previous)

    if (next.isSome()) {
      if (previous.inner?.real && Time.isBefore(next.inner.real.time, previous.inner.real.time))
        next.inner.real = previous.inner.real

      if (next.inner.real.isData())
        next.inner.real = next.inner.real.set(await this.normalize(next.inner.real.data, params))

      if (next.inner.real.isData() && previous.inner?.real?.isData() && equals(next.inner.real.data, previous.inner.real.data))
        next.inner.real = next.inner.real.set(previous.inner.real.data)

      if (next.inner.real.isFail() && previous.inner?.real?.isFail() && equals(next.inner.real.error, previous.inner.real.error))
        next.inner.real = next.inner.real.setErr(previous.inner.real.error)
    }

    const optimized = await this.optimize(cacheKey, next)
    await this.set(cacheKey, optimized, params)
    return optimized
  }

  async optimize<D>(cacheKey: string, real: Option<RealState<D>>): Promise<Option<State<D>>> {
    const optimisers = this.#optimisersByKey.get(cacheKey) as Map<string, Mutator<D>>

    if (optimisers === undefined)
      return real

    let current: Option<State<D>> = real

    for (const optimiser of optimisers.values()) {
      const optimistic = optimiser(current).mapSync(x => Fetched.from(x))
      current = this.#fakeMerge(optimistic, current)
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