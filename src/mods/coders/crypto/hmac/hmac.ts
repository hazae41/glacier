import { Base64 } from "@hazae41/base64"
import { Bytes } from "@hazae41/bytes"
import { AsyncEncoder } from "mods/coders/coder.js"

export class HmacEncoder implements AsyncEncoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  async hashOrThrow(preimage: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.sign({ name: "HMAC" }, this.key, preimage))
  }

  async encodeOrThrow(value: string): Promise<string> {
    return Base64.get().getOrThrow().encodePaddedOrThrow(await this.hashOrThrow(Bytes.fromUtf8(value)))
  }

}