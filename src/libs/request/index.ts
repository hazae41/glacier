export function shouldUseCacheIfFresh(cache?: RequestCache) {
  if (cache === "default")
    return true
  if (cache === "reload")
    return false
  if (cache === "no-cache")
    return false
  if (cache === "force-cache")
    return true
  if (cache === "only-if-cached")
    return true
  return true
}

export function shouldUseCacheIfStale(cache?: RequestCache) {
  if (cache === "default")
    return false
  if (cache === "reload")
    return false
  if (cache === "no-cache")
    return false
  if (cache === "force-cache")
    return true
  if (cache === "only-if-cached")
    return true
  return false
}

export function shouldUseNetwork(cache?: RequestCache) {
  if (cache === "default")
    return true
  if (cache === "reload")
    return true
  if (cache === "no-cache")
    return true
  if (cache === "force-cache")
    return true
  if (cache === "only-if-cached")
    return false
  return true
}