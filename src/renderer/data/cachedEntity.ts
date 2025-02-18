import { useEffect, useRef, useState } from "react"
import {
  cachedWith,
  cachedWithAsync,
  type AsyncFetch,
  type AsyncCacheUpdater,
} from "@/shared/utils/cache/cached";
import { type EntityState, ENTITY_NOT_EXIST } from "@/shared/types/entity";
import { type CacheStrategy, unlimited } from "@/shared/utils/cache/strategies";
import { useCurrentProfileId } from "./profile";

export const ENTITY_PENDING = Symbol('ENTITY_PENDING')
export type EntityPending = typeof ENTITY_PENDING
export type EntityRendererState<V> = EntityState<V> | EntityPending

export type CachedEntityHook<K, V> = (key: K) => EntityRendererState<V>

export type UpdateEntity<K, V> = (profileId: string, key: K, fn: (value: V) => EntityState<V>) => Promise<EntityState<V>>

export const cachedEntity = <K, V>(
  fetchFn: AsyncFetch<K, V>,
  cacheStrategy: CacheStrategy<K> = unlimited<K>()
): [CachedEntityHook<K, V>, AsyncCacheUpdater<K, V>] => {
  const [cachedFn, updater] = cachedWithAsync<K>(cacheStrategy)(fetchFn);
  const hook = (key: K): EntityRendererState<V> => {
    const [state, setState] = useState<EntityRendererState<V>>(ENTITY_PENDING);
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
  const hook = (key: K): EntityRendererState<V> => {
    const currentProfileId = useCurrentProfileId();
    const [state, setState] = useState<EntityRendererState<V>>(ENTITY_PENDING);
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

export const isEntityReady = <V>(entity: EntityRendererState<V>): entity is V => 
  entity && entity !== ENTITY_PENDING && entity !== ENTITY_NOT_EXIST
