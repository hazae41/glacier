# useQuery

You can reactify any schema into a `ReactQuery<K,D,F>` with `useQuery(schema, [...params])`

```tsx
function useHello() {
  return useQuery(Hello.schema, [])
}
```

You can use parameters too and they will be used to memoize the query

```tsx
export namespace eth_getBalance {

  export type K = ...
  export type D = ...
  export type F = ...

  export function schema(address: ZeroHexString) {
    /**
     * This will be run every time `address` changes
     */

    return createQuery<K, D, F>({ ... })
  }

}

function useBalance(address: ZeroHexString) {
  return useQuery(eth_getBalance.schema, [address])
}
```

You can attach hooks to that query

```tsx
function useHello() {
  const query = useQuery(Hello.schema, [])
  useFetch(query) // Fetch on mount and key change 
  return query
}
```

Once you have a query, you can then get data `Data<D>` and error `Fail<F>`

```tsx
function MyApp() {
  const { data, error } = useHello()

  if (error != null)
    return <MyError error={error} />
  if (data != null)
    return <MyPage data={data} />
  return <MyLoading />
}
```

Note that `data` is **sticky**, this means it's not reset to `undefined` when a fetch fails

On the other hand, `error` is **not sticky**, it will reset to `undefined` when a fetch succeed

So you should always check `erorr` first!

You can also use `current` if you prefer a `Fetched<D,F>` without any stickyness

```tsx
function MyApp() {
  const { current } = useHello()

  if (current == null)
    return <MyLoading />
  if (current.isFail())
    return <MyError error={current} />
  return <MyPage data={data} />
}
```

You can also get data and error from current to avoid stickyness

```tsx
function MyApp() {
  const { current } = useHello()
  const data = current.ok().get()
  const error = current.err().get()

  if (error != null)
    return <MyError error={error} />
  if (data != null)
    return <MyPage data={data} />
  return <MyLoading />
}
```

### Methods

You can use `refetch` to forcefully refetch something and bypass any cooldown (e.g. user action)

```tsx
function MyApp() {
  const { refetch } = useHello()

  const onClick = useCallback(() => {
    /**
     * This will fetch by bypassing cooldown and by replacing any pending fetch
     */
    refetch()
  }, [refetch])

  return <button onClick={onClick}>
    Click me to force refresh
  </button>
}
```

Or you can use `fetch` to just fetch with cooldown (e.g. some event happened)

```tsx
function MyApp() {
  const { fetch } = useHello()

  const onEvent = useCallback(() => {
    fetch()
  }, [fetch])

  useEffect(() => {
    addEventListener("...", onEvent)
    return () => removeEventListener("...", onEvent)
  }, [fetch])

  return <button onClick={onClick}>
    Click me to force refresh
  </button>
}
```