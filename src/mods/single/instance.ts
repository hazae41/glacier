import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { CooldownError, Core, MissingFetcherError, PendingFetchError } from "mods/core/core.js";
import { FetchError, Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { Simple } from "./helper.js";

export type SimpleQueryInstance<K, D, F> =
  | SimpleFetcherfulQueryInstance<K, D, F>
  | SimpleFetcherlessQueryInstance<K, D, F>

export class SimpleFetcherlessQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly fetcher: undefined

  readonly settings: QuerySettings<K, D, F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    fetcher: undefined,
    settings: QuerySettings<K, D, F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.fetcher = fetcher
    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, fetcher: undefined, qsettings: QuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new SimpleFetcherlessQueryInstance(core, key, cacheKey, fetcher, settings)
  }

  get state(): State<D, F> {
    return Option.unwrap(this.core.getStateSync<D, F>(this.cacheKey))
  }

  get aborter(): Optional<AbortController> {
    return this.core.getAborterSync(this.cacheKey)
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

  async fetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async refetch(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

}

export class SimpleFetcherfulQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly fetcher: Fetcher<K, D, F>

  readonly settings: QuerySettings<K, D, F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    fetcher: Fetcher<K, D, F>,
    settings: QuerySettings<K, D, F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.fetcher = fetcher
    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, fetcher: Fetcher<K, D, F>, qsettings: QuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new SimpleFetcherfulQueryInstance(core, key, cacheKey, fetcher, settings)
  }

  get state(): State<D, F> {
    return Option.unwrap(this.core.getStateSync<D, F>(this.cacheKey))
  }

  get aborter(): Optional<AbortController> {
    return this.core.getAborterSync(this.cacheKey)
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
    return await this.core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await this.core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<State<D, F>, FetchError | CooldownError | PendingFetchError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrError(core, key, cacheKey, fetcher, aborter, settings)
    })
  }

  async refetch(aborter = new AbortController()): Promise<Result<State<D, F>, FetchError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    return await core.lockOrReplace(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, settings)
    })
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<State<D, F>, FetchError>> {
    const { core, key, cacheKey, fetcher, settings } = this

    return await Simple.update(core, key, cacheKey, fetcher, updater, aborter, settings)
  }

}