import { useCore, useParams } from "mods/react/contexts";
import { Params } from "mods/types/params";
import { Poster } from "mods/types/poster";
import { State } from "mods/types/state";
import { Updater } from "mods/types/updater";
import { DEFAULT_SERIALIZER } from "mods/utils/defaults";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Handle } from "./handle";

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
 * @param params Parameters (static)
 * @returns Single handle
 */
export function useSingle<D = any, E = any, K = any>(
  key: K | undefined,
  poster: Poster<D, K>,
  params: Params<D, E> = {},
): SingleHandle<D, E, K> {
  const core = useCore()
  const pparams = useParams()

  const mparams = { ...pparams, ...params }

  const skey = useMemo(() => {
    if (key === undefined)
      return
    if (typeof key === "string")
      return key

    const {
      serializer = DEFAULT_SERIALIZER
    } = mparams

    return serializer.stringify(key)
  }, [core, key])

  const [ready, setReady] = useState(() => core.hasSync<D, E>(skey, mparams))
  const [state, setState] = useState(() => core.getSync<D, E>(skey, mparams))

  useEffect(() => {
    core.get(skey, mparams)
      .then(setState)
      .finally(() => setReady(true))
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.subscribe(skey, setState, mparams)
    return () => void core.unsubscribe(skey, setState, mparams)
  }, [core, skey])

  const mutate = useCallback(async (state?: State<D, E>) => {
    return await core.mutate<D, E>(skey, state, mparams)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, mparams)
  }, [core, skey, poster])

  const refetch = useCallback(async (aborter?: AbortController) => {
    return await core.single.fetch<D, E, K>(key, skey, poster, aborter, mparams, true)
  }, [core, skey, poster])

  const update = useCallback(async (updater: Updater<D>, aborter?: AbortController) => {
    return await core.single.update<D, E, K>(key, skey, poster, updater, aborter, mparams)
  }, [core, skey, poster])

  const clear = useCallback(async () => {
    await core.delete(skey, mparams)
  }, [core, skey])

  const { data, error, time, cooldown, expiration, aborter } = state ?? {}

  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, loading, ready, mutate, fetch, refetch, update, clear }
}