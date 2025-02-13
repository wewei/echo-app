import { makeRing, type RingNode } from "@/shared/utils/ring"
import { type CacheHandler, type CacheStrategy } from "./strategy"

export const lru = <K>(maxSize: number, { onSwapIn, onSwapOut }: CacheHandler<K> = {}): CacheStrategy<K> => {
  // 使用 Map 存储 key 到节点的映射
  const nodeMap = new Map<K, RingNode<K>>()
  
  // 创建循环双向链表
  const ring = makeRing<K>()

  return {
    handleAccess: (key: K) => {
      let node = nodeMap.get(key);

      if (node) {
        // 已存在则移除再插入到尾部
        ring.remove(node)
        node = ring.push(key)
        nodeMap.set(key, node)
        return null;
      }

      // 新建节点插入到尾部
      node = ring.push(key)
      nodeMap.set(key, node)
      onSwapIn?.(key)

      // 如果超过容量,移除头部
      if (nodeMap.size > maxSize) {
        const oldKey = ring.shift()
        return oldKey
      }
      return null
    },

    handleDelete: (key: K) => {
      const node = nodeMap.get(key);
      if (node) {
        ring.remove(node);
        nodeMap.delete(key);
        onSwapOut?.(key);
      }
    },
  };
}