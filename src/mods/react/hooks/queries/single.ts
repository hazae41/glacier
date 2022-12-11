import { useAutoRef } from "libs/react.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { getSingleStorageKey } from "mods/single/instance.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { State } from "mods/types/state.js";
import { Updater, UpdaterParams } from "mods/types/updater.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Query for a single resource
 */
export interface SingleQuery<D = any, E = any, K = any> extends Query<D, E, K> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<D, E, K>, uparams?: UpdaterParams<D, E, K>, aborter?: AbortController): Promise<State<D, E, K> | undefined>
}

/**
 * Single resource query factory
 * @param key Key (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single query
 */
export function useSingleQuery<D = any, E = any, K = any>(
  key: K | undefined,
  fetcher: Fetcher<D, E, K> | undefined,
  params: Params<D, E, K> = {},
): SingleQuery<D, E, K> {
  const core = useCore()

  const mparams = { ...core.params, ...params }

  const keyRef = useAutoRef(key)
  const fetcherRef = useAutoRef(fetcher)
  const mparamsRef = useAutoRef(mparams)

  const skey = useMemo(() => {
    return getSingleStorageKey(key, mparamsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D, E, K> | null>()

  useMemo(() => {
    stateRef.current = core.getSync<D, E, K>(skey, mparamsRef.current)
  }, [core, skey])

  const setState = useCallback((state?: State<D, E, K>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const initRef = useRef<Promise<void>>()

  useEffect(() => {
    if (stateRef.current !== null) return

    initRef.current = core.get<D, E, K>(skey, mparamsRef.current).then(setState)
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.on(skey, setState, mparamsRef.current)
    return () => void core.off(skey, setState, mparamsRef.current)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D, E, K>) => {
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    const state = stateRef.current
    const params = mparamsRef.current

    return await core.mutate(skey, state, mutator, params)
  }, [core, skey])

  const clear = useCallback(async () => {
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    await core.delete(skey, mparamsRef.current)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Fetch on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (fetcherRef.current === undefined)
      return stateRef.current

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = mparamsRef.current

    return await core.single.fetch(key, skey, fetcher, aborter, params)
  }, [core, skey])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Refetch on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (fetcherRef.current === undefined)
      return stateRef.current

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = mparamsRef.current

    return await core.single.fetch(key, skey, fetcher, aborter, params, true, true)
  }, [core, skey])

  const update = useCallback(async (updater: Updater<D, E, K>, uparams: UpdaterParams<D, E, K> = {}, aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Update on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    const key = keyRef.current
    const fetcher = fetcherRef.current
    const params = mparamsRef.current

    const fparams = { ...params, ...uparams }

    return await core.single.update(key, skey, fetcher, updater, aborter, fparams)
  }, [core, skey])

  const suspend = useCallback(() => {
    if (typeof window === "undefined")
      throw new Error("Suspend on SSR")
    return (async () => {
      if (stateRef.current === null)
        await initRef.current
      if (stateRef.current === null)
        throw new Error("Null state after init")
      if (fetcherRef.current === undefined)
        throw new Error("No fetcher")

      const key = keyRef.current
      const fetcher = fetcherRef.current
      const params = mparamsRef.current

      const background = new Promise<void>(ok => core.once(skey, () => ok(), params))
      await core.single.fetch(key, skey, fetcher, undefined, params, false, true)
      await background
    })()
  }, [core, skey])

  const state = stateRef.current

  const { data, error, time, cooldown, expiration, aborter, optimistic, realData } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, realData, loading, ready, mutate, fetch, refetch, update, clear, suspend }
}