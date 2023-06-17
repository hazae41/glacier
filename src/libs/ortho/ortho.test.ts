import { assert, test } from "@hazae41/phobos";
import { relative, resolve } from "node:path";
import { Ortho } from "./ortho.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname).replace(".mjs", ".ts"))

test("Ortho", async () => {
  let a = 0
  let b = 0

  const ortho = new Ortho<number>()

  const fa = (e: CustomEvent<number>) => { a = e.detail }
  const fb = (e: CustomEvent<number>) => { b = e.detail }

  ortho.addListener("test", fa)
  ortho.addListener("test", fb)

  ortho.removeListener("test", fb)

  ortho.dispatch("test", 123)

  assert(a === 123, `a should be 123`)
  assert(b === 0, `b should be 0`)
})