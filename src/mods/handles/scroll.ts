import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps/index.js"
import { useOrtho } from "../../libs/ortho.js"
import { Fetcher, Scroller } from "../core.js"
import { State } from "../storage.js"
import { TimeParams } from "../time.js"
import { Handle } from "./generic.js"

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
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
  tparams: TimeParams = {},
): ScrollHandle<D, E, K> {
  const core = useCore()

  const key = useMemo(() => {
    return scroller()
  }, [scroller])

  const skey = useMemo(() => {
    if (key === undefined) return
    return "scroll:" + JSON.stringify(key)
  }, [key])

  const [state, setState] = useState(
    () => core.get<D[], E>(skey))
  useEffect(() => {
    setState(core.get<D[], E>(skey))
  }, [core, skey])

  useOrtho(core, skey, setState)

  const mutate = useCallback((res: State<D[], E>) => {
    return core.mutate<D[], E>(skey, res)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, tparams)
  }, [core, skey, scroller, fetcher])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, aborter, tparams, true)
  }, [core, skey, scroller, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.scroll<D, E, K>(skey, scroller, fetcher, aborter, tparams, true)
  }, [core, skey, scroller, fetcher])

  const clear = useCallback(() => {
    core.delete(skey)
  }, [core, skey])

  const loading = Boolean(state?.aborter)

  return { key, skey, ...state, loading, mutate, fetch, refetch, scroll, clear }
}