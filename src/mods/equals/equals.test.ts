import { assert, test, throws } from "@hazae41/phobos";
import { relative, resolve } from "node:path";
import { Equalsable } from "./equals.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname).replace(".mjs", ".ts"))

export class BigInted {

  constructor(
    readonly value: bigint
  ) { }

  equals(other: unknown) {
    if (other instanceof BigInted)
      return other.value === this.value
    return false
  }

}

test("shallow equals", async ({ test }) => {
  assert(Equalsable.equals({ text: "aaaa" }, { text: "aaaa" }) === true, `object should be equals`)
  assert(Equalsable.equals({ text: "aaaa" }, { text: "bbbb" }) === false, `object should not be equals`)

  assert(!throws(() => Equalsable.equals(undefined, undefined)), `should work with undefined`)
  assert(!throws(() => Equalsable.equals(true, false)), `should work with booleans`)
  assert(!throws(() => Equalsable.equals(12345, 54321)), `should work with numbers`)
  assert(!throws(() => Equalsable.equals("hello", "world")), `should work with strings`)
  assert(!throws(() => Equalsable.equals(new Date(), new Date())), `should work with dates`)
  assert(!throws(() => Equalsable.equals(12345n, 54321n)), `should work with bigints`)
  assert(!throws(() => Equalsable.equals(new BigInted(12345n), new BigInted(54321n))), `should work with biginteds`)
  assert(!throws(() => Equalsable.equals(function a() { }, function b() { })), `should work with functions`)
  assert(!throws(() => Equalsable.equals(Symbol("aaa"), Symbol("bbb"))), `should work with symbols`)
})