import { Handle } from "../handles"
import { useEffect } from "react"

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle 
 * @param options 
 */
export function useInterval(handle: Handle, interval: number) {
	const { fetch } = handle

	useEffect(() => {
		if (!interval) return
		const i = setInterval(fetch, interval)
		return () => clearInterval(i)
	}, [fetch, interval])
}