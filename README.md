# hazae41's xswr

The simplest React data (re)fetching library ever made


```
npm i @hazae41/xswr
```

### Features
- 100% TypeScript
- Backend agnostic (REST, GraphQL, WebSocket)
- Storage agnostic (new Map(), LocalStorage, IndexedDB)
- Cursor-based pagination
- Request deduplication
- Optimistic mutations
- Exponential backoff retry
- SSR & ISR support
- Scroll restoration
- Composition-based hooks
- Very easy learning curve
- Not overly engineered (hello react-query)
- No unexpected or weird behaviour (hello swr)

### Your first sandw.. xswr hook

When using xswr and its composition-based hooks, you create a sandwich and only include the ingredients you want.

```typescript
async function jsonfetch(url: string) {
	const res = await fetch(url)
	return await res.json()
}

function useMyData() {
	// Just include an url, a fetcher, and a deduplication cooldown
	const handle = XSWR.useSingle(`/api/hello`, jsonfetch, 5000)
	XSWR.useFetch(handle) // Fetch on mount and on url change
	XSWR.useVisible(handle) // Fetch when the page becomes visible
	XSWR.useOnline(handle) // Fetch when the browser becomes online
	return handle
}

function MyApp() {
	const mydata = useMyData()

	if (mydata.error)
		return <>{mydata.error.message}</>
	if (!mydata.data)
		return <>Loading...</>
	return <>{mydata.data}</>
}
```

### Using pagination

TODO

### Using SSR/ISR

TODO