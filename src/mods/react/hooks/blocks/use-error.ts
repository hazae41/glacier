import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param handle 
 * @param callback 
 */
export function useError<D extends N = any, E = any, N = D, K = any>(
  handle: Handle<D, E>,
  callback: (e: E) => void
) {
  const { error } = handle

  useEffect(() => {
    if (error !== undefined) callback(error)
  }, [error])
}