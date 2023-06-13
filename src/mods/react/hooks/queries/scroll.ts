import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { useRenderRef } from "libs/react/ref.js";
import { MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Scroll } from "mods/scroll/helper.js";
import { ScrollQuerySchema } from "mods/scroll/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Scroller } from "mods/types/scroller.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ScrollSchemaFactory<K, D, F, DL extends DependencyList> =
  (...deps: DL) => Optional<ScrollQuerySchema<K, D, F>>

export function useScrollQuery<K, D, F, DL extends DependencyList>(
  factory: ScrollSchemaFactory<K, D, F, DL>,
  deps: DL
) {
  const { scroller, fetcher, settings } = useMemo(() => {
    return factory(...deps)
  }, deps) ?? {}

  return useAnonymousScrollQuery<K, D, F>(scroller, fetcher, settings)
}

/**
 * Query for a scrolling resource
 */
export interface ScrollQuery<K, D, F> extends Query<K, D[], F> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<Result<State<D[], F>, Error>>

  /**
   * The next key to be fetched
   */
  peek(): Optional<K>
}

/**
 * Scroll query
 * @param scroller 
 * @param fetcher 
 * @param settings 
 * @returns 
 */
export function useAnonymousScrollQuery<K, D, F>(
  scroller: Optional<Scroller<K, D, F>>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D[], F> = {},
): ScrollQuery<K, D, F> {
  const core = useCore()

  const scrollerRef = useRenderRef(scroller)
  const fetcherRef = useRenderRef(fetcher)
  const settingsRef = useRenderRef({ ...core.settings, ...settings })

  const key = useMemo(() => {
    return scroller?.()
  }, [scroller])

  const cacheKey = useMemo(() => {
    if (key === undefined)
      return undefined
    return Scroll.getCacheKey(key, settingsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[], F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    if (cacheKey === undefined)
      return
    stateRef.current = core.getSync<K, D[], F>(cacheKey, settingsRef.current).ok().inner
  }, [core, cacheKey])

  const setState = useCallback((state: State<D[], F>) => {
    stateRef.current = state
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

    core.get(cacheKey, settingsRef.current).then(setState)
  }, [core, cacheKey, settings])

  useEffect(() => {
    if (cacheKey === undefined)
      return

    core.states.on(cacheKey, setState)
    core.aborters.on(cacheKey, setAborter)
    core.increment(cacheKey, settingsRef.current)

    return () => {
      core.decrement(cacheKey, settingsRef.current)
      core.states.off(cacheKey, setState)
      core.aborters.off(cacheKey, setAborter)
    }
  }, [core, cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[], F>) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.mutate(cacheKey, mutator, settingsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.delete(cacheKey, settingsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Scroll.firstOrError(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (scroller === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndLock(cacheKey, aborter, async () => {
      return await Scroll.firstOrWait(core, scroller, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const state = stateRef.current
  const aborter = aborterRef.current

  const ready = state !== undefined
  const fetching = aborter !== undefined
  const optimistic = state?.isFake()

  const current = state?.current
  const data = state?.data
  const error = state?.error

  const real = state?.real
  const fake = state?.fake

  const peek = useCallback(() => {
    return scroller?.(Option.mapSync(state?.real?.data?.inner, Arrays.last))
  }, [state?.real?.data, scroller])

  return {
    key,
    cacheKey,
    current,
    data,
    error,
    real,
    fake,
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