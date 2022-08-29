import { Handle } from "mods/react/hooks/handles"
import { useEffect } from "react"

/**
 * Call a function on error
 * @param handle 
 * @param callback 
 */
export function useError<D = any, E = any>(
  handle: Handle<D, E>,
  callback: (e: E) => void
) {
  const { ready, error } = handle

  useEffect(() => {
    if (!ready) return

    if (error !== undefined) callback(error)
  }, [ready, error, callback])
}