import { Core } from "mods/core";
import { Fetcher } from "mods/index";
import { Mutator } from "mods/types/mutator";
import { Object } from "mods/types/object";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

export function getScrollStorageKey<D = any, E = any, N = D, K = any>(key: K, params: Params) {
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
export class ScrollObject<D = any, E = any, N = D, K = any> implements Object<D[], E, N[], K> {
  readonly key: K | undefined
  readonly skey: string | undefined
  readonly params: Params<D[], E, N[], K>

  private _init: Promise<void> | undefined
  private _state: State<D[], E, N[], K> | undefined | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, E, N, K>,
    readonly fetcher: Fetcher<D, E, N, K> | undefined,
    cparams: Params<D[], E, N[], K> = {},
    pparams: Params<D[], E, N[], K> = {}
  ) {
    this.params = { ...pparams, ...cparams }
    this.key = scroller()
    this.skey = getScrollStorageKey(this.key, this.params)

    this.loadSync()
    this.subscribe()
  }

  get init() { return this._init }
  get state() { return this._state }
  get ready() { return this._state !== null }

  private loadSync() {
    const { core, skey, params } = this

    this._state = core.getSync(skey, params)
  }

  private async loadAsync() {
    if (this.ready) return

    const { core, skey, params } = this

    this._state = await core.get(skey, params)
  }

  private subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D[], E, N[], K>) =>
      this._state = state

    core.subscribe(skey, setter)

    new FinalizationRegistry(() => {
      core.unsubscribe(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D[], E, N[], K>) {
    const { core, skey, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.mutate(skey, this._state, mutator, params)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.first(skey, this._state, scroller, fetcher, aborter, params)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.first(skey, this._state, scroller, fetcher, aborter, params, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.scroll.scroll(skey, this._state, scroller, fetcher, aborter, params)
  }

  async clear() {
    const { core, skey, params } = this

    await core.delete(skey, params)
    delete this._state
  }
}