import { type CacheHandler, type CacheStrategy } from "./strategy"

export const unlimited = <K>({
  onSwapIn,
  onSwapOut,
}: CacheHandler<K> = {}): CacheStrategy<K> => ({
  onAdd: (key: K) => {
    onSwapIn?.(key);
  },
  onDel: (key: K) => {
    onSwapOut?.(key);
  },
});
