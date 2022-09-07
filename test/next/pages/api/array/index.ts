import type { NextApiRequest, NextApiResponse } from 'next'

const data: Record<string, any> = {
  "2916519616": {
    id: "2916519616",
    name: "John Doe",
  },
  "16481366464": {
    id: "16481366464",
    name: "John Smith"
  },
  "19615417497": {
    id: "19615417497",
    name: "Hello World"
  },
  "161118418187": {
    id: "161118418187",
    name: "Ano Nymous"
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise(ok => setTimeout(ok, 1000))

  // return res.status(400).json({ message: "An error occured" })

  const id = req.query.id as string
  return res.status(200).json(data[id])
}
