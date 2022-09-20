import { useAutoRef } from "libs/react";
import { useCore, useParams } from "mods/react/contexts";
import { getScrollStorageKey } from "mods/scroll/object";
import { Fetcher } from "mods/types/fetcher";
import { Mutator } from "mods/types/mutator";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Handle } from "./handle";

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D extends N = any, E = any, N = D, K = any> extends Handle<D[], E, N[], K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<State<D[], E, N[], K> | undefined>
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Scrolling handle
 */
export function useScroll<D extends N = any, E = any, N = D, K = any>(
  scroller: Scroller<D, E, N, K>,
  fetcher: Fetcher<D, E, N, K> | undefined,
  cparams: Params<D[], E, N[], K> = {},
): ScrollHandle<D, E, N, K> {
  const core = useCore()
  const pparams = useParams()

  const params = { ...pparams, ...cparams }

  const scrollerRef = useAutoRef(scroller)
  const fetcherRef = useAutoRef(fetcher)
  const paramsRef = useAutoRef(params)

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    return getScrollStorageKey(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D[], E, N[], K> | null>()

  useMemo(() => {
    stateRef.current = core.getSync<D[], E, N[], K>(skey, paramsRef.current)
  }, [core, skey])

  const setState = useCallback((state?: State<D[], E, N[], K>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const initRef = useRef<Promise<void>>()

  useEffect(() => {
    if (stateRef.current !== null) return

    initRef.current = core.get<D[], E, N[], K>(skey, paramsRef.current).then(setState)
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.on(skey, setState, paramsRef.current)
    return () => void core.off(skey, setState, paramsRef.current)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D[], E, N[], K>) => {
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

    const state = stateRef.current
    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.first(skey, state, scroller, fetcher, aborter, params)
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

    const state = stateRef.current
    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.first(skey, state, scroller, fetcher, aborter, params, true, true)
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

    const state = stateRef.current
    const scroller = scrollerRef.current
    const fetcher = fetcherRef.current
    const params = paramsRef.current

    return await core.scroll.scroll(skey, state, scroller, fetcher, aborter, params, true, true)
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

      const state = stateRef.current
      const scroller = scrollerRef.current
      const fetcher = fetcherRef.current
      const params = paramsRef.current

      const background = new Promise<void>(ok => core.once(skey, () => ok(), params))
      await core.scroll.first(skey, state, scroller, fetcher, undefined, params, false, true)
      await background
    })()
  }, [core, skey])

  const state = stateRef.current

  const { data, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, loading, ready, mutate, fetch, refetch, scroll, clear, suspend }
}