import { useEffect, useRef, useState } from "react"

export type CachedEntityHook<V> = (key: string) => V | null
export type Patcher<P> = (patch: P) => void
export type MutableCachedEntityHook<V, P> = (key: string) => [V | null, Patcher<P>]

type CachedEntityHookPlus<V, C> = (key: string) => [V | null, C]

const cachedEntityInner = <V>(read: (key: string) => Promise<V | null>): CachedEntityHookPlus<V, (key: string, value: V | null) => void> => {
  const cache = new Map<string, V>()

  return (key: string) => {
    const [value, setValue] = useState<V | null>(null)
    const keyRef = useRef<string | null>(null)
    useEffect(() => {
      const fetchValue = async () => {
        const val = await read(key)
        cache.set(key, val)
        if (keyRef.current === key) {
          setValue(val)
        }
      }
      keyRef.current = key
      if (!value) {
        const val = cache.get(key)
        if (val) {
          setValue(val)
        } else {
          fetchValue()
        }
      }
      return () => {
        keyRef.current = null
        setValue(null)
      }
    }, [key])
    return [value, (key, val) => {
      if (val) {
        cache.set(key, val)
      } else {
        cache.delete(key)
      }
      if (keyRef.current === key) {
        setValue(val)
      }
    }]
  }
}

// V is the value type
// P is the patch type
export const mutableCachedEntity = <V extends Record<string, unknown>, P>(read: (key: string) => Promise<V | null>, update: (patch: P, value: V) => (V | null)): MutableCachedEntityHook<V, P> => {
  const innerHook = cachedEntityInner(read)

  return (key: string) => {
    const [value, updateValue] = innerHook(key)
    return [value, (patch) => {
      if (value) {
        const val = update(patch, value);
        if (val !== value) {
          updateValue(key, val)
        }
      }
    }]
  }
}

export const cachedEntity = <V extends Record<string, unknown>>(read: (key: string) => Promise<V | null>): CachedEntityHook<V> => {
  const innerHook = cachedEntityInner(read)
  return (key: string) => {
    const [value] = innerHook(key)
    return value
  }
}