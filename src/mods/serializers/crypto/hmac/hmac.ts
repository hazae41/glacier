import { Bytes } from "@hazae41/bytes"
import { AsyncEncoder } from "mods/serializers/serializer.js"

export class HmacEncoder implements AsyncEncoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  /**
   * @deprecated
   * @param pbkdf2 
   * @param salt 
   * @param iterations 
   * @returns 
   */
  static async fromPBKDF2(pbkdf2: CryptoKey, salt: Uint8Array, iterations: number) {
    const key = await crypto.subtle.deriveKey({
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    }, pbkdf2, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    return new HmacEncoder(key)
  }

  async hash(preimage: Uint8Array) {
    return new Uint8Array(await crypto.subtle.sign({ name: "HMAC" }, this.key, preimage))
  }

  async stringify(value: string) {
    return Bytes.toBase64(await this.hash(Bytes.fromUtf8(value)))
  }

}