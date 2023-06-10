import { useRenderRef } from "libs/react/ref.js"
import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request when the browser is online
 * @param query 
 */
export function useOnline(query: Query) {
  const { ready, fetch } = query

  const fetchRef = useRenderRef(fetch)

  useEffect(() => {
    if (!ready)
      return

    const f = () => fetchRef.current()

    addEventListener("online", f)
    return () => removeEventListener("online", f)
  }, [ready])
}