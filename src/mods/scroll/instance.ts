import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { CooldownError, Core, MissingFetcherError } from "mods/core/core.js";
import { FetchError, Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Scroll } from "./helper.js";

export class ScrollQueryInstance<K, D, F>  {
  readonly core: Core

  readonly key: K
  readonly cacheKey: string

  readonly scroller: Scroller<K, D, F>
  readonly fetcher?: Fetcher<K, D, F>

  readonly settings: QuerySettings<K, D[], F>

  private constructor(
    core: Core,

    key: K,
    cacheKey: string,

    scroller: Scroller<K, D, F>,
    fetcher: Optional<Fetcher<K, D, F>>,
    settings: QuerySettings<K, D[], F>,
  ) {
    this.core = core

    this.key = key
    this.cacheKey = cacheKey

    this.scroller = scroller
    this.fetcher = fetcher

    this.settings = settings
  }

  static async make<K, D, F>(core: Core, key: K, cacheKey: string, scroller: Scroller<K, D, F>, fetcher: Optional<Fetcher<K, D, F>>, qsettings: QuerySettings<K, D[], F>) {
    const settings = { ...core.settings, ...qsettings }

    await core.get(cacheKey, settings)

    return new ScrollQueryInstance(core, key, cacheKey, scroller, fetcher, settings)
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

  async fetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, CooldownError | MissingFetcherError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    if (Time.isAfterNow(this.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
  }

  async refetch(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, MissingFetcherError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
  }

  async scroll(aborter = new AbortController()): Promise<Result<Result<State<D[], F>, FetchError>, MissingFetcherError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
  }

}