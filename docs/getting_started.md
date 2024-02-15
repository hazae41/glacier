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
import { Data, Fail } from "@hazae41/glacier"

export async function fetchAsJsonOrFail<T>(input: string | URL | Request, init: RequestInit): Promise<Fetched<T, Error>> {
  try {
    const res = await input(url, init)
  
    if (!res.ok) 
      return new Fail(new Error(await res.text()))
  
    return new Data(await res.json() as T)
  } catch (cause: unknown) {
    return new Fail(new Error("Catched", { cause }))
  }
}
```

## Create a schema 📐

Using schemas may seems boilerplate, but it will save you a lot of time later.

```tsx
import { createQuery } from "@hazae41/glacier"

export interface Hello {
  readonly hello: string
}

export namespace Hello {

  export type K = string
  export type D = Hello
  export type F = Error

  export function schema() {
    return createQuery<K, D, F>({
      key: "/api/hello",
      fetcher: fetchAsJsonOrFail
    })
  }

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
  const query = useQuery(Hello.schema, [])
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
  if (data != null)
    return <MyPage data={data} />
  return <MyLoading />
}
```
