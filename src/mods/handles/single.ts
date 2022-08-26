import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps/core.js"
import { useOrtho } from "../../libs/ortho.js"
import { Poster, Updater } from "../core.js"
import { State } from "../storage.js"
import { Handle } from "./generic.js"

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any, K = any> extends Handle<D, E, K> {
  update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E> | undefined>
}

/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
export function useSingle<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, K>,
  cooldown?: number,
  timeout?: number
): SingleHandle<D, E, K> {
  const core = useCore()

  const skey = useMemo(() => {
    if (key === undefined) return
    return JSON.stringify(key)
  }, [key])

  const [state, setState] = useState(
    () => core.get(skey))
  useEffect(() => {
    setState(core.get(skey))
  }, [core, skey])

  useOrtho(core, skey, setState)

  const mutate = useCallback((res: State<D, E>) => {
    return core.mutate<D, E>(skey, res)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, cooldown, timeout, aborter)
  }, [core, skey, poster, cooldown])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, 0, timeout, aborter)
  }, [core, skey, poster])

  const update = useCallback((updater: Updater<D>, aborter?: AbortController) => {
    return core.single.update<D, E, K>(key, skey, poster, updater, timeout, aborter)
  }, [core, skey, poster])

  const clear = useCallback(() => {
    core.delete(skey)
  }, [core, skey])

  const { data, error, time, aborter, expiration } = state ?? {}

  const loading = Boolean(aborter)

  return { key, skey, data, error, time, aborter, loading, expiration, mutate, fetch, refetch, update, clear }
}