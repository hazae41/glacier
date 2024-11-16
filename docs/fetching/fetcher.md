# Fetcher

A `Fetcher<D,F>` is function that takes some arbitrary key `K` with some params and resolves to a `Fetched<D,F>` or `FetchedInit<D,F>`

```tsx
export type Fetcher<K, D, F> = (key: K, init: RequestInit) => Awaitable<FetchedInit<D, F>>
```

### RequestInit

We only use `signal` and `cache`

```tsx
export interface RequestInit {
  readonly signal?: AbortSignal,
  readonly cache?: "reload"
}
```

This means you can use `RequestInit` as `init` in `fetch(input: string | URL | Request, init?: RequestInit | undefined)`

You can use `RequestInit` if your fetcher uses `fetch()` under the hood, that's what we will see in the next example

### Example

Here `fetchAsJsonOrFail` is a `Fetcher<string | URL | Request, T, Error>` and uses `fetch()`


```tsx
export async function fetchAsJsonOrFail<T>(input: string | URL | Request, init: RequestInit): Promise<Fetched<T, Error>> {
  try {
    const res = await input(url, init)
  
    if (!res.ok) 
      return new Fail(new Error(await res.text()))
  
    return new Data(await res.json() as T)
  } catch (cause: unknown) {
    return new Fail(new Error("Could not fetch", { cause }))
  }
}
```

Note that any thrown error in your fetcher will be thrown to the caller and won't end up in `Fail<F>`

This fetcher can be used in any schema whose `K` is `string`, `URL`, or `Request`

```tsx
createQuery({ key: "/api/hello", fetcher: fetchAsJsonOrFail })
```

```tsx
createQuery({ key: new URL(...), fetcher: fetchAsJsonOrFail })
```

```tsx
createQuery({ key: new Request(...), fetcher: fetchAsJsonOrFail })
```

If you don't use `fetch()` under the hood or use custom `K`, anything that takes a `K` and returns a `Fetched<D,F>` will work 

```tsx
export namespace eth_getBalance {

  export type K = RpcRequestPreinit<unknown>
  export type D = ZeroHexString
  export type F = Error

  export function keyOf(address: ZeroHexString): K {
    return {
      method: "eth_getBalance",
      params: [address, "pending"]
    }
  }

  export function fetchOrFail(request: K): Promise<Fetched<D,F>> {
    try {
      return new Data(await fetchRpcOrThrow(request))
    } catch (cause: unknown) {
      return new Fail(new Error("Could not fetch", { cause }))
    }
  }

  export function schema(address: ZeroHexString) {
    return createQuery<K, D, F>({ key: keyOf(address), fetcher: fetchOrFail })
  }

}
```