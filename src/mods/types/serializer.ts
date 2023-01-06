export interface Serializer<T = unknown> {
  stringify<T>(value: T): string
  parse(text: string): T
}