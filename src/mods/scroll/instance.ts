import { Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";

export function getScrollStorageKey<D, K>(key: K | undefined, params: Params<D, K>) {
  if (key === undefined)
    return undefined
  if (typeof key === "string")
    return key

  const {
    serializer = DEFAULT_SERIALIZER
  } = params

  return `scroll:${serializer.stringify(key)}`
}

/**
 * Non-React version of ScrollQuery
 */
export class ScrollInstance<D = unknown, K = unknown> implements Instance<D[], K> {
  readonly key: K | undefined
  readonly skey: string | undefined
  readonly mparams: Params<D[], K>

  private _init: Promise<void> | undefined
  private _state: State<D[]> | undefined | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: Params<D[], K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.key = scroller()

    this.skey = getScrollStorageKey<D[], K>(this.key, this.mparams)

    this.loadSync()
    this.subscribe()
  }

  get init() { return this._init }
  get state() { return this._state }
  get ready() { return this._state !== null }

  private loadSync() {
    const { core, skey, mparams } = this

    this._state = core.getSync<D[], K>(skey, mparams)
  }

  private async loadAsync() {
    if (this.ready) return

    const { core, skey, mparams } = this

    this._state = await core.get(skey, mparams)
  }

  private subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D[]>) =>
      this._state = state

    core.on(skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[]>) {
    const { core, skey, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.mutate(skey, this._state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.first(skey, scroller, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.first(skey, scroller, fetcher, aborter, mparams, true, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.scroll(skey, scroller, fetcher, aborter, mparams, true, true)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    delete this._state
  }
}