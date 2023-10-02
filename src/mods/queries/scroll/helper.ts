import { Some } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { core } from "mods/core/core.js";
import { DEFAULT_EQUALS } from "mods/defaults.js";
import { Fetched } from "mods/fetched/fetched.js";
import { TimesInit } from "mods/fetched/times.js";
import { ScrollableFetcherfulQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";

export class ScrollError extends Error {
  readonly #class = ScrollError
  readonly name = this.#class.name

  constructor() {
    super(`Could not scroll`)
  }

}

export namespace Scrollable {

  export function getCacheKey<K>(key: K) {
    if (typeof key === "string")
      return key
    return `scroll:${JSON.stringify(key)}`
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
  export async function tryFetch<K, D, F>(
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

    return await core.tryMutate(cacheKey, async (previous) => {
      return await Result.unthrow(async t => {
        if (timed.isErr())
          return new Ok(new Some(timed))

        const prenormalized = await core.tryPrenormalize(timed, settings).then(r => r.throw(t))

        if (prenormalized?.isData() && previous.real?.data && dataEqualser(prenormalized.inner, previous.real.data.inner))
          return new Ok(new Some(previous.real.data))

        return new Ok(new Some(timed))
      })
    }, settings)
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
  export async function tryScroll<K, D, F>(
    cacheKey: string,
    aborter: AbortController,
    settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ): Promise<Result<State<D[], F>, Error>> {
    return await Result.unthrow(async t => {
      const previous = await core.tryGet(cacheKey, settings).then(r => r.throw(t))
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

      return await core.tryMutate(cacheKey, async (previous) => {
        const previousPages = previous.real?.data?.inner ?? []
        const paginated = timed.mapSync(data => [...previousPages, ...data])

        return new Ok(new Some(paginated))
      }, settings)
    })
  }
}