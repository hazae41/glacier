import type { NextApiRequest, NextApiResponse } from 'next'
import { ProfileData } from '../../theytube/profile'
import { VideoData } from '../../theytube/video'

const John69: ProfileData = {
  id: "1518516160",
  nickname: "John69"
}

const Anonymous: ProfileData = {
  id: "16128629862",
  nickname: "Anonymous"
}

const XxCrazyFanxX: ProfileData = {
  id: "61621719419",
  nickname: "XxCrazyFanxX"
}

const RandomGuy123: ProfileData = {
  id: "217948967941",
  nickname: "RandomGuy123"
}

const MeAtTheZoo: VideoData = {
  id: "187616286136",
  title: "Me at the zoo",
  author: John69,
  comments: [
    {
      id: "1986611015",
      author: XxCrazyFanxX,
      text: "Very nice video!!"
    },
    {
      id: "196416111616",
      author: RandomGuy123,
      text: "I have no sound :("
    }
  ]
}

const ThanksFor1MSubscribers: VideoData = {
  id: "16861981794163",
  author: RandomGuy123,
  title: "Thanks for 1M subscribers",
  comments: [
    {
      id: "1965616301",
      author: Anonymous,
      text: "I just subscribed"
    },
    {
      id: "16416846131",
      author: XxCrazyFanxX,
      text: "when is your next video pls"
    }
  ]
}

const videos = [
  MeAtTheZoo,
  ThanksFor1MSubscribers
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise(ok => setTimeout(ok, 1000))

  // return res.status(400).json({ message: "An error occured" })

  return res.status(200).json(videos)
}
