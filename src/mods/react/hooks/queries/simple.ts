import { None, Nullable } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { SimpleQuery } from "index.js";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, MissingKeyError, core } from "mods/core/core.js";
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
): SimpleQuery.Reactify<T> {
  const query = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (query == null)
    return useSimpleSkeletonQuery() as SimpleQuery.Reactify<T>

  if (query.settings.fetcher == null)
    return useSimpleFetcherlessQuery(query.settings) as SimpleQuery.Reactify<T>

  return useSimpleFetcherfulQuery(query.settings) as SimpleQuery.Reactify<T>
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
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<never, MissingKeyError>>
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
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<Result<State<D, F>, Error>, never>, never>>
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
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<never, MissingFetcherError>, never>>
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
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

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingKeyError())
  }, [cacheKey])

  return { mutate, clear, fetch, refetch, update, suspend }
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
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

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
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
      await Simple.tryFetch(cacheKey, aborter, settings))

    return new Ok(new Ok(new Ok(result)))
  }, [cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.tryFetch(cacheKey, aborter, settings))

    return new Ok(new Ok(result))
  }, [cacheKey])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await Simple.tryUpdate(cacheKey, updater, aborter, settings)

    return new Ok(new Ok(result))
  }, [cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.tryFetch(cacheKey, aborter, settings))

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