import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { AbortedError, CooldownError, Core, MissingFetcherError, PendingFetchError, ScrollError } from "mods/core/core.js";
import { Fetcher } from "mods/types/fetcher.js";
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

  peek() {
    return this.scroller?.(Option.mapSync(this.state.real?.data?.inner, Arrays.last))
  }

  async mutate(mutator: Mutator<D[], F>): Promise<Ok<State<D[], F>>> {
    return new Ok(await this.core.mutate(this.cacheKey, mutator, this.settings))
  }

  async delete(): Promise<Ok<State<D[], F>>> {
    return new Ok(await this.core.delete(this.cacheKey, this.settings))
  }

  async fetch(aborter = new AbortController()): Promise<Result<State<D[], F>, AbortedError | CooldownError | ScrollError | MissingFetcherError | PendingFetchError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, settings)
    })
  }

  async refetch(aborter = new AbortController()): Promise<Result<State<D[], F>, AbortedError | ScrollError | MissingFetcherError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings)
    })
  }

  async scroll(aborter = new AbortController()): Promise<Result<State<D[], F>, AbortedError | ScrollError | MissingFetcherError>> {
    const { core, scroller, cacheKey, fetcher, settings } = this

    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, settings)
    })
  }

}