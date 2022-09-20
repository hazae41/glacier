import { XSWR } from "@hazae41/xswr";
import { useCallback } from "react";
import { fetchAsJson } from "../../libs/fetcher";
import { getProfileRef, getProfileSchema, Profile, ProfileData, ProfileRef } from "./profile";

export interface CommentRef {
  ref: boolean
  id: string
}

export interface CommentData {
  id: string,
  author: ProfileData,
  text: string
}

export interface NormalizedCommentData {
  id: string,
  author: ProfileRef,
  text: string
}

export function getCommentSchema(id: string) {
  async function normalizer(comment: CommentData | NormalizedCommentData, more: XSWR.NormalizerMore) {
    const author = await getProfileRef(comment.author, more)
    return { ...comment, author }
  }

  return XSWR.single<CommentData | NormalizedCommentData>(
    `/api/theytube/comment?id=${id}`,
    fetchAsJson,
    { normalizer })
}

export async function getCommentRef(comment: CommentData | CommentRef, more: XSWR.NormalizerMore) {
  if ("ref" in comment) return comment
  const schema = getCommentSchema(comment.id)
  await schema.normalize(comment, more)
  return { ref: true, id: comment.id }
}

export function useComment(id: string) {
  const handle = XSWR.use(getCommentSchema, [id])
  XSWR.useFetch(handle)
  return handle
}

export function Comment(props: { id: string }) {
  const { make } = XSWR.useXSWR()
  const comment = useComment(props.id)

  const onChangeAuthorClick = useCallback(() => {
    if (!comment.data) return

    const John69 = make(getProfileSchema("1518516160"))
    if (!John69.state) return

    const author = John69.state.data!

    comment.mutate(c => c && ({ data: c.data && ({ ...c.data, author }) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment.data, comment.mutate])

  if (!comment.data) return null

  return <div className="p-4 border border-solid border-gray-500">
    <Profile id={comment.data.author.id} />
    <pre className="whitespace-pre-wrap">
      {comment.data.text}
    </pre>
    <button onClick={onChangeAuthorClick}>
      Change author
    </button>
  </div>
}

export default function Page() {
  return null
}