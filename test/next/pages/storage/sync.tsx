import { XSWR } from "@hazae41/xswr";
import { HelloData } from "../../common/hello";

export default function Wrapper() {
  const storage = XSWR.useAsyncLocalStorage()

  return <XSWR.CoreProvider
    storage={storage}>
    <Page />
  </XSWR.CoreProvider>
}

async function fetchAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  return { data, cooldown, expiration }
}

function useHelloData() {
  const handle = XSWR.useSingle<HelloData>("/api/hello", fetchAsJson)

  XSWR.useDebug(handle, "hello")
  XSWR.useFetch(handle)
  return handle
}

export function Page() {
  const { data, fetch, clear } = useHelloData()

  return <>
    <div>
      {JSON.stringify(data) ?? "undefined"}
    </div>
    <button onClick={() => fetch()}>
      Fetch
    </button>
    <button onClick={() => clear()}>
      Delete
    </button>
  </>
}