import { useAutoRef } from "libs/react.js"
import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param query 
 */
export function useOnline(query: Query) {
  const { ready, fetch } = query

  const fetchRef = useAutoRef(fetch)

  useEffect(() => {
    if (!ready) return

    const f = () => fetchRef.current()

    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [ready])
}