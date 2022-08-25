import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

export interface HelloData {
  name: string,
  time: number
}

async function postAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { data, signal } = more

  const method = data ? "POST" : "GET"
  const body = data ? JSON.stringify(data) : undefined

  const res = await fetch(url, { method, body, signal })
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
  const { data, error, loading, update, refetch, aborter } = hello

  const onRefreshClick = useCallback(() => {
    refetch()
  }, [refetch])

  const onUpdateClick = useCallback(async () => {
    const aborter = new AbortController()

    update(previous => ({
      name: previous?.name.replace("Doe", "Smith") ?? "None",
      time: new Date().getSeconds()
    }), aborter).catch(alert)

    // await new Promise(ok => setTimeout(ok, 500))
    // aborter.abort()
  }, [update])

  const onAbortClick = useCallback(() => {
    aborter!.abort("dd")
  }, [aborter])

  return <>
    <div>
      {JSON.stringify(data) ?? "undefined"}
    </div>
    <div style={{ color: "red" }}>
      {error && XSWR.isAbortError(error)
        ? "Aborted"
        : JSON.stringify(error)}
    </div>
    <div>
      {loading && "Loading..."}
    </div>
    <button onClick={onRefreshClick}>
      Refresh
    </button>
    <button onClick={onUpdateClick}>
      Update
    </button>
    {aborter &&
      <button onClick={onAbortClick}>
        Abort
      </button>}
  </>
}

