import { Core } from "mods/core";
import { Fetcher } from "mods/index";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

/**
 * Non-React version of ScrollHandle
 */
export class ScrollInstance<D = any, E = any, K = any> {
  readonly key: K | undefined
  readonly skey: string | undefined

  readonly mparams: Params<D[], E, K>

  private _ready: boolean
  private _state: State<D[], E>

  constructor(
    readonly core: Core,
    readonly scroller: Scroller<D, K>,
    readonly fetcher: Fetcher<D, K>,
    readonly params: Params<D[], E, K> = {},
    readonly pparams: Params<D[], E, K> = {},
  ) {
    this.mparams = { ...pparams, ...params }

    this.key = scroller()

    this.skey = (() => {
      const { key } = this

      if (key === undefined)
        return
      if (typeof key === "string")
        return key

      const {
        serializer = DEFAULT_SERIALIZER
      } = this.mparams

      return `scroll:${serializer.stringify(key)}`
    })();

    this._ready = (() => {
      const { core, skey, mparams } = this

      return core.hasSync<D[], E>(skey, mparams)
    })();

    this._state = (() => {
      const { core, skey, mparams } = this

      return core.getSync<D[], E>(skey, mparams)
    })();

    (async () => {
      if (this.ready) return

      const { core, skey, mparams } = this

      this._state = await core.get<D[], E>(skey, mparams)
      this._ready = true
    })();

    {
      const { core, skey } = this

      const setter = (state?: State<D[], E>) =>
        this._state = state

      core.subscribe(this.skey, setter)

      new FinalizationRegistry(() => {
        core.unsubscribe(skey, setter)
      }).register(this, undefined)
    }
  }

  get state() { return this._state }
  get ready() { return this._ready }

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