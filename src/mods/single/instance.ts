import { Optional } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { Core, MissingFetcherError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { Simple } from "./helper.js";

export class SimpleQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly fetcher?: Fetcher<K, D, F>

  readonly settings: QuerySettings<K, D, F>

  #state: State<D, F>
  #aborter?: AbortController

  readonly clean: () => void

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    fetcher: Optional<Fetcher<K, D, F>>,
    settings: QuerySettings<K, D, F>,

    state: State<D, F>,
    aborter: Optional<AbortController>
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.fetcher = fetcher
    this.settings = settings

    this.#state = state
    this.#aborter = aborter

    const setState = (state: State<D, F>) =>
      this.#state = state

    const setAborter = (aborter?: AbortController) =>
      this.#aborter = aborter

    core.states.on(cacheKey, setState)
    core.aborters.on(cacheKey, setAborter)
    core.increment(cacheKey, settings)

    this.clean = () => {
      core.decrement(cacheKey, settings)
      core.states.off(cacheKey, setState)
      core.aborters.off(cacheKey, setAborter)
    }

    new FinalizationRegistry(() => {
      this.clean()
    }).register(this, undefined)
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, fetcher: Optional<Fetcher<K, D, F>>, qsettings: QuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    const state = await core.get(cacheKey, settings)
    const aborter = core.getAborter(cacheKey)

    return new SimpleQueryInstance(core, key, cacheKey, fetcher, settings, state, aborter)
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

  async mutate(mutator: Mutator<D, F>) {
    const { core, cacheKey, settings } = this

    const state = await core.mutate(cacheKey, mutator, settings)
    this.#state = state
    return new Ok(state)
  }

  async delete() {
    const { core, cacheKey, settings } = this

    const state = await core.delete(cacheKey, settings)
    this.#state = state
    return new Ok(state)
  }

  async fetch(aborter = new AbortController()) {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrError(core, key, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async refetch(aborter = new AbortController()) {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()) {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await Simple
      .update(core, key, cacheKey, fetcher, updater, aborter, settings)
      .then(r => r.inspectSync(state => this.#state = state))
  }

}