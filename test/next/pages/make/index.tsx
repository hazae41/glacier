import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"
import { fetchAsJson } from "../../libs/fetcher"

function getKeySchema(id: string) {
  return XSWR.single(`/api/query?id=${id}`, fetchAsJson)
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
    await key.mutate(() => ({ data: { hello: "world" } }))
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