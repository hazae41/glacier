import { XSWR } from "@hazae41/xswr";

export async function fetchAsJson<T>(url: string, more: XSWR.PosterMore<T>) {
  const { signal } = more

  const res = await fetch(url, { signal })
  const cooldown = Date.now() + (5 * 1000)
  const expiration = Date.now() + (10 * 1000)

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error, cooldown, expiration }
  }

  const data = await res.json() as T
  return { data, cooldown, expiration }
}