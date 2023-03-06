import { ReactNode, useRef } from "react";

export interface ChildrenProps {
  children?: ReactNode
}

export function useAutoRef<T>(current: T) {
  const ref = useRef(current)
  ref.current = current
  return ref
}