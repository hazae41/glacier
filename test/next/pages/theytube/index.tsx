import { XSWR } from "@hazae41/xswr";
import { useCallback } from "react";
import { fetchAsJson } from "../../libs/fetcher";
import { getVideoNormal, Video, VideoData } from "./video";

function getAllVideosSchema() {
  function normalizer(videos: VideoData[]) {
    return videos.map(getVideoNormal)
  }

  return XSWR.single<VideoData[], Error, string[]>(
    `/api/theytube`,
    fetchAsJson,
    { normalizer })
}

function useAllVideos() {
  const handle = XSWR.use(getAllVideosSchema, [])
  XSWR.useFetch(handle)
  return handle
}

export default function Page() {
  const videos = useAllVideos()

  const onRefetchClick = useCallback(() => {
    videos.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.refetch])

  if (!videos.data) return <>Loading...</>

  return <div className="w-full max-w-xl">
    <button onClick={onRefetchClick}>
      Refetch
    </button>
    <div className="flex flex-col gap-4">
      {videos.data.map(id =>
        <Video key={id} id={id} />)}
    </div>
  </div>
}
