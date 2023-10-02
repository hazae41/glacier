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
- No external dependency
- Composition-based hooks
- Very easy learning curve
- Not over-engineered
- No unexpected behavior 
- Transport agnostic (REST, GraphQL, WebSocket)
- Storage agnostic (IndexedDB, localStorage)
- Works in a Service Worker too
- Per-query persistent storage
- Encrypted and hashed storage
- Gargage collected storage
- Store normalization and indexes
- Easy SSR & ISR support
- Concurrent and multi-step optimistic states
- Request deduplication, cooldown, timeout, cancellation, expiration, and retrying
- Automatic refetching based on various signals
- Page-based and cursor-based pagination
- Super natural React Suspense
- React Native support

### [Upcoming features](https://github.com/sponsors/hazae41)

- 
- Transport agnostic streaming


