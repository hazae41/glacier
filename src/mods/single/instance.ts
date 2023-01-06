import { Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater, UpdaterParams } from "mods/types/updater.js";

export function getSingleStorageKey<D, K>(key: K | undefined, params: Params<D, K>) {
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
 * Non-React version of SingleQuery
 */
export class SingleInstance<D = unknown, K = unknown> implements Instance<D, K> {
  readonly skey: string | undefined
  readonly mparams: Params<D, K>

  private _init: Promise<void> | undefined
  private _state: State<D> | undefined | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: Params<D, K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.skey = getSingleStorageKey<D, K>(key, this.mparams)

    this.loadSync()
    this.subscribe()
  }

  get init() { return this._init }
  get state() { return this._state }
  get ready() { return this._state !== null }

  private loadSync() {
    const { core, skey, mparams } = this

    this._state = core.getSync<D, K>(skey, mparams)
  }

  private async loadAsync() {
    if (this.ready) return

    const { core, skey, mparams } = this

    this._state = await core.get(skey, mparams)
  }

  private subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D>) =>
      this._state = state

    core.on(this.skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D>) {
    const { core, skey, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")

    return this._state = await core.mutate(skey, this._state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.single.fetch(key, skey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this._state

    return this._state = await core.single.fetch(key, skey, fetcher, aborter, mparams, true, true)
  }

  async update(updater: Updater<D>, uparams: UpdaterParams = {}, aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this._state === null)
      await (this._init ??= this.loadAsync())
    if (this._state === null)
      throw new Error("Null state after init")

    const fparams = { ...mparams, ...uparams }

    return this._state = await core.single.update(key, skey, fetcher, updater, aborter, fparams)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    delete this._state
  }
}