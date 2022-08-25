# hazae41's xswr

The simplest React data (re)fetching library ever made

```bash
npm i @hazae41/xswr
```

## [Go to the docs](https://xswr.hazae41.me)

## [Comparison with swr and react-query](https://xswr.hazae41.me/faq/comparison)

## Features

### Current features

- 100% TypeScript
- Composition-based hooks
- Very easy learning curve
- No dependency except React
- Not over-engineered (hello react-query)
- No unexpected behaviour (hello swr)
- Backend agnostic fetching (REST, GraphQL, WebSocket)
- Storage agnostic caching (new Map(), LocalStorage, IndexedDB)
- Request deduplication
- Exponential backoff retry
- Cursor-based pagination
- Automatic refetching
- Dependent queries
- SSR & ISR support
- Optimistic mutations
- Cancellable requests
- Automatic cancellation 
- Automatic garbage collection

### Upcoming features

- Transport agnostic streaming (ethers.js, WebSockets, Socket.io)
- Bidirectional scrolling
- React suspense

## Preparing your app

You just have to wrap your app in a `XSWR.CoreProvider` component.

```typescript
function MyWrapper() {
  return <XSWR.CoreProvider>
    <MyAwesomeApp />
  </XSWR.CoreProvider>
}
```

You can also partition your app using multiple providers and storages.

## Your first sandwich

When using xswr and its composition-based hooks, you create a sandwich and only include the ingredients you want.

This shows a simple and complete way of doing a request on `/api/data` using JSON, display it with a loading, and automatically refetch it.

Create a fetcher for your request

```typescript
async function fetchAsJson<T>(url: string) {
  const res = await fetch(url)
  return { data: await res.json() as T }
}
```

Then create your hook using `useSingle` (or `useScroll`) and some other hooks you like

```typescript
interface MyData {}

function useMyData() {
  // Just pass a unique url/key and a fetcher
  const handle = XSWR.useSingle<MyData>(
    `/api/data`,
    fetchAsJson)

  // Fetch on mount and on url change
  XSWR.useFetch(handle)

  // Fetch when the page becomes visible
  XSWR.useVisible(handle)

  // Fetch when the browser becomes online
  XSWR.useOnline(handle)

  return handle
}
```

Now you can use it in your component

```typescript
function MyApp() {
  const mydata = useMyData()

  if (mydata.error)
    return <MyError error={mydata.error} />
  if (!mydata.data)
    return <MyLoading />
  return <MyPage data={mydata.data} />
}
```

## [Go to the docs](https://xswr.hazae41.me)