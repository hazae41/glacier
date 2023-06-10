import { Optional } from "@hazae41/option";
import { Err, Ok } from "@hazae41/result";
import { State, TimesInit } from "index.js";
import { Core, UnfetchableError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Updater } from "mods/types/updater.js";
import { Simple } from "./helper.js";

export class SimpleQueryInstance<D = unknown, K = unknown> implements Instance<D, K> {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly fetcher?: Fetcher<D, K>

  readonly params: QueryParams<D, K>

  #state: State<D>
  #aborter?: AbortController

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    fetcher: Optional<Fetcher<D, K>>,
    params: QueryParams<D, K>,

    state: State<D>,
    aborter: Optional<AbortController>
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.fetcher = fetcher
    this.params = params

    this.#state = state
    this.#aborter = aborter

    this.#subscribe()
  }

  static async make<D, K>(core: Core, key: K, fetcher: Optional<Fetcher<D, K>>, qparams: QueryParams<D, K>) {
    const params = { ...core.params, ...qparams }

    const cacheKey = Simple.getCacheKey<D, K>(key, params)

    const state = await core.get(cacheKey, params)
    const aborter = core.aborter(cacheKey)

    return new SimpleQueryInstance(core, key, cacheKey, fetcher, params, state, aborter)
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
      this.#state = state as State<D>

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

  async mutate(mutator: Mutator<D>) {
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
    const { core, key, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new UnfetchableError())

    return await core.fetch(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async refetch(aborter = new AbortController()) {
    const { core, key, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new UnfetchableError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => this.#state = state))
  }

  async update(updater: Updater<D>, uparams: TimesInit = {}, aborter = new AbortController()) {
    const { core, key, cacheKey, fetcher, params } = this

    if (fetcher === undefined)
      return new Err(new UnfetchableError())

    return await Simple
      .update(core, key, cacheKey, fetcher, updater, aborter, { ...params, ...uparams })
      .then(r => r.inspectSync(state => this.#state = state))
  }

}