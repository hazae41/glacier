import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param query 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce(query: Query) {
  const { data, fetch } = query

  useEffect(() => {
    if (data !== undefined)
      return
    fetch().then(r => r.ignore())
  }, [data, fetch])
}