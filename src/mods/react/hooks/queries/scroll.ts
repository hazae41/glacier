import { Arrays } from "libs/arrays/arrays.js";
import { useAutoRef } from "libs/react/ref.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Scroll } from "mods/scroll/helper.js";
import { ScrollSchema } from "mods/scroll/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { FullState } from "mods/types/state.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useScrollSchema<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollSchema<D, K> | undefined,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  const { scroller, fetcher, params } = schema ?? {}
  return useScrollQuery<D, K>(scroller, fetcher, params)
}

/**
 * Query for a scrolling resource
 */
export interface ScrollQuery<D = unknown, K = unknown> extends Query<D[], K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<FullState<D[]> | undefined>

  /**
   * The next key to be fetched
   */
  peek(): K | undefined
}

/**
 * Scrolling resource query factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling query
 */
export function useScrollQuery<D = unknown, K = string>(
  scroller: Scroller<D, K> | undefined,
  fetcher: Fetcher<D, K> | undefined,
  params: QueryParams<D[], K> = {},
): ScrollQuery<D, K> {
  const core = useCore()

  const scrollerRef = useAutoRef(scroller)
  const fetcherRef = useAutoRef(fetcher)
  const paramsRef = useAutoRef({ ...core.params, ...params })

  const key = useMemo(() => {
    return scroller?.()
  }, [scroller])

  const cacheKey = useMemo(() => {
    return Scroll.getCacheKey<D[], K>(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<FullState<D[]> | null>()

  useMemo(() => {
    stateRef.current = core.getSync<D[], K>(cacheKey, paramsRef.current)
  }, [core, cacheKey])

  const setState = useCallback((state?: FullState<D[]>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (stateRef.current !== null)
      return

    core.get<D[], K>(cacheKey, paramsRef.current).then(setState)
  }, [core, cacheKey, params])

  useEffect(() => {
    if (!cacheKey)
      return

    core.on(cacheKey, setState, paramsRef.current)
    return () => void core.decrement(cacheKey, setState, paramsRef.current)
  }, [core, cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[]>) => {
    if (typeof window === "undefined")
      throw new Error("Can't mutate on SSR")

    const params = paramsRef.current

    return await core.mutate(cacheKey, mutator, params)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    if (typeof window === "undefined")
      throw new Error("Can't clear on SSR")

    await core.delete(cacheKey, paramsRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't fetch on SSR")

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, params)
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't refetch on SSR")

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, params, true, true)
  }, [core, cacheKey])

  const scroll = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't scroll on SSR")

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, params, true, true)
  }, [core, cacheKey])

  const suspend = useCallback(() => {
    if (typeof window === "undefined")
      throw new Error("Can't suspend on SSR")

    return (async () => {
      const scroller = scrollerRef.current
      const fetcher = fetcherRef.current
      const params = paramsRef.current

      const background = new Promise<void>(ok => core.once(cacheKey, () => ok(), params))
      await Scroll.first(core, scroller, cacheKey, fetcher, undefined, params, false, true)
      await background
    })()
  }, [core, cacheKey])

  const state = stateRef.current

  const { data, realData, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null

  const peek = useCallback(() => {
    const current = Arrays.tryLast(data)
    return scroller?.(current)
  }, [data, scroller])

  return {
    key,
    cacheKey,
    data,
    realData,
    error,
    time,
    cooldown,
    expiration,
    ready,
    mutate,
    fetch,
    refetch,
    scroll,
    clear,
    suspend,
    peek,
    aborter,
    optimistic,
    get loading() { return Boolean(this.aborter) },
  }
}