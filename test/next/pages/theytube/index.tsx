import { XSWR } from "@hazae41/xswr";
import { useCallback } from "react";
import { fetchAsJson } from "../../libs/fetcher";
import { getVideoRef, Video, VideoData, VideoRef } from "./video";

function getAllVideosSchema() {
  async function normalizer(videos: (VideoData | VideoRef)[], more: XSWR.NormalizerMore) {
    return await Promise.all(videos.map(data => getVideoRef(data, more)))
  }

  return XSWR.single<(VideoData | VideoRef)[]>(
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
      {videos.data.map(ref =>
        <Video
          key={ref.id}
          id={ref.id} />)}
    </div>
  </div>
}
