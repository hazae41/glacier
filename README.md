# hazae41's xswr

The simplest React data (re)fetching library ever made

```bash
npm i @hazae41/xswr
```

## [Go to the docs](https://xswr.hazae41.me)

## Philosophy

XSWR is very inspired from SWR (which stands for "Stale While Revalidate").

In fact, it's a side project I made to fill in the gaps of SWR, that ended up production-ready.

XSWR uses two new approaches compared to other data fetching libraries like swr or react-query:
1) Encapsulating key, fetcher and resource type in a single abstraction called "handle".
2) Composing features with very simple hooks instead of having bloated configuration patterns and unexpected behaviours.

By using these two approaches, XSWR aims to help you highly [centralize and reuse things](https://xswr.hazae41.me/patterns/centralization).

### [Comparison with swr and react-query](https://xswr.hazae41.me/faq/comparison)

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
- Per-query persistence

### Upcoming features

- Transport agnostic streaming (ethers.js, WebSockets, Socket.io)
- Store normalization
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
  const data = await res.json() as T
  return { data }
}
```

Then create your hook using `useSingle` (or `useScroll`) and some other hooks you like

```typescript
function useMyData() {
  const handle = XSWR.useSingle<MyData>(`/api/data`, fetchAsJson)
  
  XSWR.useFetch(handle) // Fetch on mount and on url change
  XSWR.useVisible(handle) // Fetch when the page becomes visible
  XSWR.useOnline(handle) // Fetch when the browser becomes online
  return handle
}
```

Now you can use it in your component

```typescript
function MyApp() {
  const { data, error } = useMyData()

  if (error)
    return <MyError error={error} />
  if (!data)
    return <MyLoading />
  return <MyPage data={data} />
}
```

## [Go to the docs](https://xswr.hazae41.me)