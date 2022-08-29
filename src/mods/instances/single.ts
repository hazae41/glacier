import { Core } from "mods/core";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

/**
 * Non-React version of SingleHandle
 */
export class SingleInstance<D = any, E = any, K = any> {
  readonly skey: string | undefined

  private _ready: boolean
  private _state: State<D, E>

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly poster: Poster<D, K>,
    readonly params: Params<D, E, K> = {},
  ) {
    this.skey = (() => {
      if (key === undefined)
        return
      if (typeof key === "string")
        return key

      const {
        serializer = DEFAULT_SERIALIZER
      } = this.params

      return serializer.stringify(key)
    })();

    this._ready = (() => {
      const { core, skey, params } = this

      return core.hasSync(skey, params)
    })();

    this._state = (() => {
      const { core, skey, params } = this

      return core.getSync(skey, params)
    })();

    (async () => {
      if (this.ready) return

      const { core, skey, params } = this

      this._state = await core.get(skey, params)
      this._ready = true
    })();

    {
      const { core, skey } = this

      const setter = (state?: State<D, E>) =>
        this._state = state

      core.subscribe(this.skey, setter)

      new FinalizationRegistry(() => {
        core.unsubscribe(skey, setter)
      }).register(this, undefined)
    }
  }

  get state() { return this._state }
  get ready() { return this._ready }

  async mutate(state?: State<D, E>) {
    const { core, skey, params } = this

    return this._state = await core.mutate<D, E>(skey, state, params)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    return this._state = await core.single.fetch<D, E, K>(key, skey, poster, aborter, params)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    return this._state = await core.single.fetch<D, E, K>(key, skey, poster, aborter, params, true)
  }

  async update(updater: Updater<D>, aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    return this._state = await core.single.update<D, E, K>(key, skey, poster, updater, aborter, params)
  }

  async clear() {
    const { core, skey, params } = this

    await core.delete(skey, params)
    delete this._state
  }
}