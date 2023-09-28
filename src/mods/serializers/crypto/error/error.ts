export class CryptoError extends Error {
  readonly #class = CryptoError
  readonly name = this.#class.name

  constructor(options: ErrorOptions) {
    super(`Could not do some cryptography`, options)
  }

  static from(cause: unknown) {
    return new CryptoError({ cause })
  }

}