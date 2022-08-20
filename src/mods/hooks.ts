import { useContext, useEffect, useRef } from "react"
import { CoreContext } from "../comps/core"
import { State } from "./storage"

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

/**
 * Do a request on mount and url change
 * @see useMount for doing a request on mount only
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useFetch(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    fetch()
  }, [fetch])
}

/**
 * Do a request on mount and url change only if there is no data yet
 * @warning Will still try to fetch is there is an error
 * @param handle 
 * @example You want to get some data once and share it in multiple components
 */
export function useOnce(handle: Handle) {
  const { data, fetch } = handle

  useEffect(() => {
    if (!data) fetch()
  }, [data, fetch])
}

/**
 * Do a request on mount only
 * @see useFetch for doing a request on url change
 * @see useOnce for doing a request only if there is no data yet
 * @param handle 
 */
export function useMount(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    fetch()
  }, [])
}

/**
 * Do a request on interval
 * @see useRetry for error retry
 * @param handle 
 * @param options 
 */
export function useInterval(handle: Handle, interval: number) {
  const { fetch } = handle

  useEffect(() => {
    if (!interval) return
    const i = setInterval(fetch, interval)
    return () => clearInterval(i)
  }, [fetch, interval])
}

/**
 * Do a request when the browser is online
 * @param handle 
 */
export function useOnline(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    addEventListener("online", fetch)
    return () => removeEventListener("online", fetch)
  }, [fetch])
}

/**
 * Do a request when the tab is visible
 * @param handle 
 */
export function useVisible(handle: Handle) {
  const { fetch } = handle

  useEffect(() => {
    const f = () => !document.hidden && fetch()
    document.addEventListener("visibilitychange", f)
    return () => document.removeEventListener("visibilitychange", f)
  }, [fetch])
}

/**
 * Call a function on error
 * @param handle 
 * @param callback 
 */
export function useError<D = any, E = any>(
  handle: Handle<D, E>,
  callback: (e: E) => void
) {
  const { error } = handle

  useEffect(() => {
    if (error) callback(error)
  }, [error, callback])
}

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

export interface RetryOptions {
  init?: number
  base?: number
  max?: number
}

/**
 * Retry request on error using exponential backoff
 * @see useInterval for interval based requests
 * @param handle 
 * @param options
 * @param options.init Initial timeout to be multiplied (in milliseconds)
 * @param options.base Exponent base (2 means the next timeout will be 2 times longer)
 * @param options.max Maximum count (3 means do not retry after 3 retries)
 * @see https://en.wikipedia.org/wiki/Exponential_backoff
 * @see https://en.wikipedia.org/wiki/Geometric_progression
 */
export function useRetry(handle: Handle, options: RetryOptions = {}) {
  const { refetch, error, time } = handle
  const { init = 1000, base = 2, max = 3 } = options

  const count = useRef(0)

  useEffect(() => {
    count.current = 0
  }, [refetch, init, base, max])

  useEffect(() => {
    if (!error) {
      count.current = 0
      return
    }

    if (count.current >= max) return
    const ratio = base ** count.current
    const f = () => { count.current++; refetch() }
    const t = setTimeout(f, init * ratio)
    return () => clearTimeout(t)
  }, [error, time])
}

/**
 * Fallback to given data/error if there is no data/error
 * @example You got some data/error using SSR/ISR and want to display it on first render
 * @example You still want to display something even if the fetcher returned nothing
 * @see useInit For filling the global cache with the data/error
 * @param handle 
 * @param state 
 */
export function useFallback<D = any, E = any>(
  handle: Handle<D, E>,
  state?: State<D, E>
) {
  const { data, error } = handle

  if (data || error) return
  Object.assign(handle, state)
}

/**
 * Fill the global cache with data/error if there is no data/error yet
 * @example You got some data/error and want to save it in the cache
 * @warning Not needed for Next.js SSR/ISR since the props are already saved
 * @warning Will fill the cache AFTER the first render
 * @see useFallback for showing data on first render
 * @param handle 
 * @param state 
 */
export function useInit<D = any, E = any>(
  handle: Handle<D, E>,
  state?: State<D, E>
) {
  const { key, mutate } = handle
  const core = useContext(CoreContext)!

  useEffect(() => {
    if (!key || !state) return
    if (core.has(key)) return
    state.time ??= 1
    mutate(state)
  }, [key])
}
