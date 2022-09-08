import { useAutoRef } from "libs/react"
import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request when the tab is visible
 * @param handle 
 */
export function useVisible(handle: Handle) {
  const { ready, fetch } = handle

  const fetchRef = useAutoRef(fetch)

  useEffect(() => {
    if (!ready) return

    const f = () => !document.hidden && fetchRef.current()

    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [ready])
}