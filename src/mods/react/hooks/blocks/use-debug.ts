import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Show query in console when it changes
 * @param query 
 */
export function useDebug(query: Query, label: string) {
  const { current } = query

  useEffect(() => {
    console.debug(label, query)
  }, [current])
}