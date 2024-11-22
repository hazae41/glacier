import { assert } from "@hazae41/phobos";
import { JsonRequest, TextRequest } from "./index.js";

{
  const body = "hello world"
  const request = new TextRequest("https://example.com", { method: "POST", body })

  console.log(request.toJSON()) // { url: "https://example.com", method: "POST", headers: {"content-type":"text/plain;charset=UTF-8"}, body: "hello world" }

  function fetch(request: TextRequest) {
    assert(request.bodyAsText === body)
  }

  fetch(request)

  {
    const request2 = await TextRequest.from(request.toJSON())

    assert(request2.bodyAsText === request.bodyAsText)
    assert(JSON.stringify(request2) === JSON.stringify(request))
  }
}

{
  const body = { method: "eth_call" } as const
  const request = new JsonRequest("https://example.com", { method: "POST", body })

  console.log(request.toJSON()) // { url: "https://example.com", method: "POST", headers: {"content-type":"application/json"}, body: "{\"foo\":\"bar\"}" }

  function fetch(request: JsonRequest<{ method: string }>) {
    assert(JSON.stringify(request.bodyAsJson) === JSON.stringify(body))
  }

  fetch(request)

  {
    const request2 = await JsonRequest.from(request.toJSON())

    assert(request2.bodyAsText === request.bodyAsText)
    assert(JSON.stringify(request2.bodyAsJson) === JSON.stringify(request.bodyAsJson))
    assert(JSON.stringify(request2) === JSON.stringify(request))
  }

  {
    // const x: JsonRequest<123> = undefined as any
    // const y: JsonRequest<string> = undefined as any
    // const z: Request = undefined as any

    // JsonRequest.from<string>(x)
    // JsonRequest.from<string>(y)
    // JsonRequest.from<string>(z)
  }
}



