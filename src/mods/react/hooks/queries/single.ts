import { Option, Optional } from "@hazae41/option";
import { Err, Ok, Result } from "@hazae41/result";
import { useRenderRef } from "libs/react/ref.js";
import { Time } from "libs/time/time.js";
import { CooldownError, MissingFetcherError, MissingKeyError } from "mods/core/core.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { FetchError } from "mods/types/fetcher.js";
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
  const { key, settings } = useMemo(() => {
    return factory(...deps)
  }, deps) ?? {}

  return useAnonymousQuery<K, D, F>(key, settings)
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
  update(updater: Updater<K, D, F>, aborter?: AbortController): Promise<Result<Result<State<D, F>, FetchError>, MissingFetcherError | MissingKeyError>>
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
  settings: QuerySettings<K, D, F> = {},
): SingleQuery<K, D, F> {
  const core = useCore().unwrap()

  const keyRef = useRenderRef(key)
  const settingsRef = useRenderRef({ ...core.settings, ...settings })

  const cacheKey = useMemo(() => {
    return Option.mapSync(key, (key) => Simple.getCacheKey(key, settingsRef.current))
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

    const key = keyRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    if (Time.isAfterNow(stateRef.current?.real?.current.cooldown))
      return new Err(new CooldownError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, key, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrReplace(cacheKey, aborter, async () =>
      await Simple.fetch(core, key, cacheKey, aborter, settings))

    return new Ok(result)
  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<K, D, F>, aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await Simple.update(core, key, cacheKey, updater, aborter, settings)

    return new Ok(result)
  }, [core, cacheKey])

  const suspend = useCallback(async (aborter = new AbortController()) => {
    if (cacheKey === undefined)
      return new Err(new MissingKeyError())

    const key = keyRef.current
    const settings = settingsRef.current

    if (key === undefined)
      return new Err(new MissingKeyError())
    if (settings.fetcher === undefined)
      return new Err(new MissingFetcherError())

    const result = await core.fetchOrJoin(cacheKey, aborter, async () =>
      await Simple.fetch(core, key, cacheKey, aborter, settings))

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
    ...settings
  } satisfies SingleQuery<K, D, F>
}