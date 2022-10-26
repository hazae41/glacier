import { getSingleSchema, useFetch, useQuery } from "@hazae41/xswr"
import { useState } from "react"
import { fetchAsJson } from "../../common/fetcher"

function getKeySchema(id: number) {
  return getSingleSchema<unknown>(`/api/query?id=${id}`, fetchAsJson)
}

function useKey(id: number) {
  const handle = useQuery(getKeySchema, [id])

  useFetch(handle)
  return handle
}

export default function Page() {
  const key0 = useKey(0)
  const key1 = useKey(1)
  const key2 = useKey(2)
  const key3 = useKey(3)

  const [time, setTime] = useState(Date.now())

  const keyTime = useKey(time)

  console.log(keyTime)

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