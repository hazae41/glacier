import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { AbortedError, CooldownError, Core, MissingFetcherError, PendingFetchError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { Simple } from "./helper.js";

export class SimpleQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly fetcher?: Fetcher<K, D, F>

  readonly settings: QuerySettings<K, D, F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    fetcher: Optional<Fetcher<K, D, F>>,
    settings: QuerySettings<K, D, F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.fetcher = fetcher
    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, fetcher: Optional<Fetcher<K, D, F>>, qsettings: QuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new SimpleQueryInstance(core, key, cacheKey, fetcher, settings)
  }

  get state() {
    return this.core.getSync(this.cacheKey, this.settings).unwrap()
  }

  get aborter() {
    return this.core.getAborter(this.cacheKey)
  }

  get current() {
    return this.state.current
  }

  get data() {
    return this.state.data
  }

  get error() {
    return this.state.error
  }

  get real() {
    return this.state.real
  }

  get fake() {
    return this.state.fake
  }

  async mutate(mutator: Mutator<D, F>) {
    return new Ok(await this.core.mutate(this.cacheKey, mutator, this.settings))
  }

  async delete() {
    return new Ok(await this.core.delete(this.cacheKey, this.settings))
  }

  async fetch(aborter = new AbortController()): Promise<Result<State<D, F>, AbortedError | CooldownError | MissingFetcherError | PendingFetchError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrError(core, key, cacheKey, fetcher, aborter, settings)
    })
  }

  async refetch(aborter = new AbortController()): Promise<Result<State<D, F>, AbortedError | CooldownError | MissingFetcherError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, settings)
    })
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<State<D, F>, AbortedError | MissingFetcherError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await Simple.update(core, key, cacheKey, fetcher, updater, aborter, settings)
  }

}