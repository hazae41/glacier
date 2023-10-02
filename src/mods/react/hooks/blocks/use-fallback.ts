import { Fetched } from "mods/fetched/fetched.js"
import { ReactQuery } from "mods/react/types/query.js"

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query 
 * @param fallback 
 */
export function useFallback<K, D, F>(query: ReactQuery<K, D, F>, factory?: () => Fetched<D, F>) {
  if (factory == null)
    return
  if (query.data != null)
    return
  if (query.error != null)
    return

  const fallback = factory()

  if (fallback.isData())
    Object.assign(query, { data: fallback })

  if (fallback.isFail())
    Object.assign(query, { error: fallback })

  Object.assign(query, { current: fallback })
}