import { Query } from "mods/react/types/query.js"
import { Fetched } from "mods/result/fetched.js"

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query 
 * @param fallback 
 */
export function useFallback<D, F>(
  query: Query<D>,
  fallback?: Fetched<D, F>
) {
  if (fallback === undefined)
    return
  if (query.data !== undefined)
    return
  if (query.error !== undefined)
    return

  if (fallback.isData())
    Object.assign(query, { data: fallback })
  if (fallback.isFail())
    Object.assign(query, { error: fallback })
  Object.assign(query, { current: fallback })
}