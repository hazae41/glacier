import type { NextApiRequest, NextApiResponse } from 'next'
import { HelloData } from '../../types/hello'

const config = {
  rollback: false
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HelloData>
) {
  await new Promise(ok => setTimeout(ok, 1000))

  if (req.method === "GET")
    res.status(200).json({ name: "John Doe", time: new Date().getSeconds() })
  else if (req.method === "POST" && config.rollback)
    res.status(400).end()
  else if (req.method === "POST" && !config.rollback)
    res.status(200).json({ name: "John Smith", time: new Date().getSeconds() })
}
