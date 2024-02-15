# Fetched

The `Fetched<D,F>` type is an abstraction for some data or error, along with time metadata `time`, `cooldown`, `expiration`. In fact, it inherits the `Result<T,E>` type from `@hazae41/result`, which is the best result library for TypeScript.

This type is defined as

```tsx
export type Fetched<D, F> =
  | Data<D>
  | Fail<F>
```

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