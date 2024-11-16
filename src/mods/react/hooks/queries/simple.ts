import { None, Nullable } from "@hazae41/option";
import { Err, Fallback, Ok } from "@hazae41/result";
import { SimpleQuery } from "index.js";
import { useRenderRef } from "libs/react/ref.js";
import { shouldUseCacheIfFresh, shouldUseCacheIfStale } from "libs/request/index.js";
import { AbortSignals } from "libs/signals/index.js";
import { Time } from "libs/time/time.js";
import { MissingFetcherError, MissingKeyError, core } from "mods/core/core.js";
import { Simple } from "mods/queries/simple/helper.js";
import { FetcherfulReactQuery, FetcherlessReactQuery, SkeletonReactQuery } from "mods/react/types/query.js";
import { Mutator } from "mods/types/mutator.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useQuery<T extends SimpleQuery.Infer<T>, L extends DependencyList>(
  factory: (...deps: L) => T,
  deps: L
): SimpleQuery.ReactifyOrSkeleton<T> {
  const query = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (query == null)
    return useSimpleSkeletonQuery() as SimpleQuery.ReactifyOrSkeleton<T>

  if (query.settings.fetcher == null)
    return useSimpleFetcherlessQuery(query.settings) as SimpleQuery.ReactifyOrSkeleton<T>

  return useSimpleFetcherfulQuery(query.settings) as SimpleQuery.ReactifyOrSkeleton<T>
}

/**
 * Query for a simple resource
 */
export interface SimpleSkeletonReactQuery<K, D, F> extends SkeletonReactQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  updateOrThrow(updater: Updater<K, D, F>, init?: RequestInit): Promise<never>
}

/**
 * Query for a simple resource
 */
export interface SimpleFetcherfulReactQuery<K, D, F> extends FetcherfulReactQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  updateOrThrow(updater: Updater<K, D, F>, init?: RequestInit): Promise<Fallback<State<D, F>>>
}

/**
 * Query for a simple resource
 */
export interface SimpleFetcherlessReactQuery<K, D, F> extends FetcherlessReactQuery<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  updateOrThrow(updater: Updater<K, D, F>, init?: RequestInit): Promise<never>
}

export function useSimpleSkeletonQuery<K, D, F>(): SimpleSkeletonReactQuery<K, D, F> {
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

  const mutateOrThrow = useCallback(async (mutator: Mutator<D, F>) => {
    throw new MissingKeyError()
  }, [cacheKey])

  const deleteOrThrow = useCallback(async () => {
    throw new MissingKeyError()
  }, [cacheKey])

  const fetchOrThrow = useCallback(async (aborter = new AbortController()) => {
    throw new MissingKeyError()
  }, [cacheKey])

  const refetchOrThrow = useCallback(async (aborter = new AbortController()) => {
    throw new MissingKeyError()
  }, [cacheKey])

  const updateOrThrow = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    throw new MissingKeyError()
  }, [cacheKey])

  return { mutateOrThrow, deleteOrThrow, fetchOrThrow, refetchOrThrow, updateOrThrow }
}

export function useSimpleFetcherlessQuery<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>,
): SimpleFetcherlessReactQuery<K, D, F> {
  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Nullable<State<D, F>>>()
  const aborterRef = useRef<Nullable<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [cacheKey])

  const setState = useCallback((state: Nullable<State<D, F>>) => {
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
    core.getOrThrow(cacheKey, settingsRef.current).then(setState).catch(console.warn)
  }, [cacheKey])

  useEffect(() => {
    const onState = () => {
      core.getOrThrow(cacheKey, settingsRef.current).then(setState).catch(console.warn)
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
      core.decrementOrThrow(cacheKey, settingsRef.current)

      core.onState.off(cacheKey, onState)
      core.onAborter.off(cacheKey, onAborter)
    }
  }, [cacheKey])

  const mutateOrThrow = useCallback(async (mutator: Mutator<D, F>) => {
    return await core.mutateOrThrow(cacheKey, mutator, settingsRef.current)
  }, [cacheKey])

  const deleteOrThrow = useCallback(async () => {
    return await core.deleteOrThrow(cacheKey, settingsRef.current)
  }, [cacheKey])

  const fetchOrThrow = useCallback(async (init?: RequestInit) => {
    throw new MissingFetcherError()
  }, [cacheKey])

  const refetchOrThrow = useCallback(async (init?: RequestInit) => {
    throw new MissingFetcherError()
  }, [cacheKey])

  const updateOrThrow = useCallback(async (updater: Updater<K, D, F>, init?: RequestInit) => {
    throw new MissingFetcherError()
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
    mutateOrThrow,
    fetchOrThrow,
    refetchOrThrow,
    updateOrThrow,
    deleteOrThrow,
  }
}

export function useSimpleFetcherfulQuery<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>,
): SimpleFetcherfulReactQuery<K, D, F> {
  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<Nullable<State<D, F>>>()
  const aborterRef = useRef<Nullable<AbortController>>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [cacheKey])

  const setState = useCallback((state: Nullable<State<D, F>>) => {
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
    core.getOrThrow(cacheKey, settingsRef.current).then(setState).catch(console.warn)
  }, [cacheKey])

  useEffect(() => {
    const onState = () => {
      core.getOrThrow(cacheKey, settingsRef.current).then(setState).catch(console.warn)
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
      core.decrementOrThrow(cacheKey, settingsRef.current)

      core.onState.off(cacheKey, onState)
      core.onAborter.off(cacheKey, onAborter)
    }
  }, [cacheKey])

  const mutateOrThrow = useCallback(async (mutator: Mutator<D, F>) => {
    return await core.mutateOrThrow(cacheKey, mutator, settingsRef.current)
  }, [cacheKey])

  const deleteOrThrow = useCallback(async () => {
    return await core.deleteOrThrow(cacheKey, settingsRef.current)
  }, [cacheKey])

  const fetchOrThrow = useCallback(async (init?: RequestInit): Promise<Fallback<State<D, F>>> => {
    const state = stateRef.current
    const settings = settingsRef.current

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state?.real?.current.cooldown))
      return new Err(state!)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state?.real?.current.expiration))
      return new Err(state!)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrJoin(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, signal, settings)))
  }, [cacheKey])

  const refetchOrThrow = useCallback(async (init?: RequestInit): Promise<Fallback<State<D, F>>> => {
    const state = stateRef.current
    const settings = settingsRef.current

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state?.real?.current.cooldown))
      return new Err(state!)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state?.real?.current.expiration))
      return new Err(state!)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await core.runOrReplace(cacheKey, aborter, () => Simple.fetchOrThrow(cacheKey, signal, settings)))
  }, [cacheKey])

  const updateOrThrow = useCallback(async (updater: Updater<K, D, F>, init?: RequestInit): Promise<Fallback<State<D, F>>> => {
    const state = stateRef.current
    const settings = settingsRef.current

    if (shouldUseCacheIfFresh(init?.cache) && Time.isAfterNow(state?.real?.current.cooldown))
      return new Err(state!)
    if (shouldUseCacheIfStale(init?.cache) && Time.isAfterNow(state?.real?.current.expiration))
      return new Err(state!)

    const aborter = new AbortController()
    const signal = AbortSignal.any([aborter.signal, AbortSignals.getOrNever(init?.signal)])

    return new Ok(await Simple.updateOrThrow(cacheKey, updater, signal, settings))
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
    mutateOrThrow,
    fetchOrThrow,
    refetchOrThrow,
    updateOrThrow,
    deleteOrThrow,
  }
}