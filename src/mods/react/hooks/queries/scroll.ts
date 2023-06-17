import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { Arrays } from "libs/arrays/arrays.js";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Scroll } from "mods/scroll/helper.js";
import { ScrollQuerySchema } from "mods/scroll/schema.js";
import { FetchError, Fetcher } from "mods/types/fetcher.js";
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
  scroll(): Promise<Result<Result<State<D[], F>, FetchError>, MissingFetcherError | MissingKeyError>>

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
  const core = useCore().unwrap()

  const scrollerRef = useRenderRef(scroller)
  const fetcherRef = useRenderRef(fetcher)
  const settingsRef = useRenderRef({ ...core.settings, ...settings })

  const key = useMemo(() => {
    return scroller?.()
  }, [scroller])

  const cacheKey = useMemo(() => {
    return Option.mapSync(key, () => Scroll.getCacheKey(key, settingsRef.current))
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[], F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    if (cacheKey === undefined)
      return

    stateRef.current = core.getStateSync<D[], F>(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
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

    const offState = core.onState.addListener(cacheKey, e => setState(e.detail))
    const offAborter = core.onAborter.addListener(cacheKey, e => setAborter(e.detail))

    core.increment(cacheKey, settingsRef.current)

    return () => {
      core.decrement(cacheKey, settingsRef.current)

      offState()
      offAborter()
    }
  }, [core, cacheKey])

  const mutate = useCallback(async (mutator: Mutator<D[], F>) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const state = await core.mutate(cacheKey, mutator, settingsRef.current)

    return new Ok(state)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const state = await core.delete(cacheKey, settingsRef.current)

    return new Ok(state)
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

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
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

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
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

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      throw new MissingKeyError()

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (scroller === undefined)
      throw new MissingKeyError()
    if (fetcher === undefined)
      throw new MissingFetcherError()

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, scroller, cacheKey, fetcher, aborter, settings))

    return new Ok(result)
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