import { Promiseable } from "libs/promises/promises.js"

export interface SyncStringSerializer<T = unknown> {
  stringify(value: T): string
  serialize?(value: T): string
  parse(text: string): T
}

export interface AsyncStringSerializer<T = unknown> {
  stringify(value: T): Promiseable<string>
  serialize?(value: T): Promiseable<string>
  parse(text: string): Promiseable<T>
}

export interface AsyncSerializer<T = unknown, S = unknown> {
  serialize(value: T): Promiseable<S>
  parse(text: S): Promiseable<T>
}