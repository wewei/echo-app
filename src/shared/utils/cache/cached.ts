import { type CacheStrategy, unlimited } from "./strategies"
import { makeCache, type Cache } from "./cache"
import { ENTITY_NOT_EXIST } from "@/shared/types/entity"

export type Fetch<K, V> = (key: K) => V

export type AsyncFetch<K, V> = (key: K) => Promise<V>

export const cached =
  <K, V>(
    fn: Fetch<K, V>,
    strategy: CacheStrategy<K> = unlimited<K>()
  ): [Fetch<K, V>, Cache<K, V>] => {
    const cache = makeCache<K, V>(strategy);

    const cachedFn = (key: K) => {
      const cached = cache.get(key);
      if (cached !== ENTITY_NOT_EXIST) {
        return cached;
      }

      const result = fn(key);

      if (result !== ENTITY_NOT_EXIST) {
        cache.set(key, result);
      }

      return result;
    };

    return [cachedFn, cache];
  };

export const asyncCached = <K, V>(
  fn: AsyncFetch<K, V>,
  strategy: CacheStrategy<K> = unlimited<K>()
): [AsyncFetch<K, V>, Cache<K, Promise<V>>] => {
  const cache = makeCache<K, Promise<V>>(strategy);

  const cachedFn = (key: K) => {
    const cached = cache.get(key);

    if (cached !== ENTITY_NOT_EXIST) {
      return cached;
    }

    const result = fn(key)
      .then((val) => {
        if (val === ENTITY_NOT_EXIST && cache.has(key)) {
          cache.del(key);
        }
        return val;
      })
      .catch((err) => {
        if (cache.has(key)) {
          cache.del(key);
        }
        throw err;
      });

    cache.set(key, result);

    return result;
  };

  return [cachedFn, cache];
};

