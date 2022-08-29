export interface Serializer<T = any> {
  stringify<T>(value: T): string
  parse(text: string): T
}