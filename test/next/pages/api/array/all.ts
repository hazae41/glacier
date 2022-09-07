import type { NextApiRequest, NextApiResponse } from 'next'

const data = [
  {
    id: "2916519616",
    name: "John Doe",
  },
  {
    id: "16481366464",
    name: "John Smith"
  },
  {
    id: "19615417497",
    name: "Hello World"
  },
  {
    id: "161118418187",
    name: "Ano Nymous"
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise(ok => setTimeout(ok, 1000))

  // return res.status(400).json({ message: "An error occured" })

  return res.status(200).json(data)
}
