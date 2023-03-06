import { useRef } from "react";

export function useAutoRef<T>(current: T) {
  const ref = useRef(current)
  ref.current = current
  return ref
}