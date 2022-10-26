import { getSingleSchema, useFetch, useQuery, useXSWR } from "@hazae41/xswr"
import { useCallback, useEffect, useState } from "react"
import { fetchAsJson } from "../../common/fetcher"

function getHelloSchema() {
  return getSingleSchema("/api/hello", fetchAsJson)
}

function useHello() {
  const handle = useQuery(getHelloSchema, [])

  useFetch(handle)
  return handle
}

function Consumer() {
  const hello = useHello()

  return <div>
    {JSON.stringify(hello.data) ?? "undefined"}
  </div>
}

export default function Page() {
  const { core } = useXSWR()

  const [count, setCount] = useState(0)

  const increase = useCallback(() => {
    setCount(Math.min(count + 1, 10))
  }, [count])

  const decrease = useCallback(() => {
    setCount(Math.max(count - 1, 0))
  }, [count])

  useEffect(() => {
    console.log("cache", core.cache)
  }, [core])

  return <>
    {[...Array(count)].map((_, i) =>
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