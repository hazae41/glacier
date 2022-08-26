import { State } from "../storage.js"

export interface Handle<D = any, E = any, K = any> {
  key?: K
  skey?: string,

  data?: D
  error?: E

  time?: number
  loading: boolean
  aborter?: AbortController,
  expiration?: number

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(aborter?: AbortController): Promise<State<D, E> | undefined>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(aborter?: AbortController): Promise<State<D, E> | undefined>

  /**
   * Mutate the cache
   * @param res 
   */
  mutate(res: State<D, E>): State<D, E> | undefined

  /**
   * Clear the cache
   */
  clear(): void
}