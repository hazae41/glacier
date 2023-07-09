import { Bytes } from "@hazae41/bytes";
import { AsyncBicoder } from "mods/serializers/serializer.js";

export class AesGcmCoder implements AsyncBicoder<string, string> {

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
    }, pbkdf2, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])

    return new AesGcmCoder(key)
  }

  async encrypt(plain: Uint8Array, iv: Uint8Array) {
    return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain))
  }

  async stringify(input: string) {
    const iv = Bytes.random(12)
    const ivtext = Bytes.toBase64(iv)

    const plain = Bytes.fromUtf8(input)

    const cipher = await this.encrypt(plain, iv)
    const ciphertext = Bytes.toBase64(cipher)

    return ivtext + "." + ciphertext
  }

  async decrypt(cipher: Uint8Array, iv: Uint8Array) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher))
  }

  async parse(output: string) {
    const [ivtext, ciphertext] = output.split(".")

    const iv = Bytes.fromBase64(ivtext)
    const cipher = Bytes.fromBase64(ciphertext)

    const plain = await this.decrypt(cipher, iv)
    const input = Bytes.toUtf8(plain)

    return input
  }
}