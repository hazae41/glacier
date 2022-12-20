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

    const values2 = values.filter(it => it !== value)

    if (values2.length)
      this.map.set(key, values2)
    else
      this.map.delete(key)
  }
}