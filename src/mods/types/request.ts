export class JsonableRequest extends Request {

  #headers: Record<string, string>

  #body: string

  private constructor(input: RequestInfo, init: RequestInit = {}, headers: Record<string, string>, body: string) {
    super(input, init)

    this.#headers = headers

    this.#body = body
  }

  static async from(input: RequestInfo, init: RequestInit = {}) {
    const dummy = new Request(input, init)

    const headers: Record<string, string> = {}
    dummy.headers.forEach((value, key) => headers[key] = value)

    const body = await dummy.text()

    return new JsonableRequest(input, init, headers, body)
  }

  get headersAsJson() {
    return this.#headers
  }

  get bodyAsText() {
    return this.#body
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