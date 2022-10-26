import { useAutoRef } from "libs/react.js";
import { useCore } from "mods/react/contexts/core.js";
import { Query } from "mods/react/types/query.js";
import { getScrollStorageKey } from "mods/scroll/instance.js";
import { Fetcher } from "mods/types/fetcher.js";
import { Mutator } from "mods/types/mutator.js";
import { Params } from "mods/types/params.js";
import { Scroller } from "mods/types/scroller.js";
import { State } from "mods/types/state.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Handle for a scrolling resource
 */
export interface ScrollQuery<D = any, E = any, K = any> extends Query<D[], E, K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<State<D[], E, K> | undefined>
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling handle
 */
export function useScrollQuery<D = any, E = any, K = any>(
  scroller: Scroller<D, E, K>,
  fetcher: Fetcher<D, E, K> | undefined,
  params: Params<D[], E, K> = {},
): ScrollQuery<D, E, K> {
  const core = useCore()

  const mparams = { ...core.params, ...params }

  const scrollerRef = useAutoRef(scroller)
  const fetcherRef = useAutoRef(fetcher)
  const paramsRef = useAutoRef(mparams)

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    return getScrollStorageKey(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[], E, K> | null>()

  useMemo(() => {
    stateRef.current = core.getSync<D[], E, K>(skey, paramsRef.current)
  }, [core, skey])

  const setState = useCallback((state?: State<D[], E, K>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const initRef = useRef<Promise<void>>()

  useEffect(() => {
    if (stateRef.current !== null) return

    initRef.current = core.get<D[], E, K>(skey, paramsRef.current).then(setState)
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.on(skey, setState, paramsRef.current)
    return () => void core.off(skey, setState, paramsRef.current)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D[], E, K>) => {
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    const state = stateRef.current
    const params = paramsRef.current

    return await core.mutate(skey, state, mutator, params)
  }, [core, skey])

  const clear = useCallback(async () => {
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    await core.delete(skey, paramsRef.current)
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

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.first(skey, scroller, fetcher, aborter, params)
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

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.first(skey, scroller, fetcher, aborter, params, true, true)
  }, [core, skey])

  const scroll = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Scroll on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (fetcherRef.current === undefined)
      return stateRef.current

    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.scroll(skey, scroller, fetcher, aborter, params, true, true)
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

      const scroller = scrollerRef.current
      const fetcher = fetcherRef.current
      const params = paramsRef.current

      const background = new Promise<void>(ok => core.once(skey, () => ok(), params))
      await core.scroll.first(skey, scroller, fetcher, undefined, params, false, true)
      await background
    })()
  }, [core, skey])

  const state = stateRef.current

  const { data, error, time, cooldown, expiration, aborter, optimistic, realData } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, realData, loading, ready, mutate, fetch, refetch, scroll, clear, suspend }
}