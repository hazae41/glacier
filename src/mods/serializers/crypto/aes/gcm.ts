import { Base64 } from "@hazae41/base64";
import { Bytes } from "@hazae41/bytes";
import { Ok, Result } from "@hazae41/result";
import { AsyncBicoder } from "mods/serializers/coder.js";
import { CryptoError } from "../error/error.js";

export class AesGcmCoder implements AsyncBicoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  async tryEncrypt(plain: Uint8Array, iv: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await Result.runAndWrap(async () => {
      return new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, plain))
    }).then(r => r.mapErrSync(CryptoError.from))
  }

  async tryEncode(input: string): Promise<Result<string, Error>> {
    return await Result.unthrow(async t => {
      const iv = Bytes.tryRandom(12).throw(t)
      const ivtext = Base64.get().tryEncodePadded(iv).throw(t)

      const plain = Bytes.fromUtf8(input)

      const cipher = await this.tryEncrypt(plain, iv).then(r => r.throw(t))
      const ciphertext = Base64.get().tryEncodePadded(cipher).throw(t)

      return new Ok(ivtext + "." + ciphertext)
    })
  }

  async tryDecrypt(cipher: Uint8Array, iv: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await Result.runAndWrap(async () => {
      return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, this.key, cipher))
    }).then(r => r.mapErrSync(CryptoError.from))
  }

  async tryDecode(output: string): Promise<Result<string, Error>> {
    return await Result.unthrow(async t => {
      const [ivtext, ciphertext] = output.split(".")

      const iv = Base64.get().tryDecodePadded(ivtext).throw(t).copyAndDispose()
      const cipher = Base64.get().tryDecodePadded(ciphertext).throw(t).copyAndDispose()

      const plain = await this.tryDecrypt(cipher, iv).then(r => r.throw(t))
      const input = Bytes.toUtf8(plain)

      return new Ok(input)
    })
  }
}