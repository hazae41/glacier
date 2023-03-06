export namespace Time {

  export function fromDelay(delay: number) {
    if (delay < 0)
      return

    return Date.now() + delay
  }

}