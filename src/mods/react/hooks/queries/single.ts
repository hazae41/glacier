import { Times } from "index.js";
import { useRenderRef } from "libs/react/ref.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { Simple } from "mods/single/helper.js";
import { SimpleQuerySchema } from "mods/single/schema.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { QueryParams } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater } from "mods/types/updater.js";
import { DependencyList, useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useSchema<D, K, L extends DependencyList = []>(
  factory: (...deps: L) => SimpleQuerySchema<D, K> | undefined,
  deps: L
) {
  const schema = useMemo(() => {
    return factory(...deps)
  }, deps)

  const { key, fetcher, params } = schema ?? {}
  return useQuery<D, K>(key, fetcher, params)
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
  update(updater: Updater<D>, uparams?: Times, aborter?: AbortController): Promise<State<D>>
}

/**
 * Single resource query factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single query
 */
export function useQuery<D = unknown, K = string>(
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
    if (typeof window === "undefined")
      throw new Error("Can't mutate on SSR")

    const params = paramsRef.current

    return await core.mutate(cacheKey, mutator, params)
  }, [core, cacheKey])

  const clear = useCallback(async () => {
    if (typeof window === "undefined")
      throw new Error("Can't clear on SSR")

    await core.delete(cacheKey, paramsRef.current)
  }, [core, cacheKey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't fetch on SSR")

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await Simple.fetch(core, key, cacheKey, fetcher, aborter, params)
  }, [core, cacheKey])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't refetch on SSR")

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await Simple.fetch(core, key, cacheKey, fetcher, aborter, params, true, true)
  }, [core, cacheKey])

  const update = useCallback(async (updater: Updater<D>, uparams: UpdaterParams = {}, aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Can't update on SSR")

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    const fparams = { ...params, ...uparams }

    return await Simple.update(core, key, cacheKey, fetcher, updater, aborter, fparams)
  }, [core, cacheKey])

  const suspend = useCallback(() => {
    if (typeof window === "undefined")
      throw new Error("Can't suspend on SSR")

    return (async () => {
      const key = keyRef.current
      const fetcher = fetcherRef.current
      const params = paramsRef.current

      const background = new Promise<void>(ok => core.once(cacheKey, () => ok(), params))
      await Simple.fetch(core, key, cacheKey, fetcher, undefined, params, false, true)
      await background
    })()
  }, [core, cacheKey])

  const state = stateRef.current

  const { data, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null

  return {
    key,
    cacheKey,
    data,
    error,
    time,
    cooldown,
    expiration,
    realData,
    ready,
    mutate,
    fetch,
    refetch,
    update,
    clear,
    suspend,
    aborter,
    optimistic,
    get loading() { return Boolean(this.aborter) },
  }
}