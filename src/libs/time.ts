export function getTimeFromDelay(delay: number) {
  if (delay === -1) return
  return Date.now() + delay
}