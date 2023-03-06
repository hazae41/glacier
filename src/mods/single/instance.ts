import { Core } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Instance } from "mods/types/instance.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater, UpdaterParams } from "mods/types/updater.js";
import { Single } from "./helper.js";

/**
 * Non-React version of SingleQuery
 */
export class SingleInstance<D = unknown, K = unknown> implements Instance<D, K> {
  readonly storageKey: string | undefined
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

    this.storageKey = Single.getStorageKey<D, K>(key, this.mparams)

    this.#loadSync()
    this.#subscribe()
  }

  get init() { return this.#init }
  get state() { return this.#state }
  get ready() { return this.#state !== null }

  #loadSync() {
    const { core, storageKey, mparams } = this

    this.#state = core.getSync<D, K>(storageKey, mparams)
  }

  async #loadAsync() {
    if (this.ready)
      return

    const { core, storageKey, mparams } = this

    this.#state = await core.get(storageKey, mparams)
  }

  #subscribe() {
    const { core, storageKey } = this

    const setter = (state?: State<D>) =>
      this.#state = state

    core.on(this.storageKey, setter)

    new FinalizationRegistry(() => {
      core.off(storageKey, setter)
    }).register(this, undefined)
  }

  async mutate(mutator: Mutator<D>) {
    const { core, storageKey, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")

    return this.#state = await core.mutate(storageKey, this.#state, mutator, mparams)
  }

  async fetch(aborter?: AbortController) {
    const { core, key, storageKey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Single.fetch(core, key, storageKey, fetcher, aborter, mparams)
  }

  async refetch(aborter?: AbortController) {
    const { core, key, storageKey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")
    if (fetcher === undefined)
      return this.#state

    return this.#state = await Single.fetch(core, key, storageKey, fetcher, aborter, mparams, true, true)
  }

  async update(updater: Updater<D>, uparams: UpdaterParams = {}, aborter?: AbortController) {
    const { core, key, storageKey, fetcher, mparams } = this

    if (this.#state === null)
      await (this.#init ??= this.#loadAsync())
    if (this.#state === null)
      throw new Error("Null state after init")

    const fparams = { ...mparams, ...uparams }

    return this.#state = await Single.update(core, key, storageKey, fetcher, updater, aborter, fparams)
  }

  async clear() {
    const { core, storageKey, mparams } = this

    await core.delete(storageKey, mparams)
    this.#state = undefined
  }
}