import { Option } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { DataAndError, MissingFetcherError, MissingKeyError, State } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { useRenderRef } from "libs/react/ref.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Scroll } from "mods/scroll/helper.js";
import { ScrollQuerySchema } from "mods/scroll/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useScrollQuerySchema<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => ScrollQuerySchema<D, K> | undefined,
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
  scroll(): Promise<Result<State<D[]>, Error>>

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

  const scrollerRef = useRenderRef(scroller)
  const fetcherRef = useRenderRef(fetcher)
  const paramsRef = useRenderRef({ ...core.params, ...params })

  const key = useMemo(() => {
    return scroller?.()
  }, [scroller])

  const cacheKey = useMemo(() => {
    if (key === undefined)
      return undefined
    return Scroll.getCacheKey<D[], K>(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[]>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    if (cacheKey === undefined)
      return
    stateRef.current = core.getSync<D[], K>(cacheKey, paramsRef.current).ok().inner
  }, [core, cacheKey])

  const setState = useCallback((state: State) => {
    stateRef.current = state as State<D[]>
    setCounter(c => c + 1)
  }, [])

  const setAborter = useCallback((aborter?: AbortController) => {
    aborterRef.current = aborter
    setCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (cacheKey === undefined)
      return
    if (stateRef.current !== undefined)
      return

    core.get<D[], K>(cacheKey, paramsRef.current).then(setState)
  }, [core, cacheKey, params])

  useEffect(() => {
    if (cacheKey === undefined)
      return

    core.states.on(cacheKey, setState)
    core.aborters.on(cacheKey, setAborter)
    core.increment(cacheKey, paramsRef.current)

    return () => {
      core.decrement(cacheKey, paramsRef.current)
      core.states.off(cacheKey, setState)
      core.aborters.off(cacheKey, setAborter)
    }
  }, [core, cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[]>) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.mutate(cacheKey, mutator, paramsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.delete(cacheKey, paramsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.fetchOrError(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Scroll.firstOrWait(core, scroller, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const state = stateRef.current
  const aborter = aborterRef.current

  // const { data, realData, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const { time, cooldown, expiration } = state?.current?.current ?? {}

  const ready = state !== undefined
  const optimistic = state?.fake !== undefined
  const fetching = aborter !== undefined

  const { data, error } = DataAndError.from(state?.current)

  const real = DataAndError.from(state?.real)
  const fake = DataAndError.from(state?.fake)

  const peek = useCallback(() => {
    return scroller?.(Option.mapSync(state?.real?.data?.inner, Arrays.last))
  }, [state?.real?.data, scroller])

  return {
    key,
    cacheKey,
    data,
    error,
    real,
    fake,
    time,
    cooldown,
    expiration,
    ready,
    optimistic,
    aborter,
    fetching,
    mutate,
    fetch,
    refetch,
    scroll,
    clear,
    suspend,
    peek
  }
}