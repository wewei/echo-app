import { useEffect, useRef, useState } from "react"
import {
  cachedWith,
  ENTITY_NOT_FOUND,
  type FetchFunction,
  type FetchResult,
  type CacheUpdater,
  type EntityNotFound,
} from "@/shared/utils/cached/cached";

export const ENTITY_LOADING = Symbol('ENTITY_LOADING')
export type EntityLoading = typeof ENTITY_LOADING
export type EntityState<V> = FetchResult<V> | EntityLoading

export { ENTITY_NOT_FOUND, EntityNotFound }

export type CachedEntityHook<K, V> = (key: K) => EntityState<V>

export const cachedEntity = <K, V>(fetch: FetchFunction<K, V>): [CachedEntityHook<K, V>, CacheUpdater<K, V>] => {
  const [cachedFn, updater] = cachedWith<K, V>()(fetch)
  const hook = (key: K): EntityState<V> => {
    const [state, setState] = useState<EntityState<V>>(ENTITY_LOADING)
    const keyRef = useRef(key)
    useEffect(() => {
      keyRef.current = key
      cachedFn(keyRef.current).then(value => {
        if (keyRef.current === key) {
          setState(value)
        }
      })
    }, [key])
    return state
  }
  return [hook, updater]
}

export const isEntityReady = <V>(entity: EntityState<V>): entity is V => 
  entity !== ENTITY_LOADING && entity !== ENTITY_NOT_FOUND
