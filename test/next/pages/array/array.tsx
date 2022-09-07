import { XSWR } from "@hazae41/xswr";
import { useCallback } from "react";

async function fetchAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error, cooldown, expiration }
  }

  const data = await res.json() as T
  return { data, cooldown, expiration }
}

interface Data {
  id: string
  name: string
}

function getDataSchema(id: string) {
  return XSWR.single<Data>(`/api/normalize/array?id=${id}`, fetchAsJson)
}

function getDataNormal(data: Data) {
  return new XSWR.Normal(data, getDataSchema(data.id), data.id)
}

function getAllDataSchema() {
  function normalizer(data: Data[]) {
    return data.map(getDataNormal)
  }

  return XSWR.single<Data[], Error, string[]>(
    `/api/normalize/array/all`,
    fetchAsJson,
    { normalizer })
}

function useAllData() {
  const handle = XSWR.use(getAllDataSchema, [])
  XSWR.useFetch(handle)
  return handle
}

function useData(id: string) {
  const handle = XSWR.use(getDataSchema, [id])
  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const { data, refetch } = useAllData()

  const onRefetchClick = useCallback(() => {
    refetch()
  }, [refetch])

  console.log("all", data)

  if (!data) return <>Loading...</>

  return <>
    {data?.map(id => <Element key={id} id={id} />)}
    <button onClick={onRefetchClick}>
      Refetch
    </button>
  </>
}

function Element(props: { id: string }) {
  const { data, mutate } = useData(props.id)

  const onMutateClick = useCallback(() => {
    mutate(c => c && ({ data: c.data && { ...c.data, name: "Unde Fined" } }))
  }, [mutate])

  console.log(props.id, data)

  return <div>
    {JSON.stringify(data) ?? "undefined"}
    <button onClick={onMutateClick}>
      Mutate
    </button>
  </div>
}
