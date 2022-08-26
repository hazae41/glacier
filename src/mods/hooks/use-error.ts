import { useEffect } from "react"
import { Handle } from "../handles/index.js"

/**
 * Call a function on error
 * @param handle 
 * @param callback 
 */
export function useError<D = any, E = any>(
  handle: Handle<D, E>,
  callback: (e: E) => void
) {
  const { error } = handle

  useEffect(() => {
    if (error !== undefined) callback(error)
  }, [error, callback])
}