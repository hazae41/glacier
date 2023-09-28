import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request when the tab is visible
 * @param query 
 */
export function useVisible<K, D, F>(query: ReactQuery<K, D, F>) {
  const { ready, fetch } = query

  useEffect(() => {
    if (!ready)
      return

    const f = () => {
      if (document.hidden)
        return
      fetch().then(r => r.ignore())
    }

    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [ready, fetch])
}