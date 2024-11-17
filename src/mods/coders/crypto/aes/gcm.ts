import { Base64 } from "@hazae41/base64";
import { Bytes } from "@hazae41/bytes";
import { AsyncBicoder } from "mods/coders/coder.js";

export class AesGcmBicoder implements AsyncBicoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  async encryptOrThrow(plain: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain))
  }

  async encodeOrThrow(input: string): Promise<string> {
    const ivBytes = Bytes.random(12)
    const ivBase64 = Base64.get().getOrThrow().encodePaddedOrThrow(ivBytes)

    const plainBytes = Bytes.fromUtf8(input)

    const cipherBytes = await this.encryptOrThrow(plainBytes, ivBytes)
    const cipherBase64 = Base64.get().getOrThrow().encodePaddedOrThrow(cipherBytes)

    return `${ivBase64}.${cipherBase64}`
  }

  async decryptOrThrow(cipher: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher))
  }

  async decodeOrThrow(output: string): Promise<string> {
    const [ivBase64, cipherBase64] = output.split(".")

    using ivMemory = Base64.get().getOrThrow().decodePaddedOrThrow(ivBase64)
    using cipherMemory = Base64.get().getOrThrow().decodePaddedOrThrow(cipherBase64)

    const plainBytes = await this.decryptOrThrow(cipherMemory.bytes, ivMemory.bytes)

    return Bytes.toUtf8(plainBytes)
  }

}