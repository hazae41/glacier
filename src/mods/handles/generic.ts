import { State } from "mod"

export interface Handle<D = any, E = any> {
  key?: string

  data?: D
  error?: E

  time?: number
  loading: boolean

  /**
   * Fetch with cooldown
   * @example You want to fetch and don't care if it's cooldowned
   */
  fetch(): Promise<State<D, E> | undefined>

  /**
   * Fetch without cooldown
   * @example User clicked on the refresh button
   * @example You just made a POST request and want to get some fresh data
   */
  refetch(): Promise<State<D, E> | undefined>

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