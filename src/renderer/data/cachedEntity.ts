import { useEffect, useRef, useState } from "react"

export type Patcher<P> = (patch: P) => void
export type CachedEntityHook<V, P> = (key: string) => [V | null, Patcher<P>]

// V is the value type
// P is the patch type
export const cachedEntity = <V extends Record<string, unknown>, P>(read: (key: string) => Promise<V>, update: (patch: P, value: V) => (V | null)): CachedEntityHook<V, P> => {
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
      if (key && !value) {
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

    return [value, (patch) => {
      if (value) {
        const val = update(patch, value);
        if (val !== value) {
          if (val) {
          cache.set(key, val)
        } else {
          cache.delete(key)
          }
        }
        if (keyRef.current === key) {
          setValue(val)
        }
      }
    }]
  }

}
