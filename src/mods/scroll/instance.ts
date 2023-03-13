import { Arrays } from "libs/arrays/arrays.js";
import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

/**
 * Non-React version of ScrollQuery
 */
export class ScrollInstance<D = unknown, K = unknown> implements Instance<D[], K> {
  readonly key: K | undefined
  readonly storageKey: string | undefined
  readonly mparams: QueryParams<D[], K>

  #init: Promise<State<D[]> | undefined>

  #state?: State<D[]> | undefined | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K> | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: QueryParams<D[], K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.key = scroller?.()

    this.storageKey = Scroll.getStorageKey<D[], K>(this.key, this.mparams)

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
    const { core, storageKey, mparams } = this

    return this.#state = await core.get(storageKey, mparams)
  }

  #loadSync() {
    const { core, storageKey, mparams } = this

    return this.#state = core.getSync<D[], K>(storageKey, mparams)
  }

  #subscribe() {
    const { core, storageKey } = this

    const setter = (state?: State<D[]>) =>
      this.#state = state

    core.on(storageKey, setter)

    new FinalizationRegistry(() => {
      core.off(storageKey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, storageKey, mparams } = this

    return this.#state = await core.mutate(storageKey, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, storageKey, fetcher, mparams } = this

    return this.#state = await Scroll.first(core, scroller, storageKey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, storageKey, fetcher, mparams } = this

    return this.#state = await Scroll.first(core, scroller, storageKey, fetcher, aborter, mparams, true, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, storageKey, fetcher, mparams } = this

    return this.#state = await Scroll.scroll(core, scroller, storageKey, fetcher, aborter, mparams, true, true)
  }

  async clear() {
    const { core, storageKey, mparams } = this

    await core.delete(storageKey, mparams)
    this.#state = undefined
  }

  peek() {
    const current = Arrays.tryLast(this.state?.data)
    return this.scroller?.(current)
  }

}