export class StorageCreationError extends Error {
  readonly #class = StorageCreationError
  readonly name = this.#class.name

  constructor(options?: ErrorOptions) {
    super(`Could not create storage`, options)
  }

  static from(cause: unknown) {
    return new StorageCreationError({ cause })
  }

}