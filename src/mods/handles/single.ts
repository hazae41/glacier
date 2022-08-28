import { useCallback, useEffect, useMemo, useState } from "react"
import { useCore } from "../../comps/core.js"
import { useOrtho } from "../../libs/ortho.js"
import { Poster, Updater } from "../core.js"
import { State } from "../storages/storage.js"
import { TimeParams } from "../time.js"
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
  tparams: TimeParams = {}
): SingleHandle<D, E, K> {
  const core = useCore()

  const skey = useMemo(() => {
    if (key === undefined) return
    return JSON.stringify(key)
  }, [key])

  const [ready, setReady] = useState(() => core.hasSync(skey))
  const [state, setState] = useState(() => core.getSync<D, E>(skey))

  useEffect(() => {
    core.get(skey)
      .then(setState)
      .finally(() => setReady(true))
  }, [core, skey])

  useOrtho(core, skey, setState)

  const mutate = useCallback(async (res: State<D, E>) => {
    return await core.mutate<D, E>(skey, res)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, tparams)
  }, [core, skey, poster])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, tparams, true)
  }, [core, skey, poster])

  const update = useCallback(async (updater: Updater<D>, aborter?: AbortController) => {
    return await core.single.update<D, E, K>(key, skey, poster, updater, aborter, tparams)
  }, [core, skey, poster])

  const clear = useCallback(async () => {
    await core.delete(skey)
  }, [core, skey])

  const loading = Boolean(state?.aborter)

  return { key, skey, ...state, loading, ready, mutate, fetch, refetch, update, clear }
}