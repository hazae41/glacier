export interface TextRequestInit extends Omit<RequestInit, "body"> {
  body: string
}

export namespace TextRequest {

  /**
   * Hack to only allow TextRequest or regular Request but not any other variant
   */
  export interface From extends Request {
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

  static async from(request: TextRequest.From): Promise<TextRequest> {
    if (request instanceof TextRequest)
      return request

    const body = await request.text()

    return new TextRequest(request, { body })
  }

  get headersAsJson(): Record<string, string> {
    return this.#headers
  }

  get bodyAsText(): string {
    return this.#bodyAsText
  }

  toJSON() {
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
    }
  }

}

export interface JsonRequestInit<T> extends Omit<RequestInit, "body"> {
  body: T
}

export namespace JsonRequest {

  /**
   * Hack to only allow JsonRequest<T> or regular Request but not any other variant or other T
   */
  export interface From<T> extends Request {
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

  static async from<T>(request: JsonRequest.From<T>): Promise<JsonRequest<T>> {
    if (request instanceof JsonRequest)
      return request

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

  toJSON() {
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
    }
  }

}