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
  const core = XSWR.useCore()
  const params = XSWR.useParams()

  const write = useCallback(async () => {
    const key = getKeyDataDesc("123").create(core, params)
    await key.mutate({ data: { hello: "world " } })
  }, [core, params])

  return <button onClick={write}>
    Write
  </button>
}