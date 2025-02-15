import { useEffect, useRef, useState } from "react"
import {
  cachedWith,
  cachedWithAsync,
  ENTITY_NOT_FOUND,
  type AsyncFetch,
  type FetchResult,
  type AsyncCacheUpdater,
  type EntityNotFound,
} from "@/shared/utils/cached/cached";
import { type CacheStrategy, unlimited } from "@/shared/utils/cached/strategies";
import { useCurrentProfileId } from "./profile";
export const ENTITY_LOADING = Symbol('ENTITY_LOADING')
export type EntityLoading = typeof ENTITY_LOADING
export type EntityState<V> = FetchResult<V> | EntityLoading

export { ENTITY_NOT_FOUND, EntityNotFound }

export type CachedEntityHook<K, V> = (key: K) => EntityState<V>

export type UpdateEntity<K, V> = (profileId: string, key: K, fn: (value: V) => FetchResult<V>) => Promise<void>

export const cachedEntity = <K, V>(
  fetchFn: AsyncFetch<K, V>,
  cacheStrategy: CacheStrategy<K> = unlimited<K>()
): [CachedEntityHook<K, V>, AsyncCacheUpdater<K, V>] => {
  const [cachedFn, updater] = cachedWithAsync<K>(cacheStrategy)(fetchFn);
  const hook = (key: K): EntityState<V> => {
    const [state, setState] = useState<EntityState<V>>(ENTITY_LOADING);
    const keyRef = useRef(key);
    useEffect(() => {
      keyRef.current = key;
      cachedFn(keyRef.current).then((value) => {
        if (keyRef.current === key) {
          setState(value);
        }
      });
    }, [key]);
    return state;
  };

  return [hook, updater];
}

export const profileCachedEntity = <K, V>(
  fetchForProfile: (profileId: string) => AsyncFetch<K, V>,
  cacheStrategy: CacheStrategy<K> = unlimited<K>()
): [CachedEntityHook<K, V>, UpdateEntity<K, V>] => {
  const [getFns] = cachedWith<string>(unlimited())((profileId) =>
    cachedWithAsync<K>(cacheStrategy)(fetchForProfile(profileId))
  );
  const hook = (key: K): EntityState<V> => {
    const currentProfileId = useCurrentProfileId();
    const [state, setState] = useState<EntityState<V>>(ENTITY_LOADING);
    const [cachedFn] = getFns(currentProfileId);

    const keyRef = useRef(key);
    useEffect(() => {
      keyRef.current = key;
      cachedFn(keyRef.current).then((value) => {
        if (keyRef.current === key) {
          setState(value);
        }
      });
    }, [key]);
    return state;
  };

  const update: UpdateEntity<K, V> = (profileId, key, fn) => {
    const [, updater] = getFns(profileId);
    return updater(key, fn);
  }

  return [hook, update];
};

export const isEntityReady = <V>(entity: EntityState<V>): entity is V => 
  entity !== ENTITY_LOADING && entity !== ENTITY_NOT_FOUND
