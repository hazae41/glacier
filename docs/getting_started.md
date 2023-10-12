# Getting started 🧪

When using Glacier and its composition-based hooks, you create a mix and only include the ingredients you want.

We'll do a request at `/api/data` using JSON, display it with a loading, and automatically refetch it.

## Installation 🔧

Just install `@hazae41/glacier` using your favorite package manager.

```bash
npm i @hazae41/glacier
```

## Create a fetcher ⚡️

It will just take an url, fetch it with the given signal, and return the data or error

```tsx
import { Result } from "@hazae41/result"
import { Data, Fail } from "@hazae41/glacier"

export async function tryFetchAsJson<T>(url: string, init: RequestInit) {
  return await Result.runAndDoubleWrap(async () => {
    const { signal } = init

    const res = await fetch(url, { signal })

    if (!res.ok) 
      return new Fail(new Error(await res.text()))

    return new Data(await res.json() as T)
  })
}
```

## Create a schema 📐

Using schemas may seems boilerplate, but it will save you a lot of time later.

```tsx
import { createQuery } from "@hazae41/glacier"

export interface Hello {
  hello: string
}

export function createHelloQuery() {
  return createQuery({
    key: "/api/hello",
    fetcher: tryFetchAsJson
  })
}
```

## Create a mixture 🧪

The mixtures pattern allows you to reuse the same group of blocks.

```tsx
function useAutoFetchMixture(query: Query) {
  useFetch(query) // Fetch on mount and url change
  useVisible(query) // Fetch when the page is focused
  useOnline(query) // Fetch when the browser is online
}
```

## Mix it 🌪

Once you got a schema and a mixture, you just have to mix it.

```tsx
function useHelloWithAutoFetch() {
  const query = useQuery(createHelloQuery, [])
  useAutoFetchMixture(query)
  return query
}
```

### Use it in your app 🚀

```tsx
function MyApp() {
  const { data, error } = useHelloWithAutoFetch()

  if (error != null)
    return <MyError error={error} />
  if (data == null)
    return <MyLoading />
  return <MyPage data={data} />
}
```