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
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QuerySettings, ScrollQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ScrollSchemaFactory<K, D, F, DL extends DependencyList> =
  (...deps: DL) => Optional<ScrollQuerySchema<K, D, F>>

export function useScrollQuery<K, D, F, DL extends DependencyList>(
  factory: ScrollSchemaFactory<K, D, F, DL>,
  deps: DL
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema === undefined)
    return useSkeletonScrollQuery()

  return useAnonymousScrollQuery<K, D, F>(schema.settings)
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

export function useSkeletonScrollQuery() {
  useCore().unwrap()

  useRenderRef(undefined)

  useMemo(() => {
    // NOOP
  }, [])

  useState()

  useRef()
  useRef()

  useMemo(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useEffect(() => {
    // NOOP
  }, [])

  useEffect(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  useCallback(() => {
    // NOOP
  }, [])

  return undefined
}

/**
 * Scroll query
 * @param scroller 
 * @param fetcher 
 * @param settings 
 * @returns 
 */
export function useAnonymousScrollQuery<K, D, F>(
  settings: QuerySettings<K, D[], F> & ScrollQuerySettings<K, D, F>,
): ScrollQuery<K, D, F> {
  const core = useCore().unwrap()

  const settingsRef = useRenderRef({ ...core.settings, ...settings })

  const cacheKey = useMemo(() => {
    return Scroll.getCacheKey(settings.key, settingsRef.current)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[], F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
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
    if (stateRef.current !== undefined)
      return

    core.get(cacheKey, settingsRef.current).then(setState)
  }, [core, cacheKey, settings])

  useEffect(() => {
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
    return await core.mutate(cacheKey, mutator, settingsRef.current)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    return await core.delete(cacheKey, settingsRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.first(core, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const scroll = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Scroll.scroll(core, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (settings.fetcher === undefined)
      throw new MissingFetcherError()

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Scroll.first(core, cacheKey, aborter, settings))

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
    return settings.scroller?.(Option.mapSync(state?.real?.data?.inner, Arrays.last))
  }, [state?.real?.data, settings.scroller])

  return {
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
    ...settings
  } satisfies ScrollQuery<K, D, F>
}