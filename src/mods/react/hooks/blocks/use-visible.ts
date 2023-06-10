import { useRenderRef } from "libs/react/ref.js"
import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request when the tab is visible
 * @param query 
 */
export function useVisible(query: Query) {
  const { ready, fetch } = query

  const fetchRef = useRenderRef(fetch)

  useEffect(() => {
    if (!ready)
      return

    const f = () => !document.hidden && fetchRef.current()

    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [ready])
}