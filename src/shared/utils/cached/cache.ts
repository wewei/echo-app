import { CacheStrategy, unlimited } from "./strategies"

export const ENTITY_NOT_FOUND = Symbol("ENTITY_NOT_FOUND")
export type EntityNotFound = typeof ENTITY_NOT_FOUND

export type Cache<Key, Entity> = {
  get: (key: Key) => Entity | EntityNotFound
  set: (key: Key, entity: Entity) => void
  del: (key: Key) => void
  has: (key: Key) => boolean
  update: (key: Key, updater: (entity: Entity | EntityNotFound) => Entity | EntityNotFound) => Entity | EntityNotFound
}

export const makeCache = <Key, Entity>({
  onGet,
  onSet,
  onAdd,
  onDel,
  suggestSwapOut,
}: CacheStrategy<Key> = unlimited<Key>()): Cache<Key, Entity> => {
  const entities = new Map<Key, Entity>()
  const get = (key: Key): Entity | EntityNotFound => {
    const entity = entities.get(key) ?? ENTITY_NOT_FOUND
    if (entity !== ENTITY_NOT_FOUND) {
      onGet?.(key)
    }
    return entity
  }
  const set = (key: Key, entity: Entity) => {
    const isNew = !entities.has(key)
    entities.set(key, entity)
    if (isNew) {
      onAdd?.(key)
    } else {
      onSet?.(key)
    }
    const keyOut = suggestSwapOut?.()
    if (keyOut !== null && entities.has(keyOut)) {
      del(keyOut)
    }
  }
  const del = (key: Key) => {
    entities.delete(key)
    onDel?.(key)
  }
  const has = (key: Key) => entities.has(key)
  const update = (key: Key, updater: (entity: Entity | EntityNotFound) => Entity | EntityNotFound) => {
    const entity = entities.get(key)
    const updated = updater(entity ?? ENTITY_NOT_FOUND)
    if (updated !== ENTITY_NOT_FOUND) {
      set(key, updated)
    } else {
      del(key)
    }
    return updated
  }

  return { get, set, del, has, update }
}

