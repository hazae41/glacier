import { Core } from "mods/core";
import { Mutator } from "mods/types/mutator";
import { Object } from "mods/types/object";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";

export function getSingleStorageKey<D = any, E = any, N extends D = D, K = any>(key: K, params: Params) {
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
export class SingleObject<D = any, E = any, N extends D = D, K = any> implements Object<D, E, N, K>{
  readonly skey: string | undefined

  private _init: Promise<void> | undefined
  private _state: State<D, E, N, K> | undefined | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly poster: Poster<D, E, N, K> | undefined,
    readonly params: Params<D, E, N, K> = {},
  ) {
    this.skey = getSingleStorageKey(key, this.params)

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

    const setter = (state?: State<D, E, N>) =>
      this._state = state

    core.on(this.skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D, E, N, K>) {
    const { core, skey, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.mutate(skey, this._state, mutator, params)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (poster === undefined)
      return this._state

    return this._state = await core.single.fetch(key, skey, this._state, poster, aborter, params)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (poster === undefined)
      return this._state

    return this._state = await core.single.fetch(key, skey, this._state, poster, aborter, params, true)
  }

  async update(updater: Updater<D, E, N, K>, aborter?: AbortController) {
    const { core, key, skey, poster, params } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (poster === undefined)
      return this._state

    return this._state = await core.single.update(key, skey, this._state, poster, updater, aborter, params)
  }

  async clear() {
    const { core, skey, params } = this

    await core.delete(skey, params)
    delete this._state
  }
}