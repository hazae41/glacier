/**
 * Orthogonal state publisher
 */
export class CustomEventTarget<T>  {

  readonly #target = new EventTarget()

  dispatchEvent(event: CustomEvent<T>) {
    return this.#target.dispatchEvent(event)
  }

  addEventListener(type: string, callback: (event: CustomEvent<T>) => void, options?: AddEventListenerOptions) {
    return this.#target.addEventListener(type, callback as any, options)
  }

  removeListener(type: string, callback: (event: CustomEvent<T>) => void) {
    return this.#target.removeEventListener(type, callback as any)
  }

}
