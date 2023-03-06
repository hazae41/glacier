/**
 * Map of arrays data structure
 */
export class MapOfArrays<K, V> {

  #map = new Map<K, V[]>()

  /**
   * Get all values from a key
   * @param key the key
   * @returns the array mapped to that key
   */
  get(key: K) {
    return this.#map.get(key)
  }

  /**
   * Push some value to a key
   * @param key the key
   * @param value the value to push into that key
   */
  push(key: K, value: V) {
    const values = this.#map.get(key)

    if (values !== undefined) {
      values.push(value)
      return
    }

    this.#map.set(key, [value])
  }

  /**
   * Erase some value from a key
   * @param key the key
   * @param value the value to remove from that key
   * @returns 
   */
  erase(key: K, value: V) {
    const values = this.#map.get(key)

    if (values === undefined)
      return

    const values2 = values.filter(it => it !== value)

    if (values2.length)
      this.#map.set(key, values2)
    else
      this.#map.delete(key)
  }
}