import { Handle } from "../handles"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
	const { fetch } = handle

	useEffect(() => {
		addEventListener("online", fetch)
		return () => removeEventListener("online", fetch)
	}, [fetch])
}