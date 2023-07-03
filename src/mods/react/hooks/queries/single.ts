import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { FetchError } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { FetcherfulQuerySettings, FetcherlessQuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SchemaFactory<K, D, F, DL extends DependencyList> =
  (...deps: DL) => Optional<SimpleQuerySchema<K, D, F>>

export function useQuery<K, D, F, DL extends DependencyList>(
  factory: SchemaFactory<K, D, F, DL>,
  deps: DL
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  if (schema === undefined)
    return useSkeletonQuery()

  if (schema.settings.fetcher === undefined)
    return useFetcherlessQuery(schema.settings)

  return useFetcherfulQuery<K, D, F>(schema.settings)
}

/**
 * Query for a single resource
 */
export interface SingleQuery<K, D, F> extends Query<K, D, F> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<State<D, F>, FetchError>, MissingFetcherError>>
}

export function useSkeletonQuery() {
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

  return undefined
}

/**
 * Single query
 * @param key 
 * @param fetcher 
 * @param settings 
 * @returns 
 */
export function useFetcherlessQuery<K, D, F>(
  settings: FetcherlessQuerySettings<K, D, F>,
): SingleQuery<K, D, F> {
  const core = useCore().unwrap()

  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key, settingsRef.current)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D, F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [core, cacheKey])

  const setState = useCallback((state: State<D, F>) => {
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
  }, [core, cacheKey])

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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    return await core.mutate(cacheKey, mutator, settingsRef.current)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    return await core.delete(cacheKey, settingsRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingFetcherError())
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingFetcherError())

  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    return new Err(new MissingFetcherError())
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    return new Err(new MissingFetcherError())
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

  return {
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
    suspend,
    ...settings
  } satisfies SingleQuery<K, D, F>
}

export function useFetcherfulQuery<K, D, F>(
  settings: FetcherfulQuerySettings<K, D, F>,
): SingleQuery<K, D, F> {
  const core = useCore().unwrap()

  const settingsRef = useRenderRef(settings)

  const cacheKey = useMemo(() => {
    return Simple.getCacheKey(settings.key, settingsRef.current)
  }, [settings.key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D, F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    stateRef.current = core.getStateSync(cacheKey)
    aborterRef.current = core.getAborterSync(cacheKey)
  }, [core, cacheKey])

  const setState = useCallback((state: State<D, F>) => {
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
  }, [core, cacheKey])

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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    return await core.mutate(cacheKey, mutator, settingsRef.current)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    return await core.delete(cacheKey, settingsRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await Simple.update(core, cacheKey, updater, aborter, settings)

    return new Ok(result)
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    const settings = settingsRef.current

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, cacheKey, aborter, settings))

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

  return {
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
    suspend,
    ...settings
  } satisfies SingleQuery<K, D, F>
}