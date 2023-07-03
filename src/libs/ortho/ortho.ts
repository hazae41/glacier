/**
 * Orthogonal state publisher
 */
export class Ortho<T> extends EventTarget {

  constructor() {
    super()
  }

  dispatch(key: string, detail: T) {
    const event = new CustomEvent(key, { detail })
    this.dispatchEvent(event)
  }

  addListener(key: string, listener: (event: CustomEvent<T>) => void) {
    this.addEventListener(key, listener as any, { passive: true })
    return () => this.removeEventListener(key, listener as any)
  }

  removeListener(key: string, listener: (event: CustomEvent<T>) => void) {
    this.removeEventListener(key, listener as any)
    return () => this.addEventListener(key, listener as any, { passive: true })
  }

}
