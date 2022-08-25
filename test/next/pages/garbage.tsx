import { XSWR } from "@hazae41/xswr"
import { useCallback, useEffect, useState } from "react"
import { HelloData } from "../common/hello"

async function postAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { data, signal } = more

  const method = data ? "POST" : "GET"
  const body = data ? JSON.stringify(data) : undefined

  const res = await fetch(url, { method, body, signal })
  if (!res.ok) throw new Error(await res.text())

  return { data: await res.json(), expiration: Date.now() + (10 * 1000) }
}

function useHelloData() {
  const handle = XSWR.useSingle<HelloData>(
    "/api/hello",
    postAsJson)
  XSWR.useFetch(handle)
  return handle
}

function Consumer() {
  const hello = useHelloData()

  return <>{JSON.stringify(hello.data)}</>
}

export default function Page() {
  const core = XSWR.useCore()

  const [count, setCount] = useState(0)

  const increase = useCallback(() => {
    setCount(Math.min(count + 1, 10))
  }, [count])

  const decrease = useCallback(() => {
    setCount(Math.max(count - 1, 0))
  }, [count])

  useEffect(() => {
    console.log("core", core)
  }, [core])

  return <>
    {[...Array(count)].map(i =>
      <Consumer key={i} />)}
    <button onClick={increase}>
      +
    </button>
    <button onClick={decrease}>
      -
    </button>
  </>
}