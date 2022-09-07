import { useCore, useParams } from "mods/react/contexts";
import { getSingleStorageKey } from "mods/single/object";
import { Mutator } from "mods/types/mutator";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Handle } from "./handle";

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any, N = D, K = any> extends Handle<D, E, N, K> {
  /**
   * Optimistic update
   * @param updater Mutation function
   * @param aborter Custom AbortController
   */
  update(updater: Updater<D, E, N, K>, aborter?: AbortController): Promise<State<D, E, N, K> | undefined>
}

/**
 * Single resource handle factory
 * @param key Key (memoized)
 * @param poster Resource poster or fetcher (memoized)
 * @param params Parameters (static)
 * @returns Single handle
 */
export function useSingle<D = any, E = any, N = D, K = any>(
  key: K | undefined,
  poster: Poster<D, E, N, K>,
  params: Params<D, E, N, K> = {},
): SingleHandle<D, E, N, K> {
  const core = useCore()
  const pparams = useParams()

  const mparams = { ...pparams, ...params }

  const skey = useMemo(() => {
    return getSingleStorageKey(key, mparams)
  }, [key])

  const [state, setState] = useState(
    () => core.getSync<D, E, N, K>(skey, mparams))
  const first = useRef(true)

  useEffect(() => {
    if (state === null || !first.current)
      core.get<D, E, N, K>(skey, mparams).then(setState)
    first.current = false
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, mparams)
    return () => void core.unsubscribe(skey, setState, mparams)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D, E, N, K>) => {
    if (state !== null) return await core.mutate(skey, state, mutator, mparams)
  }, [core, skey, state])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (state !== null) return await core.single.fetch(key, skey, state, poster, aborter, mparams)
  }, [core, skey, state, poster])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (state !== null) return await core.single.fetch(key, skey, state, poster, aborter, mparams, true)
  }, [core, skey, state, poster])

  const update = useCallback(async (updater: Updater<D, E, N, K>, aborter?: AbortController) => {
    if (state !== null) return await core.single.update(key, skey, state, poster, updater, aborter, mparams)
  }, [core, skey, state, poster])

  const clear = useCallback(async () => {
    if (state !== null) await core.delete(skey, mparams)
  }, [core, skey, state])

  const { data, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, loading, ready, mutate, fetch, refetch, update, clear }
}