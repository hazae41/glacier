import { Bytes } from "@hazae41/bytes";

export namespace PBKDF2 {

  /**
   * @deprecated
   * @param password 
   * @returns 
   */
  export async function from(password: string) {
    return await crypto.subtle.importKey("raw", Bytes.fromUtf8(password), { name: "PBKDF2" }, false, ["deriveKey", "deriveBits"])
  }

}