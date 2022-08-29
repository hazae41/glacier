import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Do a request when the tab is visible
 * @param handle 
 */
export function useVisible(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    const f = () => !document.hidden && fetch()
    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [fetch])
}