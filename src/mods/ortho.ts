import { useEffect } from "react"

/**
 * Map of arrays data structure
 */
export class MapOfArrays<K = any, V = any> {
  private map = new Map<K, V[]>()

  get(key: K) {
    return this.map.get(key)
  }

  push(key: K, value: V) {
    const values = this.map.get(key)
    if (!values) this.map.set(key, [value])
    else values.push(value)
  }

  erase(key: K, value: V) {
    const values = this.map.get(key)
    if (!values) return
    const values2 = values
      .filter(it => it !== value)
    if (values2.length)
      this.map.set(key, values2)
    else
      this.map.delete(key)
  }
}

/**
 * Orthogonal state publisher
 */
export class Ortho<K = any, S = any> {
  private listeners = new MapOfArrays<K, (x: S) => void>()

  publish(key: K, value: S) {
    const listeners = this.listeners.get(key)
    if (!listeners) return

    for (const listener of listeners)
      listener(value)
  }

  subscribe(key: K, listener: (x: S) => void) {
    this.listeners.push(key, listener)
  }

  unsubscribe(key: K, listener: (x: S) => void) {
    this.listeners.erase(key, listener)
  }
}

/**
 * Orthogonal state listener
 */
export function useOrtho<K, S>(
  ortho: Ortho<K, S>,
  key: K | undefined,
  callback: (s: S) => void
) {
  useEffect(() => {
    if (!key) return
    ortho.subscribe(key, callback)
    return () => ortho.unsubscribe(key, callback)
  }, [ortho, key, callback])
}