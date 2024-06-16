export class JsonRequest extends Request {

  readonly #body: string
  readonly #headers: JsonHeaders

  private constructor(
    input: RequestInfo,
    init: RequestInit,
    body: string,
    headers: JsonHeaders
  ) {
    super(input, init)

    this.#body = body
    this.#headers = headers
  }

  /**
   * @override
   */
  get headers() {
    return this.#headers
  }

  static async from(request: Request) {
    if (request instanceof JsonRequest)
      return request

    const body = await request.text()
    const headers = JsonHeaders.from(request.headers)

    return new JsonRequest(request, {}, body, headers)
  }

  get bodyAsText() {
    return this.#body
  }

  get headersAsJson() {
    return this.#headers
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

export class JsonHeaders extends Headers {

  constructor(
    init?: HeadersInit
  ) {
    super(init)
  }

  static from(headers: Headers) {
    if (headers instanceof JsonHeaders)
      return headers
    return new JsonHeaders(headers)
  }

  toJSON() {
    const record: Record<string, string> = {}
    this.forEach((value, key) => record[key] = value)
    return record
  }

}