import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param query 
 * @param callback 
 */
export function useError(
  query: Query,
  callback: (e: unknown) => void
) {
  const { error } = query

  useEffect(() => {
    if (error.isNone())
      return
    callback(error.get())
  }, [error])
}