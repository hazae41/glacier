import { None, Nullable, Option } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { ScrollableQuery } from "index.js";
import { Arrays } from "libs/arrays/arrays.js";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, MissingKeyError, core } from "mods/core/core.js";
import { Scrollable } from "mods/queries/scroll/helper.js";
import { FetcherfulReactQuery, FetcherlessReactQuery, SkeletonReactQuery } from "mods/react/types/query.js";
import { Mutator } from "mods/types/mutator.js";
import { ScrollableFetcherfulQuerySettings, ScrollableFetcherlessQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useScrollableQuery<T extends ScrollableQuery.Infer<T>, L extends DependencyList>(
  factory: (...deps: L) => T,
  deps: L
): ScrollableQuery.Reactify<T> {
  const query = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (query == null)
    return useSkeletonScrollableQuery() as ScrollableQuery.Reactify<T>

  if (query.settings.fetcher == null)
    return useFetcherlessScrollableQuery(query.settings) as ScrollableQuery.Reactify<T>

  return useFetcherfulScrollableQuery(query.settings) as ScrollableQuery.Reactify<T>
}

export interface ScrollableSkeletonReactQuery<K, D, F> extends SkeletonReactQuery<K, D[], F> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<Result<never, MissingKeyError>>

  /**
   * The next key to be fetched
   */
  peek(): undefined
}

/**
 * Query for a scrolling resource
 */
export interface ScrollableFetcherlessReactQuery<K, D, F> extends FetcherlessReactQuery<K, D[], F> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<Result<Result<never, MissingFetcherError>, never>>

  /**
   * The next key to be fetched
   */
  peek(): Nullable<K>
}

/**
 * Query for a scrolling resource
 */
export interface ScrollableFetcherfulReactQuery<K, D, F> extends FetcherfulReactQuery<K, D[], F> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<Result<Result<Result<State<D[], F>, Error>, never>, never>>

  /**
   * The next key to be fetched
   */
  peek(): Nullable<K>
}

export function useSkeletonScrollableQuery<K, D, F>(): ScrollableSkeletonReactQuery<K, D, F> {
  useRenderRef(undefined)

  const cacheKey = useMemo(() => {
    // NOOP
  }, [undefined])

  useState(0)

  useRef()
  useRef()

  useMemo(() => {
    // NOOP
  }, [cacheKey])

  useCallback(() => {
    // NOOP
  }, [cacheKey])

  useCallback(() => {
    // NOOP
  }, [cacheKey])

  useEffect(() => {
    // NOOP
  }, [cacheKey])

  useEffect(() => {
    // NOOP
  }, [cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[], F>) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const clear = useCallback(async () => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const peek = useCallback(() => {
    return undefined
  }, [undefined, undefined])

  return { mutate, clear, fetch, refetch, scroll, suspend, peek }
}

/**
 * Scroll query
 * @param scroller 
 * @param fetcher 
 * @param settings 
 * @returns 
 */
export function useFetcherlessScrollableQuery<K, D, F>(
  settings: ScrollableFetcherlessQuerySettings<K, D, F>,
): ScrollableFetcherlessReactQuery<K, D, F> {
  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Scrollable.getCacheKey(settings.key)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Nullable<State<D[], F>>>()
  const aborterRef = useRef<Nullable<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync<D[], F>(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [cacheKey])

  const setState = useCallback((state: Nullable<State<D[], F>>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [cacheKey])

  const setAborter = useCallback((aborter: Nullable<AbortController>) => {
    aborterRef.current = aborter
    setCounter(c => c + 1)
  }, [cacheKey])

  useEffect(() => {
    if (stateRef.current != null)
      return
    core.tryGet(cacheKey, settingsRef.current).then(r => r.inspectSync(setState))
  }, [cacheKey])

  useEffect(() => {
    const onState = () => {
      core.tryGet(cacheKey, settingsRef.current).then(r => r.inspectSync(setState))
      return new None()
    }

    const onAborter = () => {
      setAborter(core.getAborterSync(cacheKey))
      return new None()
    }

    core.onState.on(cacheKey, onState, { passive: true })
    core.onAborter.on(cacheKey, onAborter, { passive: true })

    core.increment(cacheKey, settingsRef.current)

    return () => {
      core.decrement(cacheKey, settingsRef.current)

      core.onState.off(cacheKey, onState)
      core.onAborter.off(cacheKey, onAborter)
    }
  }, [cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[], F>) => {
    return await core.tryMutate(cacheKey, mutator, settingsRef.current)
  }, [cacheKey])

  const clear = useCallback(async () => {
    return await core.tryDelete(cacheKey, settingsRef.current)
  }, [cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [cacheKey])

  const state = stateRef.current
  const aborter = aborterRef.current

  const ready = state != null
  const fetching = aborter != null
  const optimistic = state?.isFake()

  const current = state?.current
  const data = state?.data
  const error = state?.error

  const real = state?.real
  const fake = state?.fake

  const peek = useCallback(() => {
    return Option.mapSync(state?.real?.data?.inner, pages => settings.scroller(Arrays.last(pages)))
  }, [state?.real?.data, settings.scroller])

  return {
    ...settings,
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
    peek,
  }
}

export function useFetcherfulScrollableQuery<K, D, F>(
  settings: ScrollableFetcherfulQuerySettings<K, D, F>,
): ScrollableFetcherfulReactQuery<K, D, F> {
  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Scrollable.getCacheKey(settings.key)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Nullable<State<D[], F>>>()
  const aborterRef = useRef<Nullable<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync<D[], F>(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [cacheKey])

  const setState = useCallback((state: Nullable<State<D[], F>>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [cacheKey])

  const setAborter = useCallback((aborter: Nullable<AbortController>) => {
    aborterRef.current = aborter
    setCounter(c => c + 1)
  }, [cacheKey])

  useEffect(() => {
    if (stateRef.current != null)
      return
    core.tryGet(cacheKey, settingsRef.current).then(r => r.inspectSync(setState))
  }, [cacheKey])

  useEffect(() => {
    const onState = () => {
      core.tryGet(cacheKey, settingsRef.current).then(r => r.inspectSync(setState))
      return new None()
    }

    const onAborter = () => {
      setAborter(core.getAborterSync(cacheKey))
      return new None()
    }

    core.onState.on(cacheKey, onState, { passive: true })
    core.onAborter.on(cacheKey, onAborter, { passive: true })

    core.increment(cacheKey, settingsRef.current)

    return () => {
      core.decrement(cacheKey, settingsRef.current)

      core.onState.off(cacheKey, onState)
      core.onAborter.off(cacheKey, onAborter)
    }
  }, [cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[], F>) => {
    return await core.tryMutate(cacheKey, mutator, settingsRef.current)
  }, [cacheKey])

  const clear = useCallback(async () => {
    return await core.tryDelete(cacheKey, settingsRef.current)
  }, [cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Ok(new Ok(new Err(new CooldownError())))

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scrollable.tryFetch(cacheKey, aborter, settings))

    return new Ok(new Ok(new Ok(result)))
  }, [cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scrollable.tryFetch(cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scrollable.tryScroll(cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scrollable.tryFetch(cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [cacheKey])

  const state = stateRef.current
  const aborter = aborterRef.current

  const ready = state != null
  const fetching = aborter != null
  const optimistic = state?.isFake()

  const current = state?.current
  const data = state?.data
  const error = state?.error

  const real = state?.real
  const fake = state?.fake

  const peek = useCallback(() => {
    return Option.mapSync(state?.real?.data?.inner, pages => settings.scroller(Arrays.last(pages)))
  }, [state?.real?.data, settings.scroller])

  return {
    ...settings,
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