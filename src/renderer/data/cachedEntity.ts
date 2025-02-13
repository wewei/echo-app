import { useEffect, useRef, useState } from "react"
import { EventSource, eventSource } from "@/shared/utils/event"

export const entityNotExists = Symbol('entityNotExists')
export type EntityNotExists = typeof entityNotExists

export type EntityState<V> = V | EntityNotExists

export const entityLoading = Symbol('entityLoading')
export type EntityLoading = typeof entityLoading

export type EntityCacheState<V> = EntityState<V> | EntityLoading

export type Updater<V> = (key: string, entity: EntityState<V>) => void
export type CachedEntityHook<V> = (key: string) => EntityCacheState<V>

export const cachedEntity =
  <V>(read: (key: string) => Promise<V | null>): [CachedEntityHook<V>, Updater<V>] => {
    const cache = new Map<string, V>()
    const eventSources = new Map<string, EventSource<EntityState<V>>>()

    const watch = (key: string, listener: (entity: EntityState<V>) => void) => {
      const unwatch = (eventSources.has(key) ? eventSources.get(key) : (() => {
        const evtSrc = eventSource<EntityState<V>>()
        eventSources.set(key, evtSrc)
        return evtSrc
      })()).watch(listener);

      return () => {
        if (unwatch()) {
          eventSources.delete(key)
        }
      }
    }

    const hook = (key: string) => {
      const [value, setValue] = useState<EntityCacheState<V>>(cache.get(key) ?? entityLoading)
      const keyRef = useRef<string | null>(null)

      useEffect(() => {
        keyRef.current = key
        const unwatch = watch(key, setValue);
        
        return () => {
          keyRef.current = null
          unwatch()
        }
      }, [key])
      return value
    }

    const updater: Updater<V> = (key, val) => {
      cache.set(key, val)
    }

    return [hook, updater]
  }