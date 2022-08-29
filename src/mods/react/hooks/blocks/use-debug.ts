import { Handle } from "mods/react/hooks/bases"
import { useEffect } from "react"

/**
 * Show handle in console when it changes
 * @param handle 
 */
export function useDebug<D = any, E = any>(
  handle: Handle<D, E>,
  label: string
) {
  const { time } = handle

  useEffect(() => {
    console.debug(label, handle)
  }, [time])
}