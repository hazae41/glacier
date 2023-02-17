import { Core } from "mods/core/core.js";
import { DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater, UpdaterParams } from "mods/types/updater.js";
import { Single } from "./helper.js";

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

  #init?: Promise<void>
  #state?: State<D> | null

  constructor(
    readonly core: Core,
    readonly key: K | undefined,
    readonly fetcher: Fetcher<D, K> | undefined,
    readonly params: Params<D, K> = {},
  ) {
    this.mparams = { ...core.params, ...params }

    this.skey = getSingleStorageKey<D, K>(key, this.mparams)

    this.#loadSync()
    this.#subscribe()
  }

  get init() { return this.#init }
  get state() { return this.#state }
  get ready() { return this.#state !== null }

  #loadSync() {
    const { core, skey, mparams } = this

    this.#state = core.getSync<D, K>(skey, mparams)
  }

  async #loadAsync() {
    if (this.ready) return

    const { core, skey, mparams } = this

    this.#state = await core.get(skey, mparams)
  }

  #subscribe() {
    const { core, skey } = this

    const setter = (state?: State<D>) =>
      this.#state = state

    core.on(this.skey, setter)

    new FinalizationRegistry(() => {
      core.off(skey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D>) {
    const { core, skey, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")

    return this.#state = await core.mutate(skey, this.#state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Single.fetch(core, key, skey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Single.fetch(core, key, skey, fetcher, aborter, mparams, true, true)
  }

  async update(updater: Updater<D>, uparams: UpdaterParams = {}, aborter?: AbortController) {
    const { core, key, skey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")

    const fparams = { ...mparams, ...uparams }

    return this.#state = await Single.update(core, key, skey, fetcher, updater, aborter, fparams)
  }

  async clear() {
    const { core, skey, mparams } = this

    await core.delete(skey, mparams)
    this.#state = undefined
  }
}