import { assert, test } from "@hazae41/phobos";
import { Mutex } from "libs/mutex/mutex.js";

test("mutex", async ({ test, wait }) => {
  const mutex = new Mutex()

  const order = new Array<string>()

  test("first", async () => {
    await mutex.lock(async () => {
      order.push("first start")
      await new Promise(ok => setTimeout(ok, 100))
      order.push("first end")
    })
  })

  test("second", async () => {
    await mutex.lock(async () => {
      order.push("second start")
      await new Promise(ok => setTimeout(ok, 100))
      order.push("second end")
    })
  })

  await wait()

  assert(JSON.stringify(order) === JSON.stringify([
    "first start",
    "first end",
    "second start",
    "second end"
  ]), `unexpected order`)

  console.log(`mutex ✅`)
})