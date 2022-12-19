<div align="center">
<img width="500" src="https://user-images.githubusercontent.com/4405263/198222057-038c8fdc-a4b0-44c4-8aaf-e4ad1d301b28.png" />
</div>

```bash
npm i @hazae41/xswr
```

[**Read the docs 📚**](https://xswr.hazae41.me) • [**Next.js Example 🪣**](https://codesandbox.io/p/github/hazae41/xswr-example-next) • [**Expo Example 🪣**](https://snack.expo.dev/@git/github.com/hazae41/xswr-example-expo) • [**Comparison with other libs 🌐**](https://xswr.hazae41.me/faq/comparison)

## Philosophy 🧠

xswr uses two new approaches compared to other data fetching libraries like swr or react-query:
1) Encapsulating key+fetcher+params in a single abstraction called schema.
2) Composing features with very simple hooks instead of having bloated configuration and unexpected behaviors.

## Features 🔥

### Current features

- 100% TypeScript and ESM
- Composition-based hooks
- Very easy learning curve
- No dependency except React
- Not over-engineered (hello react-query)
- No unexpected behaviour (hello swr)
- Backend agnostic fetching (REST, GraphQL, WebSocket)
- Storage agnostic caching (new Map(), LocalStorage, IndexedDB)
- Automatic refetching
- Dependent and conditional queries
- Request deduplication, cooldown, timeout, and expiration
- Page-based and cursor-based pagination
- Exponential backoff retry
- SSR & ISR support
- Optimistic mutations
- Cancellable requests
- Automatic cancellation
- Automatic garbage collection
- Per-query persistent storage
- Out of the box IndexedDB and LocalStorage
- Out of the box store normalization
- Super natural React Suspense
- React Native support

### Upcoming features

- Transport agnostic streaming (ethers.js, WebSockets, Socket.io)
- Bidirectional scrolling

# Installation 🔧

Just install `@hazae41/xswr` using your favorite package manager.

```bash
npm i @hazae41/xswr
```

Then, wrap your app in a `CoreProvider` component.

```tsx
import { CoreProvider } from "@hazae41/xswr"

function MyWrapper() {
  return <CoreProvider>
    <MyAwesomeApp />
  </CoreProvider>
}
```

## Your first mix 🧪

When using xswr and its composition-based hooks, you create a mix and only include the ingredients you want.

We'll do a request at `/api/data` using JSON, display it with a loading, and automatically refetch it.

### Create a fetcher ⚡️

It will just take an url, fetch it, and return the data.

```tsx
async function fetchAsJson<T>(url: string) {
  const res = await fetch(url)
  const data = await res.json() as T
  return { data }
}
```

### Create a mix 🌪

Then create a mix using a query and some blocks.

```tsx
function useHello() {
  const query = useSingleQuery<Hello>(`/api/hello`, fetchAsJson)
  
  useFetch(query) // Fetch on mount and on url change
  useVisible(query) // Fetch when the page becomes visible
  useOnline(query) // Fetch when the browser becomes online

  return query
}
```

### Use it in your components 🚀

```tsx
function MyApp() {
  const { data, error } = useHello()

  if (error)
    return <MyError error={error} />
  if (!data)
    return <MyLoading />
  return <MyPage data={data} />
}
```

## Advanced example 🗿

Last example was good, but here is the best way to use XSWR.

### Making our fetcher cancellable ⚡️

Our fetcher was good, but this one can be aborted.

```tsx
async function fetchAsJson<T>(url: string, more: FetcherMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error }
  }

  const data = await res.json() as T
  return { data }
}
```

It also returns an error if the request failed.

### Defining schemas 📐

Using schemas may seems boilerplate, but it will save you a lot of time later.

```tsx
function getHelloSchema() {
  return getSingleSchema<Hello>("/api/hello", fetchAsJson)
}
```

It allows you to reuse the same set of key+fetcher+params in multiple places, including imperative code.

### Creating mixtures 🧪

The mixtures pattern allows you to reuse the same group of blocks.

```tsx
function useAutoFetchMixture(query: Query) {
  useFetch(query)
  useVisible(query)
  useOnline(query)
}
```

### Mixing it 🌪

Once you got a schema and a mixture, you just have to mix it.

```tsx
function useHelloMix() {
  const query = useQuery(getHelloSchema, [])
  useAutoFetchMixture(query)
  return query
}
```

### Use it in your app 🚀

```tsx
function MyApp() {
  const { data, error } = useHelloMix()

  if (error)
    return <MyError error={error} />
  if (!data)
    return <MyLoading />
  return <MyPage data={data} />
}
```
