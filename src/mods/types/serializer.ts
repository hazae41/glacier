import { Promiseable } from "libs/promises/promises.js"

export interface SyncSerializer<T = unknown> {
  stringify(value: T): string
  parse(text: string): T
}

export interface AsyncSerializer<T = unknown> {
  stringify(value: T): Promiseable<string>
  parse(text: string): Promiseable<T>
}