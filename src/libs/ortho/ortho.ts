import { MapOfArrays } from "libs/ortho/map-of-arrays.js"

/**
 * Orthogonal state publisher
 */
export class Ortho<K, S> {

  #listeners = new MapOfArrays<K, (x: S) => void>()

  /**
   * Publish a value to all listeners of key
   * @param key 
   * @param value 
   * @returns 
   */
  publish(key: K, value: S) {
    const listeners = this.#listeners.get(key)

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
    this.#listeners.push(key, listener)
  }

  /**
   * Remove a listener from a key
   * @param key 
   * @param listener 
   */
  off(key: K, listener: (x: S) => void) {
    this.#listeners.erase(key, listener)
  }

  once(key: K, listener: (x: S) => void) {
    const listener2 = (x: S) => {
      this.off(key, listener2)
      listener(x)
    }

    this.on(key, listener2)
  }

}
