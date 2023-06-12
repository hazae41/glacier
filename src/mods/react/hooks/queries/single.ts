import { Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { useRenderRef } from "libs/react/ref.js";
import { MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { TimesInit } from "mods/result/times.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SchemaFactory<D, K, L extends DependencyList = []> =
  (...deps: L) => Optional<SimpleQuerySchema<D, K>>

export function useQuery<D, K, L extends DependencyList = []>(
  factory: SchemaFactory<D, K, L>,
  deps: L
) {
  const { key, fetcher, params } = useMemo(() => {
    return factory(...deps)
  }, deps) ?? {}

  return useAnonymousQuery<D, K>(key, fetcher, params)
}

/**
 * Query for a single resource
 */
export interface SingleQuery<D = unknown, K = unknown> extends Query<D, K> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<D, K>, uparams?: TimesInit, aborter?: AbortController): Promise<Result<State<D>, Error>>
}

/**
 * Single resource query factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single query
 */
export function useAnonymousQuery<D = unknown, K = string>(
  key: K | undefined,
  fetcher: Fetcher<D, K> | undefined,
  params: QueryParams<D, K> = {},
): SingleQuery<D, K> {
  const core = useCore()

  const keyRef = useRenderRef(key)
  const fetcherRef = useRenderRef(fetcher)
  const paramsRef = useRenderRef({ ...core.params, ...params })

  const cacheKey = useMemo(() => {
    if (key === undefined)
      return undefined
    return Simple.getCacheKey<D, K>(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D>>()
  const aborterRef = useRef<AbortController>()

  useMemo(() => {
    if (cacheKey === undefined)
      return
    stateRef.current = core.getSync<D, K>(cacheKey, paramsRef.current).ok().inner
  }, [core, cacheKey])

  const setState = useCallback((state: State) => {
    stateRef.current = state as State<D>
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

    core.get<D, K>(cacheKey, paramsRef.current).then(setState)
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

  const mutate = useCallback(async (mutator: Mutator<D>) => {
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

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.fetchOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrError(core, key, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.abortAndFetch(cacheKey, aborter, async () => {
      return await Simple.fetch(core, key, cacheKey, fetcher, aborter, params)
    }).then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<D, K>, uparams: TimesInit = {}, aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    const fparams = { ...params, ...uparams }

    return await Simple
      .update(core, key, cacheKey, fetcher, updater, aborter, fparams)
      .then(r => r.inspectSync(state => stateRef.current = state))
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (fetcher === undefined)
      return new Err(new MissingFetcherError())

    return await core.fetchOrError(cacheKey, aborter, async () => {
      return await Simple.fetchOrWait(core, key, cacheKey, fetcher, aborter, params)
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