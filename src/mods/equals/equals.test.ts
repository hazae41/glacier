import { assert, test, throws } from "@hazae41/phobos";
import { relative, resolve } from "path";
import { Equals } from "./equals.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname))

test("shallow equals", async ({ test }) => {
  assert(Equals.shallow({ text: "aaaa" }, { text: "aaaa" }) === true, `object should be equals`)
  assert(Equals.shallow({ text: "aaaa" }, { text: "bbbb" }) === false, `object should not be equals`)

  assert(!throws(() => Equals.shallow(undefined, undefined)), `should work with undefined`)
  assert(!throws(() => Equals.shallow(true, false)), `should work with booleans`)
  assert(!throws(() => Equals.shallow(12345, 54321)), `should work with numbers`)
  assert(!throws(() => Equals.shallow("hello", "world")), `should work with strings`)
  assert(!throws(() => Equals.shallow(new Date(), new Date())), `should work with dates`)
  assert(!throws(() => Equals.shallow(BigInt(12345), BigInt(54321))), `should work with bigints`)
  assert(!throws(() => Equals.shallow(function a() { }, function b() { })), `should work with functions`)
  assert(!throws(() => Equals.shallow(Symbol("aaa"), Symbol("bbb"))), `should work with symbols`)
})