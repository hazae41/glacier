# Query

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

