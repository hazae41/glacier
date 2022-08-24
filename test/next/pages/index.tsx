import { XSWR } from "@hazae41/xswr"
import { useCallback } from "react"

export interface HelloData {
	name: string,
	time: number
}

function useHelloData() {
	const poster = useCallback(async (url: string, data?: HelloData) => {
		const method = data ? "POST" : "GET"
		const body = data ? JSON.stringify(data) : undefined
		const res = await fetch(url, { method, body })
		if (!res.ok) throw new Error(await res.text())
		return await res.json()
	}, [])

	const handle = XSWR.useSingle("/api/hello", poster)
	XSWR.useFetch(handle)
	return handle
}

export default function Home() {
	const hello = useHelloData()

	const onRefreshClick = useCallback(() => {
		hello.refetch()
	}, [])

	const onUpdateClick = useCallback(() => {
		hello.update({ name: "John Smith", time: new Date().getSeconds() })
			.catch(alert)
	}, [])

	return <>
		<div>
			{JSON.stringify(hello.data)}
		</div>
		<div style={{ color: "red" }}>
			{JSON.stringify(hello.error)}
		</div>
		<div>
			{hello.loading && "Loading..."}
		</div>
		<button onClick={onRefreshClick}>
			Refresh
		</button>
		<button onClick={onUpdateClick}>
			Update
		</button>
	</>
}

