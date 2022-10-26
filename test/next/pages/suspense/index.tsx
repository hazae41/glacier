import { getSingleSchema, useFetch, useQuery } from "@hazae41/xswr"
import { Suspense, useEffect, useState } from "react"
import { fetchAsJson } from "../../common/fetcher"

function getHelloSchema() {
  return getSingleSchema("/api/hello", fetchAsJson)
}

function useHelloData() {
  const handle = useQuery(getHelloSchema, [])

  useFetch(handle)
  return handle
}

function Child() {
  const hello = useHelloData()

  // Suspend until next state change
  if (!hello.data) throw hello.suspend()

  return <div>
    Child: {JSON.stringify(hello.data)}
  </div>
}

function Parent() {
  const hello = useHelloData()

  // Suspend until next state change
  if (!hello.data) throw hello.suspend()

  return <div>
    Parent: {JSON.stringify(hello.data)}
    <Suspense fallback={<div>Child loading...</div>}>
      <Child />
    </Suspense>
  </div>
}

export default function Page() {
  const [client, setClient] = useState(false)
  useEffect(() => setClient(true), [])
  if (!client) return <>SSR</>

  return <div>
    <Suspense fallback={<div>Loading...</div>}>
      <Parent />
    </Suspense>
    <Suspense fallback={<div>Loading...</div>}>
      <Parent />
    </Suspense>
  </div>
}