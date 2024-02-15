# Fetched

The `Fetched<D,F>` type is an abstraction for some data or error, along with time metadata `time`, `cooldown`, `expiration`. In fact, it inherits the `Result<T,E>` type from `@hazae41/result`.

This type is defined as

```tsx
export type Fetched<D, F> =
  | Data<D>
  | Fail<F>
```

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
  return fetched.unwrap()
}
```

Getting the inner data or undefined

```tsx
function data<D,F>(fetched: Fetched<D,F>): D | undefined {
  return fetched.ok().get()
}
```

Getting the inner error or undefined

```tsx
function error<D,F>(fetched: Fetched<D,F>): F | undefined {
  return fetched.err().get()
}
```

Getting the inner data or error

```tsx
function error<D,F>(fetched: Fetched<D,F>): D | F {
  return fetched.inner
}
```

Type-guarding if data

```tsx
function f<D,F>(fetched: Fetched<D,F>): D | F {
  if (fetched.isData())
    return fetched.get()
  else
    return fetched.getErr()
}
```

Type-guarding if error

```tsx
function f<D,F>(fetched: Fetched<D,F>): D | F {
  if (fetched.isFail())
    return fetched.getErr()
  else
    return fetched.get()
}
```

And various other useful function!