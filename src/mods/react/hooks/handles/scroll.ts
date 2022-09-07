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
export interface ScrollHandle<D = any, E = any, N = D, K = any> extends Handle<D[], E, N[], K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<State<D[], E, N[], K> | undefined>
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (memoized)
 * @param params Parameters (static)
 * @returns Scrolling handle
 */
export function useScroll<D = any, E = any, N = D, K = any>(
  scroller: Scroller<D, E, N, K>,
  fetcher: Fetcher<D, E, N, K>,
  params: Params<D[], E, N[], K> = {},
): ScrollHandle<D, E, N, K> {
  const core = useCore()
  const pparams = useParams()

  const mparams = { ...pparams, ...params }

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    return getScrollStorageKey(key, mparams)
  }, [key])

  const [state, setState] = useState(
    () => core.getSync<D[], E, N[], K>(skey, mparams))
  const first = useRef(true)

  useEffect(() => {
    if (state === null || !first.current)
      core.get<D[], E, N[], K>(skey, mparams).then(setState)
    first.current = false
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, mparams)
    return () => void core.unsubscribe(skey, setState, mparams)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D[], E, N[], K>) => {
    if (state !== null) return await core.mutate(skey, state, mutator, mparams)
  }, [core, skey, state])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (state !== null) return await core.scroll.first(skey, state, scroller, fetcher, aborter, mparams)
  }, [core, skey, state, scroller, fetcher])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (state !== null) return await core.scroll.first(skey, state, scroller, fetcher, aborter, mparams, true)
  }, [core, skey, state, scroller, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    if (state !== null) return await core.scroll.scroll(skey, state, scroller, fetcher, aborter, mparams, true)
  }, [core, skey, state, scroller, fetcher])

  const clear = useCallback(async () => {
    if (state !== null) await core.delete(skey, mparams)
  }, [core, skey, state])

  const { data, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, loading, ready, mutate, fetch, refetch, scroll, clear }
}