import { Handle } from "mods/react/hooks/handles"
import { useEffect, useRef } from "react"

/**
 * Do a request when the tab is visible
 * @param handle 
 */
export function useVisible(handle: Handle) {
  const { fetch } = handle

  const fetchRef = useRef(fetch)
  fetchRef.current = fetch

  useEffect(() => {
    const f = () => !document.hidden && fetchRef.current()

    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [])
}