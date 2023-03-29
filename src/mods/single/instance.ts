import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater, UpdaterParams } from "mods/types/updater.js";
import { Single } from "./helper.js";

/**
 * Non-React version of SingleQuery
 */
export class SingleInstance<D = unknown, K = unknown> implements Instance<D, K> {

  readonly mparams: QueryParams<D, K>

  readonly cacheKey: string | undefined

  #init: Promise<State<D> | undefined>

  #state: State<D> | undefined | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: QueryParams<D, K> = {},
  ) {
    this.mparams = { ...core.params, ...this.params }

    this.cacheKey = Single.getCacheKey<D, K>(key, this.params)

    this.#loadSync()
    this.#subscribe()

    this.#init = this.#load()
  }

  get init() {
    return this.#init
  }

  get state() {
    return this.#state
  }

  get ready() {
    return this.#state !== null
  }

  async #load() {
    const { core, cacheKey, mparams } = this

    return this.#state = await core.get(cacheKey, mparams)
  }

  #loadSync() {
    const { core, cacheKey, mparams } = this

    return this.#state = core.getSync<D, K>(cacheKey, mparams)
  }

  #subscribe() {
    const { core, cacheKey } = this

    const setter = (state?: State<D>) =>
      this.#state = state

    core.on(this.cacheKey, setter)

    new FinalizationRegistry(() => {
      core.off(cacheKey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D>) {
    const { core, cacheKey, mparams } = this

    return this.#state = await core.mutate(cacheKey, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, cacheKey, fetcher, mparams } = this

    return this.#state = await Single.fetch(core, key, cacheKey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, cacheKey, fetcher, mparams } = this

    return this.#state = await Single.fetch(core, key, cacheKey, fetcher, aborter, mparams, true, true)
  }

  async update(updater: Updater<D>, uparams: UpdaterParams = {}, aborter?: AbortController) {
    const { core, key, cacheKey, fetcher, mparams } = this

    const fparams = { ...mparams, ...uparams }

    return this.#state = await Single.update(core, key, cacheKey, fetcher, updater, aborter, fparams)
  }

  async clear() {
    const { core, cacheKey, mparams } = this

    await core.delete(cacheKey, mparams)
    this.#state = undefined
  }
}