import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { CooldownError, Core, MissingFetcherError } from "mods/core/core.js";
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Scroller } from "mods/types/scroller.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings, QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

export class ScrollFetcherfulQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly scroller: Scroller<K, D, F>

  readonly settings: FetcherfulQuerySettings<K, D[], F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    scroller: Scroller<K, D, F>,
    settings: FetcherfulQuerySettings<K, D[], F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.scroller = scroller

    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, scroller: Scroller<K, D, F>, qsettings: FetcherfulQuerySettings<K, D[], F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new ScrollFetcherfulQueryInstance(core, key, cacheKey, scroller, settings)
  }

  get state(): State<D[], F> {
    return Option.unwrap(this.core.getStateSync<D[], F>(this.cacheKey))
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

  peek() {
    return this.scroller?.(Option.mapSync(this.real?.data?.inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[], F>) {
    return await this.core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await this.core.delete(this.cacheKey, this.settings)
  }

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, CooldownError>> {
    const { core, scroller, cacheKey, settings } = this

    if (Time.isAfterNow(this.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, never>> {
    const { core, scroller, cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, aborter, settings))

    return new Ok(result)
  }

  async scroll(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, never>> {
    const { core, scroller, cacheKey, settings } = this

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(core, scroller, cacheKey, aborter, settings))

    return new Ok(result)
  }

}

export class ScrollFetcherlessQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly scroller: Scroller<K, D, F>

  readonly settings: QuerySettings<K, D[], F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    scroller: Scroller<K, D, F>,

    settings: FetcherlessQuerySettings<K, D[], F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.scroller = scroller

    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, scroller: Scroller<K, D, F>, qsettings: FetcherlessQuerySettings<K, D[], F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new ScrollFetcherlessQueryInstance(core, key, cacheKey, scroller, settings)
  }

  get state(): State<D[], F> {
    return Option.unwrap(this.core.getStateSync<D[], F>(this.cacheKey))
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

  peek() {
    return this.scroller?.(Option.mapSync(this.real?.data?.inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[], F>) {
    return await this.core.mutate(this.cacheKey, mutator, this.settings)
  }

  async delete() {
    return await this.core.delete(this.cacheKey, this.settings)
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