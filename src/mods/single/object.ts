import { Core } from "mods/core";
import { Mutator } from "mods/types/mutator";
import { Object } from "mods/types/object";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

export function getSingleStorageKey<D = any, E = any, N = D, K = any>(key: K, params: Params) {
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
export class SingleObject<D = any, E = any, N = D, K = any> implements Object<D, E, N, K>{
  readonly skey: string | undefined
  readonly mparams: Params<D, E, N, K>
  readonly init: Promise<void>

  private _state?: State<D, E, N, K> | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly poster: Poster<D, E, N, K>,
    params: Params<D, E, N, K> = {},
    pparams: Params<D, E, N, K> = {},
  ) {
    this.mparams = { ...pparams, ...params }
    this.skey = getSingleStorageKey(key, this.mparams)

    this.loadSync()
    this.subscribe()
    this.init = this.loadAsync()
  }

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

    const setter = (state?: State<D, E, N>) =>
      this._state = state

    core.subscribe(this.skey, setter)

    new FinalizationRegistry(() => {
      core.unsubscribe(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D, E, N, K>) {
    const { core, skey, mparams } = this

    if (this._state === null)
      await this.init
    if (this._state === null)
      throw new Error("Null state after init")
    return this._state = await core.mutate(skey, this._state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    if (this._state === null)
      await this.init
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.single.fetch(key, skey, this._state, poster, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    if (this._state === null)
      await this.init
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.single.fetch(key, skey, this._state, poster, aborter, mparams, true)
  }

  async update(updater: Updater<D, E, N, K>, aborter?: AbortController) {
    const { core, key, skey, poster, mparams } = this

    if (this._state === null)
      await this.init
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.single.update(key, skey, this._state, poster, updater, aborter, mparams)
  }

  async clear() {
    const { core, skey, mparams } = this

    if (this._state === null)
      await this.init
    if (this._state === null)
      throw new Error("Null state after init")

    await core.delete(skey, mparams)
    delete this._state
  }
}