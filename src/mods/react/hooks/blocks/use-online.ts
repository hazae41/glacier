import { useAutoRef } from "libs/react.js"
import { Handle } from "mods/react/types/handle.js"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
  const { ready, fetch } = handle

  const fetchRef = useAutoRef(fetch)

  useEffect(() => {
    if (!ready) return

    const f = () => fetchRef.current()

    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [ready])
}