export namespace Time {

  export function fromDelay(delay: number) {
    if (delay === -1) return
    return Date.now() + delay
  }

}