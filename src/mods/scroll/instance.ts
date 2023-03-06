import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

/**
 * Non-React version of ScrollQuery
 */
export class ScrollInstance<D = unknown, K = unknown> implements Instance<D[], K> {
  readonly key: K | undefined
  readonly skey: string | undefined
  readonly mparams: Params<D[], K>

  #init?: Promise<void>
  #state?: State<D[]> | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K> | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: Params<D[], K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.key = scroller?.()

    this.skey = Scroll.getStorageKey<D[], K>(this.key, this.mparams)

    this.#loadSync()
    this.#subscribe()
  }

  get init() { return this.#init }
  get state() { return this.#state }
  get ready() { return this.#state !== null }

  #loadSync() {
    const { core, skey, mparams } = this

    this.#state = core.getSync<D[], K>(skey, mparams)
  }

  async #loadAsync() {
    if (this.ready)
      return

    const { core, skey, mparams } = this

    this.#state = await core.get(skey, mparams)
  }

  #subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D[]>) =>
      this.#state = state

    core.on(skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, skey, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")

    return this.#state = await core.mutate(skey, this.#state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Scroll.first(core, scroller, skey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Scroll.first(core, scroller, skey, fetcher, aborter, mparams, true, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Scroll.scroll(core, scroller, skey, fetcher, aborter, mparams, true, true)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    this.#state = undefined
  }
}