import { MapOfArrays } from "libs/ortho/map-of-arrays.js"

/**
 * Orthogonal state publisher
 */
export class Ortho<K = any, S = any> {
  private listeners = new MapOfArrays<K, (x: S) => void>()

  /**
   * Publish a value to all listeners of key
   * @param key 
   * @param value 
   * @returns 
   */
  publish(key: K, value: S) {
    const listeners = this.listeners.get(key)

    if (listeners === undefined)
      return

    for (const listener of listeners)
      listener(value)
  }

  /**
   * Add a listener to a key
   * @param key 
   * @param listener 
   */
  on(key: K, listener: (x: S) => void) {
    this.listeners.push(key, listener)
  }

  /**
   * Remove a listener from a key
   * @param key 
   * @param listener 
   */
  off(key: K, listener: (x: S) => void) {
    this.listeners.erase(key, listener)
  }
}
