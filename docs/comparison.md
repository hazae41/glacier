# Comparison with other libs

## Configuration

#### Glacier

None :)

#### SWR

Not required

#### React-Query

```tsx
const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}
```

## Prefetching

#### Glacier

```tsx
user.tryFetch()
```

#### SWR

```tsx
mutate('/api/user', fetch('/api/user').then(res => res.json()))
```

#### React-Query

```tsx
await queryClient.prefetchQuery(['user'], fetchUser)
```

## Optimistic updates

#### Glacier

Can use yield to represent fine-grained steps

```tsx
document.update(async function* () {
  yield () => ({ data: "My optimistic document" })
  await new Promise(ok => setTimeout(ok, 1000))
  yield () => ({ data: "My optimistic document 2" })
  return await postAsJson("/api/edit", "My real document")
})
```

Can run multiple optimistic updates at the same time, in parallel

```tsx
function onTitleChange(title: string) {
  document.update(async function* () {
    yield (previous) => ({ data: { ...previous.data, title } })
    return await postAsJson("/api/edit", { title })
  })
}
```

```tsx
function onContentChange(content: string) {
  document.update(async function* () {
    yield (previous) => ({ data: { ...previous.data, content } })
    return await postAsJson("/api/edit", { content })
  })
}
```

#### SWR

Only support one optimistic state

```tsx
mutate('/api/todos', updateFn(user), { optimisticData: user, rollbackOnError: true })
```

#### React-Query

Manual

```tsx
useMutation(updateTodo, {
  onMutate: async newTodo => {
    await queryClient.cancelQueries(['todos'])
    const previousTodos = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], old => [...old, newTodo])
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
  onSettled: () => {
    queryClient.invalidateQueries(['todos'])
  },
})
```

## Cancellation

#### Glacier

```tsx
user.aborter.abort()
```

#### SWR

Unsupported

#### React-Query

```tsx
queryClient.cancelQueries(['todos'])
```

## Garbage collection

#### Glacier

Global, per-query, and per-fetch expiration time. You can use response headers like `Cache-Control` to set an expiration time

#### SWR

Unsupported

#### React-Query

Global and per-query expiration time. You can only define an expiration time at global scope or query scope

## Persistent storage

#### Glacier

Per-query persistent storage; you can set a query as persistent in its schema
- Out of the box support for IndexedDB and localStorage
- Out of the box encryption using strong parameters
- Automatic garbage collection

#### SWR

No real support; you have to create your own storage or install third party ones

#### React-Query

Global persistent storage; you persist your whole app and define excluded queries using `shouldDehydrateQuery`

## Store normalization

#### Glacier

Out of the box, very simple to use

#### SWR

Unsupported

#### React-Query

Unsupported

## React Suspense

#### Glacier

Super natural and easy. Doesn't enforce any pattern and doesn't require any configuration. Partially compatible with SSR.

```tsx
function Component() {
  const { data, error, suspend } = useData()

  // Throw the error
  if (error) throw error

  // Fetch and suspend until next state change
  if (!data) throw suspend()

  return <div>{JSON.stringify(data)}</div>
}
```

#### SWR

Forces you to use an ErrorBoundary. No control over when to throw and when to suspend. Not compatible with SSR.

#### React-Query

Seems simple at first but you have to use a configuration for it to work like you want. Error cleaning requires even more code.