import { Base64 } from "@hazae41/base64"
import { Box, Copied } from "@hazae41/box"
import { Bytes } from "@hazae41/bytes"
import { Ok, Result } from "@hazae41/result"
import { AsyncEncoder } from "mods/coders/coder.js"
import { CryptoError } from "../error/error.js"

export class HmacEncoder implements AsyncEncoder<string, string> {

  constructor(
    readonly key: CryptoKey
  ) { }

  async tryHash(preimage: Uint8Array): Promise<Result<Uint8Array, CryptoError>> {
    return await Result.runAndWrap(async () => {
      return new Uint8Array(await crypto.subtle.sign({ name: "HMAC" }, this.key, preimage))
    }).then(r => r.mapErrSync(CryptoError.from))
  }

  async tryEncode(value: string): Promise<Result<string, Error>> {
    return await Result.unthrow(async t => {
      const hash = await this.tryHash(Bytes.fromUtf8(value)).then(r => r.throw(t))
      const base64 = Base64.get().tryEncodePadded(new Box(new Copied(hash))).throw(t)

      return new Ok(base64)
    })
  }

}