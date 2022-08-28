import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps/core.js"
import { Params, Poster, Updater } from "../core.js"
import { State } from "../storages/storage.js"
import { Handle } from "./handle.js"

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any, K = any> extends Handle<D, E, K> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<D>, aborter?: AbortController): Promise<State<D, E> | undefined>
}

/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param poster Resource poster or fetcher (memoized)
 * @param tparams Time parameters (constant)
 * @returns Single handle
 */
export function useSingle<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, K>,
  params: Params<D, E> = {},
): SingleHandle<D, E, K> {
  const core = useCore()

  const skey = useMemo(() => {
    if (key === undefined) return

    const { serializer = core.serializer } = params
    return serializer.stringify(key)
  }, [core, key])

  const [ready, setReady] = useState(() => core.hasSync<D, E>(skey, params))
  const [state, setState] = useState(() => core.getSync<D, E>(skey, params))

  useEffect(() => {
    core.get(skey, params)
      .then(setState)
      .finally(() => setReady(true))
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, params)
    return () => void core.unsubscribe(skey, setState, params)
  }, [core, skey])

  const mutate = useCallback(async (res: State<D, E>) => {
    return await core.mutate<D, E>(skey, res, params)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, params)
  }, [core, skey, poster])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, params, true)
  }, [core, skey, poster])

  const update = useCallback(async (updater: Updater<D>, aborter?: AbortController) => {
    return await core.single.update<D, E, K>(key, skey, poster, updater, aborter, params)
  }, [core, skey, poster])

  const clear = useCallback(async () => {
    await core.delete(skey, params)
  }, [core, skey])

  const { data, error, time, cooldown, expiration, aborter } = state ?? {}

  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, loading, ready, mutate, fetch, refetch, update, clear }
}