import { Promiseable } from "libs/promises/promises.js"

export interface SyncEncoder<T> {
  stringify(value: T): string
}

export interface AsyncEncoder<T> {
  stringify(value: T): Promiseable<string>
}

export interface SyncCoder<T> {
  stringify(value: T): string
  parse(text: string): T
}

export interface AsyncCoder<T> {
  stringify(value: T): Promiseable<string>
  parse(text: string): Promiseable<T>
}