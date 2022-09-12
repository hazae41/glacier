import { XSWR } from "@hazae41/xswr"
import { Suspense, useEffect, useState } from "react"
import { fetchAsJson } from "../../libs/fetcher"

function getHelloSchema() {
  return XSWR.single("/api/hello", fetchAsJson)
}

function useHelloData() {
  const handle = XSWR.use(getHelloSchema, [])

  XSWR.useFetch(handle)
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