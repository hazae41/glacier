import { Core } from "mods/core";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

export function getSingleStorageKey<K = any>(key: K, params: Params) {
  if (key === undefined)
    return undefined
  if (typeof key === "string")
    return key

  const {
    serializer = DEFAULT_SERIALIZER
  } = params

  return serializer.stringify(key)
}

/**
 * Non-React version of SingleHandle
 */
export class SingleObject<D = any, E = any, K = any> {
  readonly skey: string | undefined

  readonly mparams: Params<D, E, K>

  private _state?: State<D, E> | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly poster: Poster<D, K>,
    readonly params: Params<D, E, K> = {},
    readonly pparams: Params<D, E, K> = {}
  ) {
    this.mparams = { ...pparams, ...params }

    this.skey = (() => {
      const { mparams } = this

      return getSingleStorageKey(key, mparams)
    })();

    this._state = (() => {
      const { core, skey, mparams } = this

      return core.getSync(skey, mparams)
    })();

    (async () => {
      if (this._state !== null) return

      const { core, skey, mparams } = this

      this._state = await core.get(skey, mparams)
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

  async mutate(state?: State<D, E>) {
    const { core, skey, mparams } = this

    return this._state = await core.mutate<D, E>(skey, state, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    return this._state = await core.single.fetch<D, E, K>(key, skey, poster, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    return this._state = await core.single.fetch<D, E, K>(key, skey, poster, aborter, mparams, true)
  }

  async update(updater: Updater<D>, aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    return this._state = await core.single.update<D, E, K>(key, skey, poster, updater, aborter, mparams)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    delete this._state
  }
}