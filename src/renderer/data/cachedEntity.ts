import { useEffect, useRef, useState } from "react"
import {
  cachedWith,
  cachedWithAsync,
  ENTITY_NOT_EXIST,
  type AsyncFetch,
  type AsyncCacheUpdater,
  type EntityNotExist,
} from "@/shared/utils/cache/cached";
import { type EntityState } from "@/shared/utils/cache/cache";
import { type CacheStrategy, unlimited } from "@/shared/utils/cache/strategies";
import { useCurrentProfileId } from "./profile";
export const ENTITY_LOADING = Symbol('ENTITY_LOADING')
export type EntityLoading = typeof ENTITY_LOADING
export type EntityStoreState<V> = EntityState<V> | EntityLoading

export { ENTITY_NOT_EXIST, EntityNotExist }

export type CachedEntityHook<K, V> = (key: K) => EntityStoreState<V>

export type UpdateEntity<K, V> = (profileId: string, key: K, fn: (value: V) => EntityState<V>) => Promise<EntityState<V>>

export const cachedEntity = <K, V>(
  fetchFn: AsyncFetch<K, V>,
  cacheStrategy: CacheStrategy<K> = unlimited<K>()
): [CachedEntityHook<K, V>, AsyncCacheUpdater<K, V>] => {
  const [cachedFn, updater] = cachedWithAsync<K>(cacheStrategy)(fetchFn);
  const hook = (key: K): EntityStoreState<V> => {
    const [state, setState] = useState<EntityStoreState<V>>(ENTITY_LOADING);
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
  const hook = (key: K): EntityStoreState<V> => {
    const currentProfileId = useCurrentProfileId();
    const [state, setState] = useState<EntityStoreState<V>>(ENTITY_LOADING);
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

export const isEntityReady = <V>(entity: EntityStoreState<V>): entity is V => 
  entity && entity !== ENTITY_LOADING && entity !== ENTITY_NOT_EXIST
