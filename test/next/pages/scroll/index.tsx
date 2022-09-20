import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"
import { fetchAsJson } from "../../libs/fetcher"

export interface RefPage {
  data: Ref[],
  after?: string
}

export interface DataPage {
  data: Data[],
  after?: string
}

export interface Ref {
  ref: true,
  id: string
}

export interface Data {
  id: string,
  value: number
}

function getScrollsSchema() {
  return XSWR.scroll<DataPage | RefPage>((previous) => {
    if (!previous)
      return `/api/scroll`
    if (!previous.after)
      return undefined
    return `/api/scroll?after=${previous.after}`
  }, fetchAsJson)
}

function useScrollsData() {
  const handle = XSWR.use(getScrollsSchema, [])

  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const scrolls = useScrollsData()

  const { data, error, loading, refetch, scroll, aborter } = scrolls

  const onRefreshClick = useCallback(() => {
    refetch()
  }, [refetch])

  const onScrollClick = useCallback(() => {
    scroll()
  }, [scroll])

  const onAbortClick = useCallback(() => {
    aborter!.abort("dd")
  }, [aborter])

  return <>
    {(() => {
      if (!data)
        return <div>Empty</div>
      return data.map((page, i) => <div key={i}>
        <div>page {i}</div>
        {page.data.map(element =>
          <div key={element.id}>{element.id}</div>)}
      </div>)
    })()}
    <div style={{ color: "red" }}>
      {error instanceof Error
        ? error.message
        : JSON.stringify(error)}
    </div>
    <div>
      {loading && "Loading..."}
    </div>
    <button onClick={onRefreshClick}>
      Refresh
    </button>
    <button onClick={onScrollClick}>
      Scroll
    </button>
    {aborter &&
      <button onClick={onAbortClick}>
        Abort
      </button>}
  </>
}

