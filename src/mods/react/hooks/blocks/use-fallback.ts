import { Query } from "mods/react/types/query.js"
import { State } from "mods/types/state.js"

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @param query 
 * @param state 
 */
export function useFallback<D>(
  query: Query<D>,
  state?: State<D>
) {
  const { data, error } = query

  if (data !== undefined) return
  if (error !== undefined) return
  Object.assign(query, state)
}