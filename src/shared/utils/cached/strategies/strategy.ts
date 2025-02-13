export type CacheStrategy<K> = {
  // 读取时，给定要读取的 key，返回要被换出的 key
  handleAccess: (key: K) => K | null
  // 通知删除给定的 key
  handleDelete: (key: K) => void
}

export type CacheHandler<K> = {
  onSwapIn?: (key: K) => void
  onSwapOut?: (key: K) => void
}
