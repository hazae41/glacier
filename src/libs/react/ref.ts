import { useRef } from "react";

/**
 * A ref whose content is updated on each render
 * @param current 
 * @returns 
 */
export function useRenderRef<T>(current: T) {
  const ref = useRef(current)
  ref.current = current
  return ref
}