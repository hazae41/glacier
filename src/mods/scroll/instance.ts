import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, core } from "mods/core/core.js";
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { ScrollFetcherfulQuerySettings, ScrollFetcherlessQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

export class ScrollFetcherfulQueryInstance<K, D, F>  {

  private constructor(
    readonly cacheKey: string,
    readonly settings: ScrollFetcherfulQuerySettings<K, D, F>
  ) { }

  static async make<K, D, F>(cacheKey: string, settings: ScrollFetcherfulQuerySettings<K, D, F>) {
    await core.get(cacheKey, settings)

    return new ScrollFetcherfulQueryInstance(cacheKey, settings)
  }

  get state(): State<D[], F> {
    return Option.unwrap(core.getStateSync<D[], F>(this.cacheKey))
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

  peek() {
    return Option.mapSync(this.real?.data?.inner, pages => this.settings.scroller(Arrays.last(pages)))
  }

  async mutate(mutator: Mutator<D[], F>) {
    return await core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, CooldownError>> {
    const { cacheKey, settings } = this

    if (Time.isAfterNow(this.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(cacheKey, aborter, settings))

    return new Ok(result)
  }

  async scroll(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, never>> {
    const { cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(cacheKey, aborter, settings))

    return new Ok(result)
  }

}

export class ScrollFetcherlessQueryInstance<K, D, F>  {

  private constructor(
    readonly cacheKey: string,
    readonly settings: ScrollFetcherlessQuerySettings<K, D, F>
  ) { }

  static async make<K, D, F>(cacheKey: string, settings: ScrollFetcherlessQuerySettings<K, D, F>) {
    await core.get(cacheKey, settings)

    return new ScrollFetcherlessQueryInstance(cacheKey, settings)
  }

  get state(): State<D[], F> {
    return Option.unwrap(core.getStateSync<D[], F>(this.cacheKey))
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

  peek() {
    return Option.mapSync(this.real?.data?.inner, pages => this.settings.scroller(Arrays.last(pages)))
  }

  async mutate(mutator: Mutator<D[], F>) {
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

  async scroll(aborter = new AbortController()): Promise<Result<never, MissingFetcherError>> {
    return new Err(new MissingFetcherError())
  }

}