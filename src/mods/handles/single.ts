import { useCallback, useEffect, useState } from "react"
import { useCore } from "../../comps"
import { useOrtho } from "../../libs/ortho"
import { Poster, Updater } from "../core"
import { State } from "../storage"
import { Handle } from "./generic"

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any> extends Handle<D, E> {
  update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E> | undefined>
}

/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
export function useSingle<D = any, E = any>(
  key: string | undefined,
  poster: Poster<D>,
  cooldown?: number
): SingleHandle<D, E> {
  const core = useCore()

  const [state, setState] = useState(
    () => core.get(key))
  useEffect(() => {
    setState(core.get(key))
  }, [core, key])

  useOrtho(core, key, setState)

  const mutate = useCallback((res: State<D, E>) => {
    return core.mutate<D, E>(key, res)
  }, [core, key])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E>(key, poster, cooldown, aborter)
  }, [core, key, poster, cooldown])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E>(key, poster, 0, aborter)
  }, [core, key, poster])

  const update = useCallback((updater: Updater<D>, aborter?: AbortController) => {
    return core.single.update<D, E>(key, poster, updater, aborter)
  }, [core, key, poster])

  const clear = useCallback(() => {
    core.delete(key)
  }, [core, key])

  const { data, error, time, aborter } = state ?? {}

  const loading = Boolean(aborter)

  return { key, data, error, time, aborter, loading, mutate, fetch, refetch, update, clear }
}