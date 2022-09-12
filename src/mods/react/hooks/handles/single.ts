import { useAutoRef } from "libs/react";
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
 * @param poster Resource poster or fetcher (unmemoized)
 * @param cparams Parameters (unmemoized)
 * @returns Single handle
 */
export function useSingle<D = any, E = any, N = D, K = any>(
  key: K | undefined,
  poster: Poster<D, E, N, K> | undefined,
  cparams: Params<D, E, N, K> = {},
): SingleHandle<D, E, N, K> {
  const core = useCore()
  const pparams = useParams()

  const params = { ...pparams, ...cparams }

  const keyRef = useAutoRef(key)
  const posterRef = useAutoRef(poster)
  const paramsRef = useAutoRef(params)

  const skey = useMemo(() => {
    return getSingleStorageKey(key, paramsRef.current)
  }, [key])

  const [, setCounter] = useState(0)

  const stateRef = useRef<State<D, E, N, K> | null>()

  useMemo(() => {
    stateRef.current = core.getSync<D, E, N, K>(skey, paramsRef.current)
  }, [core, skey])

  const setState = useCallback((state?: State<D, E, N, K>) => {
    stateRef.current = state
    setCounter(c => c + 1)
  }, [])

  const initRef = useRef<Promise<void>>()

  useEffect(() => {
    if (stateRef.current !== null) return

    initRef.current = core.get<D, E, N, K>(skey, paramsRef.current).then(setState)
  }, [core, skey])

  useEffect(() => {
    if (!skey) return

    core.on(skey, setState, paramsRef.current)
    return () => void core.off(skey, setState, paramsRef.current)
  }, [core, skey])

  const mutate = useCallback(async (mutator: Mutator<D, E, N, K>) => {
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    const state = stateRef.current
    const params = paramsRef.current

    return await core.mutate(skey, state, mutator, params)
  }, [core, skey])

  const fetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Fetch on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (posterRef.current === undefined)
      return stateRef.current

    const state = stateRef.current
    const key = keyRef.current
    const poster = posterRef.current
    const params = paramsRef.current

    return await core.single.fetch(key, skey, state, poster, aborter, params)
  }, [core, skey])

  const refetch = useCallback(async (aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Refetch on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (posterRef.current === undefined)
      return stateRef.current

    const state = stateRef.current
    const key = keyRef.current
    const poster = posterRef.current
    const params = paramsRef.current

    return await core.single.fetch(key, skey, state, poster, aborter, params, true, true)
  }, [core, skey])

  const update = useCallback(async (updater: Updater<D, E, N, K>, aborter?: AbortController) => {
    if (typeof window === "undefined")
      throw new Error("Update on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")
    if (posterRef.current === undefined)
      return stateRef.current

    const state = stateRef.current
    const key = keyRef.current
    const poster = posterRef.current
    const params = paramsRef.current

    return await core.single.update(key, skey, state, poster, updater, aborter, params)
  }, [core, skey])

  const clear = useCallback(async () => {
    if (typeof window === "undefined")
      throw new Error("Clear on SSR")
    if (stateRef.current === null)
      await initRef.current
    if (stateRef.current === null)
      throw new Error("Null state after init")

    await core.delete(skey, paramsRef.current)
  }, [core, skey])

  const suspend = useCallback(() => {
    if (typeof window === "undefined")
      throw new Error("Suspend on SSR")
    return (async () => {
      if (stateRef.current === null)
        await initRef.current
      if (stateRef.current === null)
        throw new Error("Null state after init")
      if (posterRef.current === undefined)
        throw new Error("No fetcher")

      const state = stateRef.current
      const key = keyRef.current
      const poster = posterRef.current
      const params = paramsRef.current

      const background = new Promise<void>(ok => core.once(skey, () => ok(), params))
      await core.single.fetch(key, skey, state, poster, undefined, params, false, true)
      await background
    })()
  }, [core, skey])

  const state = stateRef.current

  const { data, error, time, cooldown, expiration, aborter, optimistic } = state ?? {}

  const ready = state !== null
  const loading = Boolean(aborter)

  return { key, skey, data, error, time, cooldown, expiration, aborter, optimistic, loading, ready, mutate, fetch, refetch, update, clear, suspend }
}