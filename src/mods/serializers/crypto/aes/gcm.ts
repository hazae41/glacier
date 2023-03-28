import { Bytes } from "@hazae41/bytes";

export class AesGcmSerializer {

  constructor(
    readonly key: CryptoKey
  ) { }

  static async from(data: Uint8Array) {
    const key = await crypto.subtle.importKey("raw", data, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])

    return new this(key)
  }

  static async fromPBKDF2(password: string, salt: Uint8Array, iterations = 100_000) {
    const hkdf = await crypto.subtle.importKey("raw", Bytes.fromUtf8(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"])

    const key = await crypto.subtle.deriveKey({
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    }, hkdf, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])

    return new this(key)
  }

  async stringify(value: any) {
    const iv = Bytes.random(12)
    const ivtext = Bytes.toBase64(iv)

    const plaintext = JSON.stringify(value)
    const plain = Bytes.fromUtf8(plaintext)

    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain)
    const ciphertext = Bytes.toBase64(new Uint8Array(cipher))

    return JSON.stringify({ ivtext, ciphertext })
  }

  async parse(text: string) {
    const { ivtext, ciphertext } = JSON.parse(text) as { ivtext: string, ciphertext: string }

    const iv = Bytes.fromBase64(ivtext)
    const cipher = Bytes.fromBase64(ciphertext)

    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher)
    const plaintext = Bytes.toUtf8(new Uint8Array(plain))

    return JSON.parse(plaintext)
  }
}