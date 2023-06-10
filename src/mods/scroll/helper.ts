import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Fetched, State, TimesInit } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { Time } from "libs/time/time.js";
import { AbortedError, CooldownError, Core, ScrollError } from "mods/core/core.js";
import { DEFAULT_EQUALS, DEFAULT_SERIALIZER } from "mods/defaults.js";
import { Fetcher } from "mods/types/fetcher.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";

export namespace Scroll {

  export function getCacheKey<D, K>(key: Optional<K>, params: QueryParams<D, K>) {
    if (key === undefined)
      return undefined
    if (typeof key === "string")
      return key

    const {
      keySerializer = DEFAULT_SERIALIZER
    } = params

    return `scroll:${keySerializer.stringify(key)}`
  }

  /**
   * Fetch first page and compare it to the previous first page
   * @param core 
   * @param scroller 
   * @param cacheKey 
   * @param fetcher 
   * @param aborter 
   * @param params 
   * @returns 
   */
  export async function first<D, K>(
    core: Core,
    scroller: Scroller<D, K>,
    cacheKey: string,
    fetcher: Fetcher<D, K>,
    aborter: AbortController,
    params: QueryParams<D[], K>
  ): Promise<Result<State<D[]>, AbortedError>> {
    const { equals = DEFAULT_EQUALS } = params

    const previous = await core.get(cacheKey, params)

    if (Time.isAfterNow(previous.real?.cooldown))
      return new Err(AbortedError.from(new CooldownError()))

    const key = scroller(undefined)

    if (key === undefined)
      return new Err(AbortedError.from(new ScrollError()))

    const aborted = await core.catchAndTimeout(async (signal) => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    const times = TimesInit.merge(aborted.get(), params)
    const timed = Fetched.rewrap(aborted.get(), times)

    return new Ok(await core.mutate(cacheKey, async (previous) => {
      return await timed.map(async (data) => {
        const prenormalized = await core.prenormalize([data], params)

        if (previous.real?.isData() && equals(prenormalized[0], previous.real.data[0]))
          return previous.real.data

        return [data]
      })
    }, params))
  }

  /**
   * Scroll to the next page
   * @param cacheKey Storage key
   * @param scroller Key scroller
   * @param fetcher Resource fetcher
   * @param aborter AbortController
   * @param tparams Time parameters
   * @param replacePending Should ignore cooldown
   * @returns The new state
   */
  export async function scroll<D, K>(
    core: Core,
    scroller: Scroller<D, K>,
    cacheKey: string,
    fetcher: Fetcher<D, K>,
    aborter: AbortController,
    params: QueryParams<D[], K>
  ): Promise<Result<State<D[]>, AbortedError>> {
    const previous = await core.get(cacheKey, params)

    if (Time.isAfterNow(previous.real?.cooldown))
      return new Err(AbortedError.from(new CooldownError()))

    const previousPages = previous.real?.ok().inner ?? []
    const previousPage = Arrays.last(previousPages)
    const key = scroller(previousPage)

    if (key === undefined)
      return new Err(AbortedError.from(new ScrollError()))

    const aborted = await core.catchAndTimeout(async (signal) => {
      return await fetcher(key, { signal })
    }, aborter, params.timeout)

    if (aborted.isErr())
      return aborted

    let { time, cooldown, expiration } = TimesInit.merge(aborted.get(), params)

    return new Ok(await core.mutate(cacheKey, (previous) => {
      if (expiration !== undefined && previous.real?.expiration !== undefined)
        expiration = Math.min(expiration, previous.real.expiration)

      const times = { time, cooldown, expiration }
      const timed = Fetched.rewrap(aborted.get(), times)

      const previousPages = previous.real?.ok().inner ?? []
      return timed.mapSync(data => [...previousPages, data])
    }, params))
  }
}