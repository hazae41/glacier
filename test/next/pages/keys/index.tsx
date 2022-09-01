import { XSWR } from "@hazae41/xswr"
import { useState } from "react"

async function fetchAsJson<T>([url, id]: any[], more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(`${url}?id=${id}`, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T

  return { data }
}

function getKeySchema(id: number) {
  return XSWR.single<unknown>(["/api/keys", id], fetchAsJson)
}

function useKey(id: number) {
  const handle = XSWR.use(getKeySchema, [id])

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const key0 = useKey(0)
  const key1 = useKey(1)
  const key2 = useKey(2)
  const key3 = useKey(3)

  const [time, setTime] = useState(Date.now())

  const keyTime = useKey(time)

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