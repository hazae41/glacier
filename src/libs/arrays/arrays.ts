export namespace Arrays {

  export function tryLast<T>(array?: T[]) {
    if (array) return last(array)
  }

  export function last<T>(array: T[]) {
    return array[array.length - 1]
  }

}