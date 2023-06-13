import { Option, Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core, ScrollError } from "mods/core/core.js";
import { DEFAULT_EQUALS, DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";

export namespace Scroll {

  export function getCacheKey<K, D, F>(key: K, settings: QuerySettings<K, D, F>) {
    if (typeof key === "string")
      return key

    const { keySerializer = DEFAULT_SERIALIZER } = settings

    return `scroll:${keySerializer.stringify(key)}`
  }

  /**
   * Fetch first page and compare it to the previous first page
   * @param core 
   * @param scroller 
   * @param cacheKey 
   * @param fetcher 
   * @param aborter 
   * @param settings 
   * @returns 
   */
  export async function first<K, D, F>(
    core: Core,
    scroller: Scroller<K, D, F>,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D[], F>
  ): Promise<Result<State<D[], F>, AbortedError | ScrollError>> {
    const { equals = DEFAULT_EQUALS } = settings

    const key = scroller(undefined)

    if (key === undefined)
      return new Err(new ScrollError())

    const aborted = await core.runWithTimeout(async (signal) => {
      return await fetcher(key, { signal })
    }, aborter, settings.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), settings)
    const timed = Fetched.from(aborted.get()).setTimes(times).mapSync(data => [data])

    return new Ok(await core.mutate(cacheKey, async (previous) => {
      if (timed.isErr())
        return new Some(timed)

      const prenormalized = await core.prenormalize(timed, settings)

      if (previous.real?.data && equals(prenormalized.inner[0], previous.real.data.inner[0]))
        return new Some(previous.real.data)

      return new Some(timed)
    }, settings))
  }

  export async function firstOrError<K, D, F>(
    core: Core,
    scroller: Scroller<K, D, F>,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D[], F>
  ): Promise<Result<State<D[], F>, AbortedError | CooldownError | ScrollError>> {
    const previous = await core.get(cacheKey, settings)

    if (Time.isAfterNow(previous.real?.current.cooldown))
      return new Err(new CooldownError())

    return await first(core, scroller, cacheKey, fetcher, aborter, settings)
  }

  export async function firstOrWait<K, D, F>(
    core: Core,
    scroller: Scroller<K, D, F>,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D[], F>
  ): Promise<Result<State<D[], F>, AbortedError | CooldownError | ScrollError>> {
    const previous = await core.get(cacheKey, settings)

    const cooldown = Option
      .from(previous.real?.current.cooldown)
      .mapSync(Time.toDelay)
      .filterSync(x => x > 0)

    if (cooldown.isSome())
      await new Promise(ok => setTimeout(ok, cooldown.get()))

    return await first(core, scroller, cacheKey, fetcher, aborter, settings)
  }


  /**
   * Scroll to the next page
   * @param core 
   * @param scroller 
   * @param cacheKey 
   * @param fetcher 
   * @param aborter 
   * @param settings 
   * @returns 
   */
  export async function scroll<K, D, F>(
    core: Core,
    scroller: Scroller<K, D, F>,
    cacheKey: string,
    fetcher: Fetcher<K, D, F>,
    aborter: AbortController,
    settings: QuerySettings<K, D[], F>
  ): Promise<Result<State<D[], F>, AbortedError | ScrollError>> {
    const previous = await core.get(cacheKey, settings)
    const previousPages = previous.real?.data?.inner ?? []
    const previousPage = Arrays.last(previousPages)
    const key = scroller(previousPage)

    if (key === undefined)
      return new Err(new ScrollError())

    const aborted = await core.runWithTimeout(async (signal) => {
      return await fetcher(key, { signal })
    }, aborter, settings.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), settings)
    const timed = Fetched.from(aborted.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, (previous) => {
      const previousPages = previous.real?.data?.inner ?? []
      const paginated = timed.mapSync(data => [...previousPages, data])

      return new Some(paginated)
    }, settings))
  }
}