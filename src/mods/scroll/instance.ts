import { Option, Optional } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Core, MissingFetcherError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

export class ScrollInstance<D = unknown, K = unknown> implements Instance<D[], K> {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly scroller: Scroller<D, K>
  readonly fetcher?: Fetcher<D, K>
  readonly params: QueryParams<D[], K>

  #state: State<D[]>
  #aborter?: AbortController

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    scroller: Scroller<D, K>,
    fetcher: Optional<Fetcher<D, K>>,
    params: QueryParams<D[], K>,

    state: State<D[]>,
    aborter: Optional<AbortController>
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.scroller = scroller
    this.fetcher = fetcher

    this.params = params

    this.#state = state
    this.#aborter = aborter

    this.#subscribe()
  }

  static async make<D, K>(core: Core, key: K, scroller: Scroller<D, K>, fetcher: Optional<Fetcher<D, K>>, qparams: QueryParams<D[], K>) {
    const params = { ...core.params, ...qparams }

    const cacheKey = Scroll.getCacheKey<D[], K>(key, params)

    const state = await core.get(cacheKey, params)
    const aborter = core.aborter(cacheKey)

    return new ScrollInstance(core, key, cacheKey, scroller, fetcher, params, state, aborter)
  }

  get state() {
    return this.#state
  }

  get aborter() {
    return this.#aborter
  }

  get current() {
    return this.#state.current
  }

  get data() {
    return this.#state.data
  }

  get error() {
    return this.#state.error
  }

  get real() {
    return this.#state.real
  }

  get fake() {
    return this.#state.fake
  }

  #subscribe() {
    const { core, cacheKey, params } = this

    const setState = (state: State) =>
      this.#state = state as State<D[]>

    const setAborter = (aborter?: AbortController) =>
      this.#aborter = aborter

    core.states.on(cacheKey, setState)
    core.aborters.on(cacheKey, setAborter)
    core.increment(cacheKey, params)

    new FinalizationRegistry(() => {
      core.decrement(cacheKey, params)
      core.states.off(cacheKey, setState)
      core.aborters.off(cacheKey, setAborter)
    }).register(this, undefined)
  }

  peek() {
    return this.scroller?.(Option.mapSync(this.state.real?.data?.inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, cacheKey, params } = this

    this.#state = await core.mutate(cacheKey, mutator, params)

    return Ok.void()
  }

  async delete() {
    const { core, cacheKey, params } = this

    this.#state = await core.delete(cacheKey, params)

    return Ok.void()
  }

  async fetch(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.fetchOrError(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async refetch(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async scroll(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

}