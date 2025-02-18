import { type CacheStrategy, unlimited } from "./strategies"
import { makeCache } from "./cache"
import { type EntityState, ENTITY_NOT_EXIST } from "@/shared/types/entity"

export type Fetch<K, V> = (key: K) => V
export type CacheUpdater<K, V> = (key: K, fn: (value: V) => EntityState<V>) => EntityState<V>

export type AsyncFetch<K, V> = (key: K) => Promise<EntityState<V>>
export type AsyncCacheUpdater<K, V> = (key: K, fn: (value: V) => EntityState<V>) => Promise<EntityState<V>>

export const cachedWith =
  <K>(strategy: CacheStrategy<K> = unlimited<K>()) =>
  <V>(fn: Fetch<K, V>): [Fetch<K, V>, CacheUpdater<K, V>] => {
    const cache = makeCache<K, V>(strategy)

    const cachedFn = (key: K) => {
      const cached = cache.get(key)
      if (cached !== ENTITY_NOT_EXIST) {
        return cached
      }

      const result = fn(key)

      if (result !== ENTITY_NOT_EXIST) {
        cache.set(key, result)
      }

      return result
    }

    const updater = (key: K, fn: (value: V) => EntityState<V>) =>
      cache.update(key, (value) => {
        if (value === ENTITY_NOT_EXIST) {
          return ENTITY_NOT_EXIST
        }
        const updated = fn(value)

        if (updated === ENTITY_NOT_EXIST) {
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
    const cache = makeCache<K, Promise<EntityState<V>>>(strategy)

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

    const updater = async (key: K, fn: (value: V) => EntityState<V>) => {

      const updated = cache.update(key, (value) =>
        value === ENTITY_NOT_EXIST
          ? value : value
          .then((value) => {
            if (value === ENTITY_NOT_EXIST) {
              return value;
            }
            const val = fn(value);
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
          })
      );
      return updated === ENTITY_NOT_EXIST ? Promise.resolve(ENTITY_NOT_EXIST) : updated;
    }

    return [cachedFn, updater];
  };

