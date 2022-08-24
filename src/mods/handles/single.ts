import { useCallback, useEffect, useState } from "react"
import { useCore } from "../../comps"
import { useOrtho } from "../../libs/ortho"
import { Poster } from "../core"
import { State } from "../storage"
import { Handle } from "./generic"

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any> extends Handle<D, E> {
	update(data: D): Promise<State<D, E> | undefined>
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
	cooldown = 1000
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

	const fetch = useCallback(async () => {
		return await core.single.fetch<D, E>(key, poster, cooldown)
	}, [core, key, poster, cooldown])

	const refetch = useCallback(async () => {
		return await core.single.fetch<D, E>(key, poster)
	}, [core, key, poster])

	const update = useCallback((data?: D) => {
		return core.single.update<D, E>(key, poster, data)
	}, [core, key, poster])

	const clear = useCallback(() => {
		core.delete(key)
	}, [core, key])

	const { data, error, time, loading = false } = state ?? {}

	return { key, data, error, time, loading, mutate, fetch, refetch, update, clear }
}