import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

async function fetchAsJson<T>([url, id]: any) {
  const res = await fetch(`${url}?id=${id}`, {})
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error, cooldown, expiration }
  }

  const data = await res.json() as T
  return { data, cooldown, expiration }
}

function getKeySchema(id: string) {
  return XSWR.single<unknown>(["/api/query", id], fetchAsJson)
}

function useAutoFetchMixture(handle: XSWR.Handle) {
  XSWR.useFetch(handle)
  XSWR.useOnline(handle)
  XSWR.useVisible(handle)
}

function useKeyMix(id: string) {
  const handle = XSWR.use(getKeySchema, [id])
  useAutoFetchMixture(handle)
  return handle
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