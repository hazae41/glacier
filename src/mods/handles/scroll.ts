import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps"
import { useOrtho } from "../../libs/ortho"
import { Fetcher, Scroller } from "../core"
import { State } from "../storage"
import { Handle } from "./generic"

/**
 * Handle for a scrolling resource
 */
export interface ScrollHandle<D = any, E = any> extends Handle<D[], E> {
  scroll(): Promise<State<D[], E> | undefined>
}

/**
 * Scrolling resource hook
 * @param scroller Memoized scroller
 * @param fetcher Memoized fetcher
 * @param cooldown Usually your resource TTL
 * @returns A scrolling resource handle
 */
export function useScroll<D = any, E = any>(
  scroller: Scroller<D>,
  fetcher: Fetcher<D>,
  cooldown?: number,
  timeout?: number
): ScrollHandle<D, E> {
  const core = useCore()

  const key = useMemo(() => {
    return "scroll:" + scroller()
  }, [scroller])

  const [state, setState] = useState(
    () => core.get<D[], E>(key))
  useEffect(() => {
    setState(core.get<D[], E>(key))
  }, [core, key])

  useOrtho(core, key, setState)

  const mutate = useCallback((res: State<D[], E>) => {
    return core.mutate<D[], E>(key, res)
  }, [core, key])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E>(key, scroller, fetcher, cooldown, timeout, aborter)
  }, [core, key, scroller, fetcher, cooldown])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.first<D, E>(key, scroller, fetcher, 0, timeout, aborter)
  }, [core, key, scroller, fetcher])

  const scroll = useCallback(async (aborter?: AbortController) => {
    return await core.scroll.scroll<D, E>(key, scroller, fetcher, 0, timeout, aborter)
  }, [core, key, scroller, fetcher])

  const clear = useCallback(() => {
    core.delete(key)
  }, [core, key])

  const { data, error, time, aborter, expiration } = state ?? {}

  const loading = Boolean(aborter)

  return { key, data, error, time, aborter, loading, expiration, mutate, fetch, refetch, scroll, clear }
}