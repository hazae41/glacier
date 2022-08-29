import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

async function fetchAsJson<T>([url, id]: any, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(`${url}?id=${id}`, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  return { data, cooldown, expiration }
}

function getKeyDataDesc(id: string) {
  return new XSWR.SingleDescriptor(
    ["/api/hello", id],
    fetchAsJson,
    { cooldown: 5000 })
}

function useKeyData(id: string) {
  const handle = XSWR.use(getKeyDataDesc(id))

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  return <>
    <Reader />
    <Writer />
  </>
}

function Reader() {
  const { data } = useKeyData("123")

  return <>{JSON.stringify(data)}</>
}

function Writer() {
  const { create } = XSWR.useXSWR()

  const write = useCallback(async () => {
    const key = create(getKeyDataDesc("123"))
    await key.mutate({ data: { hello: "world " } })
  }, [create])

  return <button onClick={write}>
    Write
  </button>
}