import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"
import { fetchAsJson } from "../../common/fetcher"

interface HelloData {
  name: string
}

function getHelloSchema() {
  return XSWR.single<HelloData>("/api/hello", fetchAsJson)
}

function useHelloData() {
  const handle = XSWR.use(getHelloSchema, [])

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const hello = useHelloData()

  // this is for you, gaearon
  const { data, error, time, loading, update, refetch, mutate, aborter, optimistic } = hello

  const onRefreshClick = useCallback(() => {
    refetch()
  }, [refetch])

  const onMutateClick = useCallback(() => {
    mutate(() => ({ data: { name: "Hello World" } }))
  }, [mutate])

  const onUpdateClick = useCallback(async () => {
    await update(async function* (previous, { signal }) {
      yield { data: { name: "John Smith" } }
      await new Promise(ok => setTimeout(ok, 1000))
      yield { data: { name: "John Smith 2" } }
      return await fetchAsJson<HelloData>("/api/hello", {
        signal,
        method: "POST",
        body: JSON.stringify({ name: "John Smith" })
      })
    })
  }, [update])

  const onAbortClick = useCallback(() => {
    aborter!.abort("aborted lol")
  }, [aborter])

  return <>
    <div>
      {JSON.stringify(data) ?? "undefined"}
    </div>
    <div>
      time: {time && ~~(time / 1000)}
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
    <button onClick={onMutateClick}>
      Mutate
    </button>
    {aborter &&
      <button onClick={onAbortClick}>
        Abort
      </button>}
  </>
}

