import { useCore, useParams } from "mods/react/contexts";
import { Fetcher } from "mods/types/fetcher";
import { Params } from "mods/types/params";
import { Scroller } from "mods/types/scroller";
import { State } from "mods/types/state";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Handle } from "./handle";

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<State<D[], E> | undefined>
}

export function getScrollStorageKey<T = any>(key: T, params: Params) {
  if (key === undefined)
    return undefined
  if (typeof key === "string")
    return key

  const {
    serializer = DEFAULT_SERIALIZER
  } = params

  return `scroll:${serializer.stringify(key)}`
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (memoized)
 * @param params Parameters (static)
 * @returns Scrolling handle
 */
export function useScroll<D = any, E = any, K = any>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K>,
  params: Params<D[], E> = {},
): ScrollHandle<D, E, K> {
  const core = useCore()
  const pparams = useParams()

  const mparams = { ...pparams, ...params }

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    return getScrollStorageKey(key, mparams)
  }, [key])

  const [ready, setReady] = useState(() => core.hasSync<D[], E>(skey, mparams))
  const [state, setState] = useState(() => core.getSync<D[], E>(skey, mparams))

  useEffect(() => {
    core.get<D[], E>(skey, mparams)
      .then(setState)
      .finally(() => setReady(true))
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, mparams)
    return () => void core.unsubscribe(skey, setState, mparams)
  }, [core, skey])

  const mutate = useCallback(async (state?: State<D[], E>) => {
    return await core.mutate<D[], E>(skey, state, mparams)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, mparams)
  }, [core, skey, fetcher])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, mparams, true)
  }, [core, skey, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.scroll<D, E, K>(skey, scroller, fetcher, aborter, mparams, true)
  }, [core, skey, fetcher])

  const clear = useCallback(async () => {
    await core.delete(skey, mparams)
  }, [core, skey])

  const { data, error, time, cooldown, expiration, aborter } = state ?? {}

  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, loading, ready, mutate, fetch, refetch, scroll, clear }
}