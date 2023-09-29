import { ReactQuery } from "mods/react/types/query.js"
import { useEffect } from "react"

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param query 
 */
export function useMount<K, D, F>(query: ReactQuery<K, D, F>) {
  const { fetch } = query

  useEffect(() => {
    fetch().then(r => r.inspectErrSync(console.warn))
  }, [])
}