import { DataAndError } from "mods/react/types/data_and_error.js"
import { Query } from "mods/react/types/query.js"

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query 
 * @param fallback 
 */
export function useFallback<D, F>(
  query: Query<D>,
  fallback?: DataAndError<D, F>
) {
  if (fallback === undefined)
    return
  if (query.data.isSome())
    return
  if (query.error.isSome())
    return

  const { data, error } = fallback
  Object.assign(query, { data, error })
}