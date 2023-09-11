import { Base64 } from "@hazae41/base64";
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
    const ivtext = Base64.get().tryEncode(iv).unwrap()

    const plain = Bytes.fromUtf8(input)

    const cipher = await this.encrypt(plain, iv)
    const ciphertext = Base64.get().tryEncode(cipher).unwrap()

    return ivtext + "." + ciphertext
  }

  async decrypt(cipher: Uint8Array, iv: Uint8Array) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher))
  }

  async parse(output: string) {
    const [ivtext, ciphertext] = output.split(".")

    const iv = Base64.get().tryDecode(ivtext).unwrap().copyAndDispose()
    const cipher = Base64.get().tryDecode(ciphertext).unwrap().copyAndDispose()

    const plain = await this.decrypt(cipher, iv)
    const input = Bytes.toUtf8(plain)

    return input
  }
}