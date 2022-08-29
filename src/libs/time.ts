export function getTimeFromDelay(delay: number) {
  if (delay === -1) return -1
  return Date.now() + delay
}