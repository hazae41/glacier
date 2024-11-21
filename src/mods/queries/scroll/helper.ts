import { Some } from "@hazae41/option";
import { Arrays } from "libs/arrays/arrays.js";
import { equals } from "libs/equals/index.js";
import { core } from "mods/core/core.js";
import { Fetched } from "mods/fetched/fetched.js";
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
  export async function fetchOrThrow<K, D, F>(
    cacheKey: string,
    signal: AbortSignal,
    settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ): Promise<State<D[], F>> {
    const fetched = Fetched.from(await settings.fetcher(settings.key, { signal }))

    return await core.mutateOrThrow(cacheKey, async (previous) => {
      if (fetched.isErr())
        return new Some(fetched)

      const prenormalized = await core.prenormalizeOrThrow(fetched, settings)

      if (prenormalized?.isData() && previous.real?.data && equals(prenormalized.get(), previous.real.data.get()))
        return new Some(previous.real.data)

      return new Some(fetched)
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
  export async function scrollOrThrow<K, D, F>(
    cacheKey: string,
    signal: AbortSignal,
    settings: ScrollableFetcherfulQuerySettings<K, D, F>
  ): Promise<State<D[], F>> {
    const previous = await core.getOrThrow(cacheKey, settings)
    const previousPages = previous.real?.data?.get() ?? []
    const previousPage = Arrays.last(previousPages)
    const key = settings.scroller(previousPage)

    if (key == null)
      throw new ScrollError()

    const fetched = Fetched.from(await settings.fetcher(key, { signal }))

    return await core.mutateOrThrow(cacheKey, async (previous) => {
      const previousPages = previous.real?.data?.get() ?? []
      const paginated = fetched.mapSync(data => [...previousPages, ...data])

      return new Some(paginated)
    }, settings)
  }
}