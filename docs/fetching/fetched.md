# Fetched

The `Fetched<D,F>` type is an abstraction for some data or error, along with time metadata `time`, `cooldown`, `expiration`. In fact, it inherits the `Result<T,E>` type from `@hazae41/result`.

This type is defined as

```tsx
export type Fetched<D, F> =
  | Data<D>
  | Fail<F>
```

It's the type returned by fetchers, and it's the type inside states

### Creation

Both variants can be created like

```tsx
new Data<T>(data: T, times: TimesInit = {})
```

```tsx
new Fail<F>(error: T, times: TimesInit = {})
```

Where `TimesInit` is

```tsx
export interface TimesInit {
  readonly time?: number,
  readonly cooldown?: number,
  readonly expiration?: number
}
```

You can also create a `Fetched<D,F>` from a `FetchedInit<D,F>`

```tsx
export type FetchedInit<D, F> =
  | DataInit<D>
  | FailInit<F>

export interface DataInit<T> extends TimesInit {
  readonly data: T
}

export interface FailInit<T> extends TimesInit {
  readonly error: T
}
```

This allows you to do

```tsx
const data = Fetched.from({ data: "hello world" })
```

```tsx
const fail = Fetched.from({ error: new Error() })
```

Which is useful is your API returns something like `{ data: ... }` or `{ error: ... }`

### Usage

Getting the inner data from a Data

```tsx
function get<D>(data: Data<D>): D {
  return data.get()
}
```

Getting the inner error from a Fail

```tsx
function getErr<F>(fail: Fail<D>): F {
  return fail.getErr()
}
```

Getting the inner data or throw

```tsx
function unwrap<D,F>(fetched: Fetched<D,F>): D {
  return fetched.getOrThrow()
}
```

Getting the inner data or nullable

```tsx
function data<D,F>(fetched: Fetched<D,F>): D | undefined {
  return fetched.getOrNull()
}
```

Getting the inner error or nullable

```tsx
function error<D,F>(fetched: Fetched<D,F>): F | undefined {
  return fetched.getErrOrNull()
}
```

Getting the inner data or error

```tsx
function error<D,F>(fetched: Fetched<D,F>): D | F {
  return fetched.getAny()
}
```

Type-guarding if data

```tsx
function f<D,F>(fetched: Fetched<D,F>): D | F {
  if (fetched.isOk())
    return fetched.get()
  else
    return fetched.getErr()
}
```

Type-guarding if error

```tsx
function f<D,F>(fetched: Fetched<D,F>): D | F {
  if (fetched.isErr())
    return fetched.getErr()
  else
    return fetched.get()
}
```

And various other useful function!