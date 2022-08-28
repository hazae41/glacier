import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps/index.js"
import { Fetcher, Params, Scroller } from "../core.js"
import { State } from "../storages/storage.js"
import { Handle } from "./handle.js"

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
  /**
   * Fetch the next page
   */
  scroll(): Promise<State<D[], E> | undefined>
}

/**
 * Scrolling resource handle factory
 * @param scroller Key scroller (memoized)
 * @param fetcher Resource fetcher (memoized)
 * @param tparams Time parameters (constant)
 * @returns Scrolling handle
 */
export function useScroll<D = any, E = any, K = any>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K>,
  params: Params<D[], E> = {},
): ScrollHandle<D, E, K> {
  const core = useCore()

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    if (key === undefined) return

    const { serializer = core.serializer } = params
    return `scroll:${serializer.stringify(key)}`
  }, [core, key])

  const [ready, setReady] = useState(() => core.hasSync<D[], E>(skey, params))
  const [state, setState] = useState(() => core.getSync<D[], E>(skey, params))

  useEffect(() => {
    core.get<D[], E>(skey, params)
      .then(setState)
      .finally(() => setReady(true))
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, params)
    return () => void core.unsubscribe(skey, setState, params)
  }, [core, skey])

  const mutate = useCallback(async (res: State<D[], E>) => {
    return await core.mutate<D[], E>(skey, res, params)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, params)
  }, [core, skey, scroller, fetcher])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, params, true)
  }, [core, skey, scroller, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.scroll<D, E, K>(skey, scroller, fetcher, aborter, params, true)
  }, [core, skey, scroller, fetcher])

  const clear = useCallback(async () => {
    await core.delete(skey, params)
  }, [core, skey])

  const loading = Boolean(state?.aborter)

  return { key, skey, ...state, loading, ready, mutate, fetch, refetch, scroll, clear }
}