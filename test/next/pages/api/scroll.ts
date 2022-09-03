import type { NextApiRequest, NextApiResponse } from 'next'

const start = 123

const data: Record<string, any> = {
  "0": {
    data: [1, 2, 3, 4, 5].map(x => x + start),
    after: "1646161"
  },
  "1646161": {
    data: [6, 7, 8, 9, 10].map(x => x + start),
    after: "96416115"
  },
  "96416115": {
    data: [11, 12, 13, 14, 15].map(x => x + start),
    after: "2910619060"
  },
  "2910619060": {
    data: [16, 17, 18, 19, 20].map(x => x + start),
    after: undefined
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise(ok => setTimeout(ok, 1000))

  // return res.status(400).json({ message: "An error occured" })

  const after = String(req.query.after ?? 0)
  return res.status(200).json(data[after])
}
