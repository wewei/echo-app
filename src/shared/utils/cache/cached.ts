import { ENTITY_NOT_EXIST, type Cache } from "./cache";

export type Fetch<K, V> = (key: K) => V;
export type AsyncFetch<K, V> = Fetch<K, Promise<V>>;

export const cachedWith =
  <K, V>(cache: Cache<K, V>) =>
  (fn: Fetch<K, V>): Fetch<K, V> =>
  (key: K) => {
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

export const cachedWithAsync =
  <K, V>(cache: Cache<K, Promise<V>>) =>
  (fn: AsyncFetch<K, V>): AsyncFetch<K, V> =>
  (key: K) => {
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
