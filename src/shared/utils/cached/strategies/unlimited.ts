import { type CacheHandler, type CacheStrategy } from "./strategy"

export const unlimited = <K>({ onSwapIn, onSwapOut }: CacheHandler<K> = {}): CacheStrategy<K> => ({
  handleAccess: (key: K): K | null => {
    onSwapIn?.(key)
    return null
  },
  handleDelete: (key: K) => {
    onSwapOut?.(key)
  },
});
