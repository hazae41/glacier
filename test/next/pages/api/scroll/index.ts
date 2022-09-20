import type { NextApiRequest, NextApiResponse } from 'next'

const start = 123

interface ElementPage {
  data: ElementData[],
  after?: string
}

interface ElementData {
  id: string,
  value: number
}

function generate(value: number) {
  return { id: String(value + start), value } as ElementData
}

const data: Record<string, ElementPage> = {
  "0": {
    data: [1, 2, 3, 4, 5].map(generate),
    after: "1646161"
  } as ElementPage,
  "1646161": {
    data: [6, 7, 8, 9, 10].map(generate),
    after: "96416115"
  } as ElementPage,
  "96416115": {
    data: [11, 12, 13, 14, 15].map(generate),
    after: "2910619060"
  } as ElementPage,
  "2910619060": {
    data: [16, 17, 18, 19, 20].map(generate),
    after: undefined
  } as ElementPage,
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
