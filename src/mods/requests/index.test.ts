import { JsonRequest, TextRequest } from "./index.js";

console.log(new TextRequest("https://example.com", { method: "POST", body: "foo" }).toJSON())
console.log(new JsonRequest("https://example.com", { method: "POST", body: { foo: "bar" } }).toJSON())
