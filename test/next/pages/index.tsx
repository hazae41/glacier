import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

export interface HelloData {
  name: string,
  time: number
}

async function postAsJson<T>(url: string, data?: T) {
  const method = data ? "POST" : "GET"
  const body = data ? JSON.stringify(data) : undefined

  const res = await fetch(url, { method, body })
  if (!res.ok) throw new Error(await res.text())

  return await res.json()
}

function useHelloData() {
  const handle = XSWR.useSingle<HelloData>(
    "/api/hello",
    postAsJson)
  XSWR.useFetch(handle)
  return handle
}

export default function Home() {
  const hello = useHelloData()

  // this is for you, gaearon
  const { update, refetch } = hello

  const onRefreshClick = useCallback(() => {
    refetch()
  }, [refetch])

  const onUpdateClick = useCallback(() => {
    update(previous => ({
      name: previous!.name.replace("Doe", "Smith"),
      time: new Date().getSeconds()
    })).catch(alert)
  }, [update])

  return <>
    <div>
      {JSON.stringify(hello.data)}
    </div>
    <div style={{ color: "red" }}>
      {JSON.stringify(hello.error)}
    </div>
    <div>
      {hello.loading && "Loading..."}
    </div>
    <button onClick={onRefreshClick}>
      Refresh
    </button>
    <button onClick={onUpdateClick}>
      Update
    </button>
  </>
}

