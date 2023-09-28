/**
 * Orthogonal state publisher
 */
export class CustomEventTarget<M extends Record<string, any>>  {

  readonly #target = new EventTarget()

  dispatchEvent(event: CustomEvent<M[string]>) {
    return this.#target.dispatchEvent(event)
  }

  addEventListener<K extends keyof M>(type: K, callback: (event: CustomEvent<M[K]>) => void, options?: AddEventListenerOptions) {
    return this.#target.addEventListener(type as any, callback as any, options)
  }

  removeListener<K extends keyof M>(type: K, callback: (event: CustomEvent<M[K]>) => void) {
    return this.#target.removeEventListener(type as any, callback as any)
  }

}

