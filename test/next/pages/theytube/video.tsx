import { XSWR } from "@hazae41/xswr";
import { Comment, CommentData, getCommentNormal } from "./comment";
import { fetchAsJson } from "./fetcher";
import { getProfileNormal, Profile, ProfileData } from "./profile";

export interface VideoData {
  id: string
  title: string
  author: ProfileData
  comments: CommentData[]
}

export interface NormalizedVideoData {
  id: string
  title: string
  author: string
  comments: string[]
}

export function getVideoSchema(id: string) {
  function normalizer(video: VideoData) {
    const author = getProfileNormal(video.author)
    const comments = video.comments.map(getCommentNormal)
    return { ...video, author, comments }
  }

  return XSWR.single<VideoData, Error, NormalizedVideoData>(
    `/api/theytube/video?id=${id}`,
    fetchAsJson,
    { normalizer })
}

export function getVideoNormal(video: VideoData) {
  return new XSWR.Normal(video, getVideoSchema(video.id), video.id)
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
      <Profile id={video.data.author} />
    </div>
    {video.data.comments.map(id =>
      <Comment key={id} id={id} />)}
  </div>
}