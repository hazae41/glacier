import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { FetcherfulQuery, FetcherlessQuery, SkeletonQuery } from "mods/react/types/query.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useQuery<T extends SimpleQuerySchema.Infer<T>, L extends DependencyList>(
  factory: (...deps: L) => T,
  deps: L
): SimpleQuerySchema.Queried<T> {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema == null)
    return useSimpleSkeletonQuery() as SimpleQuerySchema.Queried<T>

  if (schema.settings.fetcher == null)
    return useSimpleFetcherlessQuery(schema.settings) as SimpleQuerySchema.Queried<T>

  return useSimpleFetcherfulQuery(schema.settings) as SimpleQuerySchema.Queried<T>
}

/**
 * Query for a single resource
 */
export interface SimpleSkeletonQuery<K, D, F> extends SkeletonQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<never, MissingKeyError>>
}

/**
 * Query for a single resource
 */
export interface SimpleFetcherfulQuery<K, D, F> extends FetcherfulQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<Result<State<D, F>, FetchError>, never>, never>>
}

/**
 * Query for a single resource
 */
export interface SimpleFetcherlessQuery<K, D, F> extends FetcherlessQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<never, MissingFetcherError>, never>>
}

export function useSimpleSkeletonQuery<K, D, F>(): SimpleSkeletonQuery<K, D, F> {
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    return new Err(new MissingKeyError())
  }, [])

  const clear = useCallback(async () => {
    return new Err(new MissingKeyError())
  }, [])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [])

  return { mutate, clear, fetch, refetch, update, suspend }
}

export function useSimpleFetcherlessQuery<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>,
): SimpleFetcherlessQuery<K, D, F> {
  const core = useCore().unwrap()

  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key, settingsRef.current)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Optional<State<D, F>>>()
  const aborterRef = useRef<Optional<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [core, cacheKey])

  const setState = useCallback((state: State<D, F>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const setAborter = useCallback((aborter: Optional<AbortController>) => {
    aborterRef.current = aborter
    setCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (stateRef.current != null)
      return

    core.get(cacheKey, settingsRef.current).then(setState)
  }, [core, cacheKey])

  useEffect(() => {
    if (cacheKey == null)
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    return new Ok(await core.mutate(cacheKey, mutator, settingsRef.current))
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    return new Ok(await core.delete(cacheKey, settingsRef.current))
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Ok(new Err(new MissingFetcherError()))
  }, [])

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
    fetching,
    aborter,
    mutate,
    fetch,
    refetch,
    update,
    clear,
    suspend
  }
}

export function useSimpleFetcherfulQuery<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>,
): SimpleFetcherfulQuery<K, D, F> {
  const core = useCore().unwrap()

  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key, settingsRef.current)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Optional<State<D, F>>>()
  const aborterRef = useRef<Optional<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [core, cacheKey])

  const setState = useCallback((state: State<D, F>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const setAborter = useCallback((aborter: Optional<AbortController>) => {
    aborterRef.current = aborter
    setCounter(c => c + 1)
  }, [])

  useEffect(() => {
    if (stateRef.current != null)
      return

    core.get(cacheKey, settingsRef.current).then(setState)
  }, [core, cacheKey])

  useEffect(() => {
    if (cacheKey == null)
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    return new Ok(await core.mutate(cacheKey, mutator, settingsRef.current))
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    return new Ok(await core.delete(cacheKey, settingsRef.current))
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Ok(new Ok(new Err(new CooldownError())))

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

    return new Ok(new Ok(new Ok(result)))
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await Simple.update(core, cacheKey, updater, aborter, settings)

    return new Ok(new Ok(result))
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [core, cacheKey])

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
    fetching,
    aborter,
    mutate,
    fetch,
    refetch,
    update,
    clear,
    suspend
  }
}