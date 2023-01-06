import { assert, test } from "@hazae41/phobos";
import { relative, resolve } from "path";
import { Ortho } from "./ortho.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname))

test("Ortho", async () => {
  let a = 0
  let b = 0

  const ortho = new Ortho<string, number>()

  const fa = (x: number) => { a = x }
  const fb = (x: number) => { b = x }

  ortho.on("test", fa)
  ortho.on("test", fb)

  ortho.off("test", fb)

  ortho.publish("test", 123)

  assert(a === 123, `a should be 123`)
  assert(b === 0, `b should be 0`)
})