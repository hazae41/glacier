import { Core } from "mods/core";
import { Fetcher } from "mods/index";
import { Mutator } from "mods/types/mutator";
import { Object } from "mods/types/object";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

export function getScrollStorageKey<D = any, E = any, K = any>(key: K, params: Params) {
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
 * Non-React version of ScrollHandle
 */
export class ScrollObject<D = any, E = any, K = any> implements Object<D[], E, K> {
  readonly key: K | undefined
  readonly skey: string | undefined
  readonly mparams: Params<D[], E, K>

  private _init: Promise<void> | undefined
  private _state: State<D[], E, K> | undefined | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, E, K>,
    readonly fetcher: Fetcher<D, E, K> | undefined,
    readonly params: Params<D[], E, K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.key = scroller()
    this.skey = getScrollStorageKey(this.key, this.mparams)

    this.loadSync()
    this.subscribe()
  }

  get init() { return this._init }
  get state() { return this._state }
  get ready() { return this._state !== null }

  private loadSync() {
    const { core, skey, mparams } = this

    this._state = core.getSync(skey, mparams)
  }

  private async loadAsync() {
    if (this.ready) return

    const { core, skey, mparams } = this

    this._state = await core.get(skey, mparams)
  }

  private subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D[], E, K>) =>
      this._state = state

    core.on(skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[], E, K>) {
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