<div align="center">
<img src="https://user-images.githubusercontent.com/4405263/269623949-10c3fb8c-c492-4284-b39a-e51132fb27c4.png" />
</div>

```bash
npm i @hazae41/glacier
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/glacier) • [**Read the docs 📚**](https://github.com/hazae41/glacier/tree/master/docs) • [**Next.js Example 🪣**](https://codesandbox.io/p/github/hazae41/xswr-example-next) • [**Expo Example 🪣**](https://snack.expo.dev/@git/github.com/hazae41/xswr-example-expo) • [**Comparison with other libs 🌐**](https://xswr.hazae41.me/faq/comparison)

## Philosophy 🧠

Glacier uses two new approaches compared to other data fetching libraries like swr or react-query:
1) Encapsulating key+fetcher+params in a single abstraction called schema.
2) Composing features with very simple hooks instead of having bloated configuration and unexpected behaviors.

```tsx
function useAutoFetchMixture(query: Query) {
  useFetch(query) // Fetch on mount and url change
  useVisible(query) // Fetch when the page is focused
  useOnline(query) // Fetch when the browser is online
}

function useHelloWithAutoFetch() {
  const query = useQuery(createHelloQuery, [])
  useAutoFetchMixture(query)
  return query
}

function MyApp() {
  const { data, error } = useHelloWithAutoFetch()

  if (error != null)
    return <MyError error={error} />
  if (data == null)
    return <MyLoading />
  return <MyPage data={data} />
}
```

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

### [Upcoming features](https://github.com/sponsors/hazae41)

- Transport agnostic streaming (ethers.js, WebSockets, Socket.io)
- Bidirectional scrolling


