import { useCore } from "comps/core"
import { useOrtho } from "libs/ortho"
import { Fetcher } from "mods/core"
import { Handle } from "mods/handles"
import { State } from "mods/storage"
import { useCallback, useEffect, useMemo, useState } from "react"

export type Scroller<D = any> =
  (previous?: D) => string | undefined

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
  cooldown = 1000
): ScrollHandle<D, E> {
  const core = useCore()

  const key = useMemo(() => {
    return "scroll:" + scroller()
  }, [scroller])

  const [state, setState] = useState(
    () => core.get<D[], E>(key))
  useEffect(() => {
    setState(core.get<D[], E>(key))
  }, [key])

  useOrtho(core, key, setState)

  const mutate = useCallback((res: State<D[], E>) => {
    return core.mutate<D[], E>(key, res)
  }, [core, key])

  const fetch = useCallback(async () => {
    return await core.first<D, E>(key, scroller, fetcher, cooldown)
  }, [core, key, scroller, fetcher, cooldown])

  const refetch = useCallback(async () => {
    return await core.first<D, E>(key, scroller, fetcher)
  }, [core, key, scroller, fetcher])

  const scroll = useCallback(async () => {
    return await core.scroll<D, E>(key, scroller, fetcher)
  }, [core, key, scroller, fetcher])

  const clear = useCallback(() => {
    core.delete(key)
  }, [core, key])

  const { data, error, time, loading = false } = state ?? {}

  return { key, data, error, time, loading, mutate, fetch, refetch, scroll, clear }
}