import { Arrays } from "libs/arrays/arrays.js";
import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { FullState } from "mods/types/state.js";
import { Scroll } from "./helper.js";

/**
 * Non-React version of ScrollQuery
 */
export class ScrollInstance<D = unknown, K = unknown> implements Instance<D[], K> {
  readonly key: K | undefined
  readonly cacheKey: string | undefined
  readonly mparams: QueryParams<D[], K>

  #init: Promise<FullState<D[]> | undefined>

  #state?: FullState<D[]> | undefined | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K> | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: QueryParams<D[], K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.key = scroller?.()

    this.cacheKey = Scroll.getCacheKey<D[], K>(this.key, this.mparams)

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

    return this.#state = core.getSync<D[], K>(cacheKey, mparams)
  }

  #subscribe() {
    const { core, cacheKey } = this

    const setter = (state?: FullState<D[]>) =>
      this.#state = state

    core.on(cacheKey, setter)

    new FinalizationRegistry(() => {
      core.offState(cacheKey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, cacheKey, mparams } = this

    return this.#state = await core.mutate(cacheKey, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, cacheKey, fetcher, mparams } = this

    return this.#state = await Scroll.first(core, scroller, cacheKey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, cacheKey, fetcher, mparams } = this

    return this.#state = await Scroll.first(core, scroller, cacheKey, fetcher, aborter, mparams, true, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, cacheKey, fetcher, mparams } = this

    return this.#state = await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, mparams, true, true)
  }

  async clear() {
    const { core, cacheKey, mparams } = this

    await core.delete(cacheKey, mparams)
    this.#state = undefined
  }

  peek() {
    const current = Arrays.tryLast(this.state?.data)
    return this.scroller?.(current)
  }

}