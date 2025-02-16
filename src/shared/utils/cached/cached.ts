import { type CacheStrategy, unlimited } from "./strategies"
import { makeCache, type EntityNotFound, ENTITY_NOT_FOUND } from "./cache"

export type FetchResult<V> = V | EntityNotFound
export type Fetch<K, V> = (key: K) => V
export type CacheUpdater<K, V> = (key: K, fn: (value: V) => FetchResult<V>) => FetchResult<V>

export type AsyncFetch<K, V> = (key: K) => Promise<FetchResult<V>>
export type AsyncCacheUpdater<K, V> = (key: K, fn: (value: V) => FetchResult<V>) => Promise<FetchResult<V>>

export const cachedWith =
  <K>(strategy: CacheStrategy<K> = unlimited<K>()) =>
  <V>(fn: Fetch<K, V>): [Fetch<K, V>, CacheUpdater<K, V>] => {
    const cache = makeCache<K, V>(strategy)

    const cachedFn = (key: K) => {
      const cached = cache.get(key)
      if (cached !== ENTITY_NOT_FOUND) {
        return cached
      }

      const result = fn(key)

      if (result !== ENTITY_NOT_FOUND) {
        cache.set(key, result)
      }

      return result
    }

    const updater = (key: K, fn: (value: V) => FetchResult<V>) =>
      cache.update(key, (value) => {
        if (value === ENTITY_NOT_FOUND) {
          return ENTITY_NOT_FOUND
        }
        const updated = fn(value)

        if (updated === ENTITY_NOT_FOUND) {
          cache.del(key)
        } else {
          cache.set(key, updated)
        }

        return updated
      })

    return [cachedFn, updater]
  }

export const cachedWithAsync =
  <K>(strategy: CacheStrategy<K> = unlimited<K>()) =>
  <V>(fn: AsyncFetch<K, V>): [AsyncFetch<K, V>, AsyncCacheUpdater<K, V>] => {
    const cache = makeCache<K, Promise<FetchResult<V>>>(strategy)

    const cachedFn = (key: K) => {
      const cached = cache.get(key);

      if (cached !== ENTITY_NOT_FOUND) {
        return cached;
      }

      const result = fn(key)
        .then((val) => {
          if (val === ENTITY_NOT_FOUND && cache.has(key)) {
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

    const updater = async (key: K, fn: (value: V) => FetchResult<V>) => {

      const updated = cache.update(key, (value) =>
        value === ENTITY_NOT_FOUND
          ? value : value
          .then((value) => {
            if (value === ENTITY_NOT_FOUND) {
              return value;
            }
            const val = fn(value);
            if (val === ENTITY_NOT_FOUND && cache.has(key)) {
              cache.del(key);
            }
            return val;
          })
          .catch((err) => {
            if (cache.has(key)) {
              cache.del(key);
            }
            throw err;
          })
      );
      return updated === ENTITY_NOT_FOUND ? Promise.resolve(ENTITY_NOT_FOUND) : updated;
    }

    return [cachedFn, updater];
  };
