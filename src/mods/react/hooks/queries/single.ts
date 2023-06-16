import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { useAsyncMemo } from "libs/react/memo.js";
import { useRenderRef } from "libs/react/ref.js";
import { MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QuerySettings } from "mods/types/settings.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SchemaFactory<K, D, F, DL extends DependencyList> =
  (...deps: DL) => Optional<SimpleQuerySchema<K, D, F>>

export function useQuery<K, D, F, DL extends DependencyList>(
  factory: SchemaFactory<K, D, F, DL>,
  deps: DL
) {
  const { key, fetcher, settings } = useMemo(() => {
    return factory(...deps)
  }, deps) ?? {}

  return useAnonymousQuery<K, D, F>(key, fetcher, settings)
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
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<State<D, F>, Error>>
}

/**
 * Single query
 * @param key 
 * @param fetcher 
 * @param settings 
 * @returns 
 */
export function useAnonymousQuery<K, D, F>(
  key: Optional<K>,
  fetcher: Optional<Fetcher<K, D, F>>,
  settings: QuerySettings<K, D, F> = {},
): SingleQuery<K, D, F> {
  const core = useCore().unwrap()

  const keyRef = useRenderRef(key)
  const fetcherRef = useRenderRef(fetcher)
  const settingsRef = useRenderRef({ ...core.settings, ...settings })

  const [cacheKey, cacheKeyPromise] = useAsyncMemo(async () => {
    return await Option.map(key, () => Simple.getCacheKey(key, settingsRef.current))
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D, F>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    if (cacheKey === undefined)
      return

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

  const mutate = useCallback(async (mutator: Mutator<D, F>) => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.mutate(cacheKey, mutator, settingsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKeyPromise])

  const clear = useCallback(async () => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    stateRef.current = await core.delete(cacheKey, settingsRef.current)

    return new Ok(stateRef.current)
  }, [core, cacheKeyPromise])

  const fetch = useCallback(async (aborter = new AbortController()) => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrError(core, key, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKeyPromise])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.lockOrReplace(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, settings)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKeyPromise])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await Simple
      .update(core, key, cacheKey, fetcher, updater, aborter, settings)
      .then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKeyPromise])

  const suspend = useCallback(async (aborter = new AbortController()): Promise<void> => {
    const cacheKey = await cacheKeyPromise

    if (cacheKey === undefined)
      throw new MissingKeyError()

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const settings = settingsRef.current

    if (key === undefined)
      throw new MissingKeyError()
    if (fetcher === undefined)
      throw new MissingFetcherError()

    stateRef.current = await core.lockOrReplace(cacheKey, aborter, async () => {
      return await Simple.fetchOrWait(core, key, cacheKey, fetcher, aborter, settings)
    }).then(r => r.unwrap())
  }, [core, cacheKeyPromise])

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
    key,
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
  }
}