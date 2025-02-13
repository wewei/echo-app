import { type CacheStrategy, unlimited } from "./strategies"

export const ENTITY_NOT_FOUND = Symbol("ENTITY_NOT_FOUND")
export type EntityNotFound = typeof ENTITY_NOT_FOUND
export type FetchResult<V> = V | EntityNotFound
export type FetchFunction<K, V> = (key: K) => Promise<FetchResult<V>>

export type CacheUpdater<K, V> = (key: K, fn: (value: V) => FetchResult<V>) => Promise<void>


export const cachedWith =
  <K, V>({ handleAccess, handleDelete }: CacheStrategy<K> = unlimited()) =>
  (fn: FetchFunction<K, V>): [FetchFunction<K, V>, CacheUpdater<K, V>] => {
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
