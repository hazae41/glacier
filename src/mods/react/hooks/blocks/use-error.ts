import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param handle 
 * @param callback 
 */
export function useError<D = any, E = any, N extends D = D, K = any>(
  handle: Handle<D, E, N, K>,
  callback: (e: E) => void
) {
  const { error } = handle

  useEffect(() => {
    if (error !== undefined) callback(error)
  }, [error])
}