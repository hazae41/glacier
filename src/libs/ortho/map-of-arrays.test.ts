import { assert, test } from "@hazae41/phobos";
import { relative, resolve } from "path";
import { MapOfArrays } from "./map-of-arrays.js";

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname))

function jsoneq(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

test("Map of arrays", async () => {
  const map = new MapOfArrays()

  map.push("test", "toto")
  map.push("test", "tata")
  map.push("test", "titi")

  map.erase("test", "tata")

  assert(jsoneq(map.get("test"), ["toto", "titi"]), `push`)
})