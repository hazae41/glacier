import { Option, Optional } from "@hazae41/option";
import { Arrays } from "libs/arrays/arrays.js";
import { Core } from "mods/core/core.js";
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

  static async make<D, K>(core: Core, scroller: Scroller<D, K>, fetcher: Optional<Fetcher<D, K>>, qparams: QueryParams<D[], K>) {
    const key = scroller?.()

    if (key === undefined)
      return undefined

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
    return this.scroller?.(Option.mapSync(this.state?.real?.ok().inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, cacheKey, params } = this

    this.#state = await core.mutate(cacheKey, mutator, params)
  }

  async fetch() {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return

    await core.fetch(cacheKey, async (aborter) => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state).ignore())
  }

  async refetch() {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return

    await core.abortAndFetch(cacheKey, async (aborter) => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state).ignore())
  }

  async scroll() {
    const { core, scroller, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return

    await core.abortAndFetch(cacheKey, async (aborter) => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state).ignore())
  }

  async delete() {
    const { core, cacheKey, params } = this

    this.#state = await core.delete(cacheKey, params)
  }

}