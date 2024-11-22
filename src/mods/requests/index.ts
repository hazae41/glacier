export interface RequestLike extends RequestInit {
  url: string
  destination: RequestDestination
}

export interface TextRequestInit extends Omit<RequestInit, "body"> {
  body: string
}

export namespace TextRequest {

  /**
   * Hack to only allow TextRequest or Request-like but not any other variant
   */
  export interface From extends RequestLike {
    bodyAsText?: string
    bodyAsJson?: undefined
  }

}

export class TextRequest extends Request {

  #headers: Record<string, string> = {}

  #bodyAsText: string

  constructor(input: RequestInfo, init: TextRequestInit) {
    super(input, init)

    this.headers.forEach((value, key) => this.#headers[key] = value)

    this.#bodyAsText = init.body
  }

  static async from(from: TextRequest.From): Promise<TextRequest> {
    if (from instanceof TextRequest)
      return from

    const request = new Request(from.url, from)

    const body = await request.text()

    return new TextRequest(request, { body })
  }

  get headersAsJson(): Record<string, string> {
    return this.#headers
  }

  get bodyAsText(): string {
    return this.#bodyAsText
  }

  toJSON(): RequestLike {
    return {
      url: this.url,
      method: this.method,
      headers: this.headersAsJson,
      body: this.bodyAsText,
      keepalive: this.keepalive,
      cache: this.cache,
      credentials: this.credentials,
      destination: this.destination,
      integrity: this.integrity,
      mode: this.mode,
      redirect: this.redirect,
      referrerPolicy: this.referrerPolicy,
    } as const
  }

}

export interface JsonRequestInit<T> extends Omit<RequestInit, "body"> {
  body: T
}

export namespace JsonRequest {

  /**
   * Hack to only allow JsonRequest<T> or Request-like but not any other variant or other T
   */
  export interface From<T> extends RequestLike {
    bodyAsText?: string
    bodyAsJson?: T
  }

}

export class JsonRequest<T> extends Request {

  #headers: Record<string, string> = {}

  #bodyAsJson: T
  #bodyAsText: string

  constructor(input: RequestInfo, init: JsonRequestInit<T>) {
    const body = JSON.stringify(init.body)

    super(input, { ...init, body })

    if (!this.headers.get("Content-Type")?.includes("application/json"))
      this.headers.set("Content-Type", "application/json")

    this.headers.forEach((value, key) => this.#headers[key] = value)

    this.#bodyAsJson = init.body
    this.#bodyAsText = body
  }

  static async from<T>(from: JsonRequest.From<T>): Promise<JsonRequest<T>> {
    if (from instanceof JsonRequest)
      return from

    const request = new Request(from.url, from)

    const body = await request.json() as T

    return new JsonRequest<T>(request, { body })
  }

  get headersAsJson(): Record<string, string> {
    return this.#headers
  }

  get bodyAsJson(): T {
    return this.#bodyAsJson
  }

  get bodyAsText(): string {
    return this.#bodyAsText
  }

  toJSON(): RequestLike {
    return {
      url: this.url,
      method: this.method,
      headers: this.headersAsJson,
      body: this.bodyAsText,
      keepalive: this.keepalive,
      cache: this.cache,
      credentials: this.credentials,
      destination: this.destination,
      integrity: this.integrity,
      mode: this.mode,
      redirect: this.redirect,
      referrerPolicy: this.referrerPolicy
    } as const
  }

}