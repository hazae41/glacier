import { XSWR } from "@hazae41/xswr";
import { useCallback } from "react";
import { fetchAsJson } from "../../libs/fetcher";

interface Ref {
  ref: boolean
  id: string
}

interface Data {
  id: string
  name: string
}

function getDataSchema(id: string) {
  return XSWR.single<Data>(`/api/array?id=${id}`, fetchAsJson)
}

async function getDataRef(data: Data | Ref, more: XSWR.NormalizerMore) {
  if ("ref" in data) return data
  const schema = getDataSchema(data.id)
  await schema.normalize(data, more)
  return { ref: true, id: data.id }
}

function getAllDataSchema() {
  async function normalizer(data: (Data | Ref)[], more: XSWR.NormalizerMore) {
    return await Promise.all(data.map(data => getDataRef(data, more)))
  }

  return XSWR.single<(Data | Ref)[]>(
    `/api/array/all`,
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
    {data?.map(ref =>
      <Element
        key={ref.id}
        id={ref.id} />)}
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
