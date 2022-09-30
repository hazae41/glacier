export class Lock {
  private mutex?: Promise<unknown>

  async lock<T>(callback: () => Promise<T>) {
    if (this.mutex) await this.mutex
    const promise = callback()
    this.mutex = promise
    return await promise
  }
}