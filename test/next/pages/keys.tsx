import { XSWR } from "@hazae41/xswr"
import { useMemo, useState } from "react"
import { HelloData } from "../common/hello"

async function fetchAsJson<T>([url, id]: [string, number], more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(`${url}?id=${id}`, { signal })
  if (!res.ok) throw new Error(await res.text())

  return { data: await res.json() }
}

function useHelloData(id: number) {
  const key = useMemo(() => {
    if (id) return ["/api/keys", id]
  }, [id])

  const handle = XSWR.useSingle<HelloData>(
    key,
    fetchAsJson,
    1000,
    5000)
  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const hello0 = useHelloData(0)
  const hello1 = useHelloData(1)
  const hello2 = useHelloData(2)
  const hello3 = useHelloData(3)

  const [time, setTime] = useState(Date.now())

  const helloTime = useHelloData(time)

  return <>
    <div>
      {JSON.stringify(hello0.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(hello1.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(hello2.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(hello3.data) ?? "undefined"}
    </div>
    <div>
      {JSON.stringify(helloTime.data) ?? "undefined"}
    </div>
    <button onClick={() => setTime(Date.now())}>
      Render
    </button>
  </>
}