import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param query 
 * @param callback 
 */
export function useError<D = any, E = any, K = any>(
  query: Query<D, E, K>,
  callback: (e: E) => void
) {
  const { error } = query

  useEffect(() => {
    if (error !== undefined) callback(error)
  }, [error])
}