import { XSWR } from "@hazae41/xswr"
import { useCallback, useEffect, useState } from "react"
import { HelloData } from "../common/hello"

async function fetchAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  return { data, cooldown, expiration }
}

function useHelloData() {
  const handle = XSWR.useSingle<HelloData>("/api/hello", fetchAsJson)

  XSWR.useFetch(handle)
  return handle
}

function Consumer() {
  const hello = useHelloData()

  return <div>
    {JSON.stringify(hello.data) ?? "undefined"}
  </div>
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
    <div>
      <button onClick={increase}>
        +
      </button>
      <button onClick={decrease}>
        -
      </button>
    </div>
  </>
}