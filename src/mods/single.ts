import { useCallback, useContext, useEffect, useState } from "react"
import { CoreContext, Fetcher } from "./core"
import { Handle } from "./hooks"
import { useOrtho } from "./ortho"
import { State } from "./storage"

/**
 * Handle for a single resource
 */
export interface SingleHandle<D = any, E = any> extends Handle<D, E> {}

/**
 * Single resource hook
 * @param key Key (will be passed to your fetcher)
 * @param fetcher Memoized fetcher, do not pass a lambda
 * @param cooldown Usually your resource TTL
 * @returns A single resource handle
 */
export function useSingle<D = any, E = any>(
	key: string | undefined,
	fetcher: Fetcher<D>,
	cooldown = 1000
): SingleHandle<D, E> {
	const core = useContext(CoreContext)!

	const [state, setState] = useState(
		() => core.get(key))
	useEffect(() => {
		setState(core.get(key))
	}, [key])

	useOrtho(core, key, setState)

	const mutate = useCallback((res: State<D, E>) => {
		return core.mutate<D, E>(key, res)
	}, [core, key])

	const fetch = useCallback(async () => {
		return await core.fetch<D, E>(key, fetcher, cooldown)
	}, [core, key, fetcher, cooldown])

	const refetch = useCallback(async () => {
		return await core.fetch<D, E>(key, fetcher)
	}, [core, key, fetcher])

	const clear = useCallback(() => {
		core.delete(key)
	}, [core, key])

	const { data, error, time, loading = false } = state ?? {}

	return { key, data, error, time, loading, mutate, fetch, refetch, clear }
}