import { makeRing, type RingNode } from "@/shared/utils/ring"
import { type CacheHandler, type CacheStrategy } from "./strategy"

export const lru = <K>(maxSize: number, { onSwapIn, onSwapOut }: CacheHandler<K> = {}): CacheStrategy<K> => {
  // 使用 Map 存储 key 到节点的映射
  const nodeMap = new Map<K, RingNode<K>>()
  
  const ring = makeRing<K>()

  const onGet = (key: K) => {
    const node = nodeMap.get(key);
    if (node) {
      ring.remove(node)
      ring.push(key)
    }
  }

  const onAdd = (key: K) => {
    nodeMap.set(key, ring.push(key))
    onSwapIn?.(key)
  }

  const onDel = (key: K) => {
    const node = nodeMap.get(key);
    if (node) {
      ring.remove(node)
      nodeMap.delete(key)
      onSwapOut?.(key)
    }
  }

  const suggestSwapOut = () => {
    if (nodeMap.size > maxSize) {
      return ring.first()
    }
    return null
  }

  return {
    onGet,
    onAdd,
    onDel,
    suggestSwapOut,
  }
}