import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Time } from "libs/time/time.js";
import { CooldownError, Core, MissingFetcherError } from "mods/core/core.js";
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings } from "mods/types/settings.js";
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

  readonly settings: FetcherlessQuerySettings<K, D, F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    settings: FetcherlessQuerySettings<K, D, F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey
    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, qsettings: FetcherlessQuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new SimpleFetcherlessQueryInstance(core, key, cacheKey, settings)
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

  readonly settings: FetcherfulQuerySettings<K, D, F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    settings: FetcherfulQuerySettings<K, D, F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, qsettings: FetcherfulQuerySettings<K, D, F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new SimpleFetcherfulQueryInstance(core, key, cacheKey, settings)
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

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, CooldownError>> {
    const { core, key, cacheKey, settings } = this

    if (Time.isAfterNow(this.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, key, cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, never>> {
    const { core, key, cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(core, key, cacheKey, aborter, settings))

    return new Ok(result)
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, never>> {
    const { core, key, cacheKey, settings } = this

    const result = await Simple.update(core, key, cacheKey, updater, aborter, settings)

    return new Ok(result)
  }

}