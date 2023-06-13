import { Option, Optional } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Core, MissingFetcherError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

export class ScrollQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly scroller: Scroller<K, D, F>
  readonly fetcher?: Fetcher<K, D, F>

  readonly settings: QuerySettings<K, D[], F>

  #state: State<D[], F>
  #aborter?: AbortController

  readonly clean: () => void

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    scroller: Scroller<K, D, F>,
    fetcher: Optional<Fetcher<K, D, F>>,
    settings: QuerySettings<K, D[], F>,

    state: State<D[], F>,
    aborter: Optional<AbortController>
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.scroller = scroller
    this.fetcher = fetcher

    this.settings = settings

    this.#state = state
    this.#aborter = aborter

    const setState = (state: State<D, F>) =>
      this.#state = state as State<D[], F>

    const setAborter = (aborter?: AbortController) =>
      this.#aborter = aborter

    core.states.on(cacheKey, setState)
    core.aborters.on(cacheKey, setAborter)
    core.increment(cacheKey, settings)

    this.clean = () => {
      core.states.off(cacheKey, setState)
      core.aborters.off(cacheKey, setAborter)
      core.decrement(cacheKey, settings)
    }

    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, scroller: Scroller<K, D, F>, fetcher: Optional<Fetcher<K, D, F>>, qsettings: QuerySettings<K, D[], F>) {
    const settings = { ...core.settings, ...qsettings }

    const state = await core.get(cacheKey, settings)
    const aborter = core.aborter(cacheKey)

    return new ScrollQueryInstance(core, key, cacheKey, scroller, fetcher, settings, state, aborter)
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

  peek() {
    return this.scroller?.(Option.mapSync(this.state.real?.data?.inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[], F>) {
    const state = await this.core.mutate(this.cacheKey, mutator, this.settings)
    this.#state = state
    return new Ok(state)
  }

  async delete() {
    const state = await this.core.delete(this.cacheKey, this.settings)
    this.#state = state
    return new Ok(state)
  }

  async fetch(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async refetch(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async scroll(aborter = new AbortController()) {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

}