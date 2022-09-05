import { Core } from "mods/core";
import { Fetcher } from "mods/index";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";
import { Object } from "../types/schema";

export function getScrollStorageKey<K = any>(key: K, params: Params) {
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

  private _state?: State<D[], E> | null

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, E, K>,
    readonly params: Params<D[], E, K> = {},
    readonly pparams: Params<D[], E, K> = {},
    readonly initialize = true
  ) {
    this.mparams = { ...pparams, ...params }

    this.key = scroller()

    this.skey = (() => {
      const { key, mparams } = this

      return getScrollStorageKey(key, mparams)
    })();

    if (initialize) {
      this.loadSync()
      this.loadAsync()
      this.subscribe()
    }
  }

  get state() { return this._state }

  private loadSync() {
    const { core, skey, mparams } = this

    this._state = core.getSync<D[], E>(skey, mparams)
  }

  private async loadAsync() {
    if (this._state !== null) return

    const { core, skey, mparams } = this

    this._state = await core.get<D[], E>(skey, mparams)
  }

  private subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D[], E>) =>
      this._state = state

    core.subscribe(skey, setter)

    new FinalizationRegistry(() => {
      core.unsubscribe(skey, setter)
    }).register(this, undefined)
  }

  async mutate(state?: State<D[], E>) {
    const { core, skey, mparams } = this

    return this._state = await core.mutate<D[], E>(skey, state, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    return this._state = await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    return this._state = await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, mparams, true)
  }

  async scroll(aborter?: AbortController) {
    const { core, scroller, skey, fetcher, mparams } = this

    return this._state = await core.scroll.scroll<D, E, K>(skey, scroller, fetcher, aborter, mparams)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    delete this._state
  }
}