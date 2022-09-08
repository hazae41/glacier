import { XSWR } from "@hazae41/xswr";
import { gunzipSync, gzipSync } from "zlib";
import { fetchAsJson } from "../../libs/fetcher";

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

function getHelloSchema(storage?: XSWR.Storage) {
  return XSWR.single("/api/hello?stored", fetchAsJson, { storage })
}

function useStoredHello() {
  const storage = XSWR.useAsyncLocalStorage("cache")
  const handle = XSWR.use(getHelloSchema, [storage])

  XSWR.useDebug(handle, "hello")
  return handle
}

function Page() {
  const { data, fetch, clear } = useStoredHello()

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

export default function Wrapper() {
  return <XSWR.ParamsProvider
    serializer={GZIP}>
    <Page />
  </XSWR.ParamsProvider>
}