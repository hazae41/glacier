export class Mutex {

  #promise?: Promise<unknown>

  async lock<T>(callback: () => Promise<T>) {
    if (this.#promise) await this.#promise
    const promise = callback()
    this.#promise = promise
    return await promise
  }
}