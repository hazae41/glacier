import { Promiseable } from "libs/promises/promises.js"

export interface SyncEncoder<T = unknown> {
  stringify(value: T): string
}

export interface AsyncEncoder<T = unknown> {
  stringify(value: T): Promiseable<string>
}

export interface SyncCoder<T = unknown> {
  stringify(value: T): string
  parse(text: string): T
}

export interface AsyncCoder<T = unknown> {
  stringify(value: T): Promiseable<string>
  parse(text: string): Promiseable<T>
}