import { Query } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Show handle in console when it changes
 * @param handle 
 */
export function useDebug(handle: Query, label: string) {
  const { data, error, time } = handle

  useEffect(() => {
    console.debug(label, handle)
  }, [data, error, time])
}