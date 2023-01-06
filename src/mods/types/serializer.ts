export interface Serializer<T = unknown> {
  stringify(value: T): string
  parse(text: string): T
}