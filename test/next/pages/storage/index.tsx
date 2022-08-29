import { XSWR } from "@hazae41/xswr";
import { gunzipSync, gzipSync } from "zlib";
import { HelloData } from "../../common/hello";

class GZIP {
  static stringify(value?: any) {
    const text = JSON.stringify(value)
    const buffer = Buffer.from(text)
    const zbuffer = gzipSync(buffer)
    const ztext = zbuffer.toString("base64")

    return ztext
  }

  static parse(ztext: string) {
    const zbuffer = Buffer.from(ztext, "base64")
    const buffer = gunzipSync(zbuffer)
    const text = buffer.toString()
    const value = JSON.parse(text)

    return value
  }
}

async function fetchAsJson<T>([url]: [string], more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(await res.text())

  const data = await res.json() as T
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  return { data, cooldown, expiration }
}

function useHelloData() {
  const storage = XSWR.useAsyncLocalStorage(GZIP)

  const handle = XSWR.useSingle<HelloData>(
    "/api/hello",
    fetchAsJson,
    { storage })

  XSWR.useDebug(handle, "hello")
  return handle
}

export default function Wrapper() {
  return <XSWR.ParamsProvider
    serializer={GZIP}>
    <Page />
  </XSWR.ParamsProvider>
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