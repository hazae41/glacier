import { MapOfArrays } from "libs/ortho/map-of-arrays.js"

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

  on(key: K, listener: (x: S) => void) {
    this.listeners.push(key, listener)
  }

  off(key: K, listener: (x: S) => void) {
    this.listeners.erase(key, listener)
  }
}
