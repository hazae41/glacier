import { XSWR } from "@hazae41/xswr";
import { fetchAsJson } from "../../libs/fetcher";
import { Comment, CommentData, CommentRef, getCommentRef } from "./comment";
import { getProfileRef, Profile, ProfileData, ProfileRef } from "./profile";

export interface VideoRef {
  ref: boolean
  id: string
}

export interface VideoData {
  id: string
  title: string
  author: ProfileData
  comments: CommentData[]
}

export interface NormalizedVideoData {
  id: string
  title: string
  author: ProfileRef
  comments: CommentRef[]
}

export function getVideoSchema(id: string) {
  async function normalizer(video: VideoData | NormalizedVideoData, more: XSWR.NormalizerMore) {
    const author = await getProfileRef(video.author, more)
    const comments = await Promise.all(video.comments.map(data => getCommentRef(data, more)))
    return { ...video, author, comments }
  }

  return XSWR.single<VideoData | NormalizedVideoData>(
    `/api/theytube/video?id=${id}`,
    fetchAsJson,
    { normalizer })
}

export async function getVideoRef(video: VideoData | VideoRef, more: XSWR.NormalizerMore) {
  if ("ref" in video) return video
  const schema = getVideoSchema(video.id)
  await schema.normalize(video, more)
  return { ref: true, id: video.id }
}

export function useVideo(id: string) {
  const handle = XSWR.use(getVideoSchema, [id])
  XSWR.useFetch(handle)
  return handle
}

export function Video(props: { id: string }) {
  const video = useVideo(props.id)

  if (!video.data) return null

  return <div className="p-4 border border-solid border-gray-500">
    <div className="flex justify-center items-center w-full aspect-video border border-solid border-gray-500">
      Some video
    </div>
    <div className="py-4">
      <h1 className="text-xl">
        {video.data.title}
      </h1>
      <Profile id={video.data.author.id} />
    </div>
    {video.data.comments.map(ref =>
      <Comment
        key={ref.id}
        id={ref.id} />)}
  </div>
}

export default function Page() {
  return null
}