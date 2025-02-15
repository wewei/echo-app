import { type CacheStrategy, unlimited } from "./strategies"

export const ENTITY_NOT_FOUND = Symbol("ENTITY_NOT_FOUND")
export type EntityNotFound = typeof ENTITY_NOT_FOUND
export type FetchResult<V> = V | EntityNotFound
export type Fetch<K, V> = (key: K) => V
export type CacheUpdater<K, V> = (key: K, fn: (value: V) => FetchResult<V>) => void

export type AsyncFetch<K, V> = (key: K) => Promise<FetchResult<V>>
export type AsyncCacheUpdater<K, V> = (key: K, fn: (value: V) => FetchResult<V>) => Promise<void>

export const cachedWith =
  <K>({ handleAccess, handleDelete }: CacheStrategy<K> = unlimited()) =>
  <V>(fn: Fetch<K, V>): [Fetch<K, V>, CacheUpdater<K, V>] => {
    const cache = new Map<K, V>()

    const cachedFn = (key: K) => {
      const cached = cache.get(key)

      if (cached) {
        handleAccess(key)
        return cached
      }

      const result = fn(key)

      if (result !== ENTITY_NOT_FOUND) {
        const keyOut = handleAccess(key)
        cache.set(key, result)
        if (keyOut !== null && cache.has(keyOut)) {
          handleDelete(keyOut)
          cache.delete(keyOut)
        }
      }

      return result
    }

    const updater = async (key: K, fn: (value: V) => FetchResult<V>) => {
      const cached = cache.get(key)
      if (cached) {
        const updated = fn(cached)

        if (updated === ENTITY_NOT_FOUND) {
          cache.delete(key)
          handleDelete(key)
        } else {
          cache.set(key, updated)
        }
      }
    }

    return [cachedFn, updater]
  }



export const cachedWithAsync =
  <K>({ handleAccess, handleDelete }: CacheStrategy<K> = unlimited()) =>
  <V>(fn: AsyncFetch<K, V>): [AsyncFetch<K, V>, AsyncCacheUpdater<K, V>] => {
    const cache = new Map<K, Promise<FetchResult<V>>>();

    const cachedFn = (key: K) => {
      const keyOut = handleAccess(key);
      const cached = cache.get(key);

      if (cached) {
        return cached;
      }

      const result = fn(key)
        .then((val) => {
          if (val === ENTITY_NOT_FOUND && cache.has(key)) {
            cache.delete(key);
            handleDelete(key);
          }
          return val;
        })
        .catch((err) => {
          if (cache.has(key)) {
            cache.delete(key);
            handleDelete(key);
          }
          throw err;
        });
      cache.set(key, result);

      if (keyOut !== null && cache.has(keyOut)) {
        handleDelete(keyOut);
        cache.delete(keyOut);
      }

      return result;
    };

    const updater = async (key: K, fn: (value: V) => FetchResult<V>) => {
      const cached = cache.get(key);
      if (cached) {
        const updated = cached
          .then((value) => {
            if (value === ENTITY_NOT_FOUND) {
              return value;
            }
            const val = fn(value);
            if (val === ENTITY_NOT_FOUND && cache.has(key)) {
              cache.delete(key);
              handleDelete(key);
            }
            return val;
          })
          .catch((err) => {
            if (cache.has(key)) {
              cache.delete(key);
              handleDelete(key);
            }
            throw err;
          });
        cache.set(key, updated);
        await updated;
      }
    };

    return [cachedFn, updater];
  };
