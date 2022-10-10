import { Handle } from "mods/react/types/handle.js"
import { useEffect } from "react"

/**
 * Show handle in console when it changes
 * @param handle 
 */
export function useDebug<D = any, E = any, K = any>(
  handle: Handle<D, E, K>,
  label: string
) {
  const { data, error, time, } = handle

  useEffect(() => {
    console.debug(label, handle)
  }, [data, error, time])
}