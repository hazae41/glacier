import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"
import { HelloData } from "../../types/hello"

async function postAsJson<T extends HelloData>(url: string, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const method = more.data ? "POST" : "GET"
  const body = more.data ? JSON.stringify(more.data) : undefined

  const res = await fetch(url, { method, body, signal })
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error, cooldown, expiration }
  }

  const data = await res.json() as T
  const time = data.time
  return { data, time, cooldown, expiration }
}

function getHelloSchema() {
  return XSWR.single<HelloData>("/api/hello", postAsJson)
}

function useHelloData() {
  const handle = XSWR.use(getHelloSchema, [])

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const hello = useHelloData()

  // this is for you, gaearon
  const { data, error, loading, update, refetch, aborter, optimistic } = hello

  const onRefreshClick = useCallback(() => {
    refetch()
  }, [refetch])

  const onUpdateClick = useCallback(async () => {
    const aborter = new AbortController()

    update(previous => ({
      name: previous?.name.replace("Doe", "Smith") ?? "None",
      time: new Date().getSeconds()
    }), aborter)

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
      {error instanceof Error
        ? error.message
        : JSON.stringify(error)}
    </div>
    <div>
      {optimistic && "Optimistic"}
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

