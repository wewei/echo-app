export type CacheStrategy<K> = {
  // 读取时，根据读取的 key 做出响应的调整
  onGet?: (key: K) => void
  // 更新时，根据写入的 key 做出响应的调整
  onSet?: (key: K) => void 
  // 添加时，根据添加的 key 做出响应的调整
  onAdd?: (key: K) => void
  // 删除时，根据删除的 key 做出响应的调整
  onDel?: (key: K) => void
  // 获取建议的换出 key
  suggestSwapOut?: () => K | null
}

export type CacheHandler<K> = {
  onSwapIn?: (key: K) => void
  onSwapOut?: (key: K) => void
}
