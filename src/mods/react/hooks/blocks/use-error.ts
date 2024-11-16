import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param query 
 * @param callback 
 */
export function useError<K, D, F>(query: ReactQuery<K, D, F>, callback: (query: ReactQuery<K, D, F>, error: F) => void) {
  const { error } = query

  useEffect(() => {
    if (error == null)
      return
    callback(query, error.getErr())
  }, [error])
}