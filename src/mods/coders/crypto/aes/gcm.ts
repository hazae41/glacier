import { Base64 } from "@hazae41/base64";
import { Bytes } from "@hazae41/bytes";
import { AsyncBicoder } from "mods/coders/coder.js";

export class AesGcmCoder implements AsyncBicoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  async encryptOrThrow(plain: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain))
  }

  async encodeOrThrow(input: string): Promise<string> {
    const iv = Bytes.random(12)
    const ivtext = Base64.get().encodePaddedOrThrow(iv)

    const plain = Bytes.fromUtf8(input)

    const cipher = await this.encryptOrThrow(plain, iv)
    const ciphertext = Base64.get().encodePaddedOrThrow(cipher)

    return `${ivtext}.${ciphertext}`
  }

  async decryptOrThrow(cipher: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher))
  }

  async decodeOrThrow(output: string): Promise<string> {
    const [ivtext, ciphertext] = output.split(".")

    const iv = Base64.get().decodePaddedOrThrow(ivtext).copyAndDispose()
    const cipher = Base64.get().decodePaddedOrThrow(ciphertext).copyAndDispose()

    const plain = await this.decryptOrThrow(cipher, iv)

    return Bytes.toUtf8(plain)
  }

}