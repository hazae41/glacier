import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await new Promise(ok => setTimeout(ok, 1000))

  if (req.method === "GET")
    res.status(200).json(req.query)
  else
    res.status(401).end()
}
