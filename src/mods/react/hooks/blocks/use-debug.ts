import { useEffect } from "react"
import { Handle } from "../index"

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