import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, core } from "mods/core/core.js";
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

  private constructor(
    readonly cacheKey: string,
    readonly settings: FetcherlessQuerySettings<K, D, F>,
  ) { }

  static async make<K, D, F>(cacheKey: string, settings: FetcherlessQuerySettings<K, D, F>) {
    await core.get(cacheKey, settings)

    return new SimpleFetcherlessQueryInstance(cacheKey, settings)
  }

  get state(): State<D, F> {
    return Option.unwrap(core.getStateSync<D, F>(this.cacheKey))
  }

  get aborter(): Optional<AbortController> {
    return core.getAborterSync(this.cacheKey)
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
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
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

  private constructor(
    readonly cacheKey: string,
    readonly settings: FetcherfulQuerySettings<K, D, F>,
  ) { }

  static async make<K, D, F>(cacheKey: string, settings: FetcherfulQuerySettings<K, D, F>) {
    await core.get(cacheKey, settings)

    return new SimpleFetcherfulQueryInstance(cacheKey, settings)
  }

  get state(): State<D, F> {
    return Option.unwrap(core.getStateSync<D, F>(this.cacheKey))
  }

  get aborter(): Optional<AbortController> {
    return core.getAborterSync(this.cacheKey)
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
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, CooldownError>> {
    const { cacheKey, settings } = this

    if (Time.isAfterNow(this.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async update(updater: Updater<K, D, F>, aborter = new AbortController()): Promise<Result<Result<State<D, F>, FetchError>, never>> {
    const { cacheKey, settings } = this

    const result = await Simple.update(cacheKey, updater, aborter, settings)

    return new Ok(result)
  }

}