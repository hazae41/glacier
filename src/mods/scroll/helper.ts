import { Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { core } from "mods/core/core.js";
import { DEFAULT_EQUALS, DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetched } from "mods/result/fetched.js";
import { TimesInit } from "mods/result/times.js";
import { QuerySettings, ScrollableFetcherfulQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";

export class ScrollError extends Error {
  readonly #class = ScrollError
  readonly name = this.#class.name

  constructor() {
    super(`Could not scroll`)
  }

}

export namespace Scrollable {

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
    cacheKey: string,
    aborter: AbortController,
    settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ): Promise<Result<State<D[], F>, Error>> {
    const { dataEqualser = DEFAULT_EQUALS } = settings

    const result = await core.runWithTimeout(async (signal) => {
      return await settings.fetcher(settings.key, { signal })
    }, aborter, settings.timeout)

    if (result.isErr())
      return result

    const times = TimesInit.merge(result.get(), settings)
    const timed = Fetched.from(result.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, async (previous) => {
      if (timed.isErr())
        return new Some(timed)

      const prenormalized = await core.prenormalize(timed, settings)

      if (prenormalized?.isData() && previous.real?.data && dataEqualser(prenormalized.inner, previous.real.data.inner))
        return new Some(previous.real.data)

      return new Some(timed)
    }, settings))
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
    cacheKey: string,
    aborter: AbortController,
    settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ): Promise<Result<State<D[], F>, Error>> {
    const previous = await core.get(cacheKey, settings)
    const previousPages = previous.real?.data?.inner ?? []
    const previousPage = Arrays.last(previousPages)
    const key = settings.scroller(previousPage)

    if (key == null)
      return new Err(new ScrollError())

    const result = await core.runWithTimeout(async (signal) => {
      return await settings.fetcher(key, { signal })
    }, aborter, settings.timeout)

    if (result.isErr())
      return result

    const times = TimesInit.merge(result.get(), settings)
    const timed = Fetched.from(result.get()).setTimes(times)

    return new Ok(await core.mutate(cacheKey, (previous) => {
      const previousPages = previous.real?.data?.inner ?? []
      const paginated = timed.mapSync(data => [...previousPages, ...data])

      return new Some(paginated)
    }, settings))
  }
}