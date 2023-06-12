export class StorageCreationError extends Error {
  readonly #class = StorageCreationError
  readonly name = this.#class.name

  constructor() {
    super(`Could not create storage`)
  }

}