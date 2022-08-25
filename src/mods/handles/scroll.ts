import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps"
import { useOrtho } from "../../libs/ortho"
import { Fetcher, Scroller } from "../core"
import { State } from "../storage"
import { Handle } from "./generic"

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any, K = any> extends Handle<D[], E, K> {
  scroll(): Promise<State<D[], E> | undefined>
}

/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
export function useScroll<D = any, E = any, K = any>(
  scroller: Scroller<D, K>,
  fetcher: Fetcher<D, K>,
  cooldown?: number,
  timeout?: number
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
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, cooldown, timeout, aborter)
  }, [core, skey, scroller, fetcher, cooldown])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E, K>(skey, scroller, fetcher, 0, timeout, aborter)
  }, [core, skey, scroller, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.scroll<D, E, K>(skey, scroller, fetcher, 0, timeout, aborter)
  }, [core, skey, scroller, fetcher])

  const clear = useCallback(() => {
    core.delete(skey)
  }, [core, skey])

  const { data, error, time, aborter, expiration } = state ?? {}

  const loading = Boolean(aborter)

  return { key, skey, data, error, time, aborter, loading, expiration, mutate, fetch, refetch, scroll, clear }
}