import { Bytes } from "@hazae41/bytes";
import { AsyncCoder } from "mods/serializers/serializer.js";

export class AesGcmCoder implements AsyncCoder<string, string> {

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

  async stringify(input: string) {
    const iv = Bytes.random(12)
    const ivtext = Bytes.toBase64(iv)

    const plain = Bytes.fromUtf8(input)

    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain)
    const ciphertext = Bytes.toBase64(new Uint8Array(cipher))

    return ivtext + "." + ciphertext
  }

  async parse(output: string) {
    const [ivtext, ciphertext] = output.split(".")

    const iv = Bytes.fromBase64(ivtext)
    const cipher = Bytes.fromBase64(ciphertext)

    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher)
    const input = Bytes.toUtf8(new Uint8Array(plain))

    return input
  }
}