import { XSWR } from "@hazae41/xswr"
import { useState } from "react"

async function fetchAsJson<T>([url, id]: any, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(`${url}?id=${id}`, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T

  return { data }
}

function useKeyData(id: number) {
  const handle = XSWR.useSingle(
    id > 0 ? ["/api/keys", id] : undefined,
    fetchAsJson)

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const key0 = useKeyData(0)
  const key1 = useKeyData(1)
  const key2 = useKeyData(2)
  const key3 = useKeyData(3)

  const [time, setTime] = useState(Date.now())

  const keyTime = useKeyData(time)

  return <>
    <div>
      {JSON.stringify(key0.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(key1.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(key2.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(key3.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(keyTime.data) ?? "undefined"}
    </div>
    <button onClick={() => setTime(Date.now())}>
      Render
    </button>
  </>
}