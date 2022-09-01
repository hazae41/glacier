import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

async function fetchAsJson<T>([url, id]: any) {
  const res = await fetch(`${url}?id=${id}`, {})
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T

  return { data }
}

function getKeySchema(id: string) {
  return XSWR.single<unknown>(["/api/keys", id], fetchAsJson)
}

function useAutoFetchMixture(handle: XSWR.Handle) {
  XSWR.useFetch(handle)
  XSWR.useOnline(handle)
  XSWR.useVisible(handle)
  return handle
}

function useKeyMix(id: string) {
  const handle = XSWR.use(getKeySchema, [id])
  return useAutoFetchMixture(handle)
}

function Reader() {
  const { data } = useKeyMix("123")

  return <>{JSON.stringify(data)}</>
}

function Writer() {
  const { make } = XSWR.useXSWR()

  const write = useCallback(async () => {
    const key = make(getKeySchema("123"))
    await key.mutate({ data: { hello: "world" } })
    await key.refetch()
  }, [make])

  return <button onClick={write}>
    Write
  </button>
}

export default function Page() {
  return <>
    <Reader />
    <Writer />
  </>
}