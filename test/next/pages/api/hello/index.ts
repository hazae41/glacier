import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise(ok => setTimeout(ok, 1000))

  // return res.status(400).json({ message: "An error occured" })

  if (req.method === "GET")
    return res.status(200).json({ name: "John Doe" })

  if (req.method === "POST")
    return res.status(200).json({ name: "John Smith" })
}
