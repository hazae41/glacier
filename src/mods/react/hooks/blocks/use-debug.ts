import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Show query in console when it changes
 * @param query 
 */
export function useDebug<K, D, F>(query: Query<K, D, F>, label: string) {
  const { current } = query

  useEffect(() => {
    console.debug(label, query)
  }, [current])
}