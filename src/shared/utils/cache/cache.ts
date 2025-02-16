import { CacheStrategy, unlimited } from "./strategies"

export const ENTITY_NOT_EXIST = Symbol("ENTITY_NOT_EXIST")
export type EntityNotExist = typeof ENTITY_NOT_EXIST
export type EntityState<Entity> = Entity | EntityNotExist

export type Cache<Key, Entity> = {
  get: (key: Key) => EntityState<Entity>
  set: (key: Key, entity: Entity) => void
  del: (key: Key) => void
  has: (key: Key) => boolean
  update: (key: Key, updater: (entity: EntityState<Entity>) => EntityState<Entity>) => EntityState<Entity>
}

export const makeCache = <Key, Entity>({
  onGet,
  onSet,
  onAdd,
  onDel,
  suggestSwapOut,
}: CacheStrategy<Key> = unlimited<Key>()): Cache<Key, Entity> => {
  const entities = new Map<Key, Entity>()
  const get = (key: Key): EntityState<Entity> => {
    const entity = entities.get(key) ?? ENTITY_NOT_EXIST
    if (entity !== ENTITY_NOT_EXIST) {
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

  const update = (key: Key, updater: (entity: EntityState<Entity>) => EntityState<Entity>) => {
    const entity = entities.get(key)
    const updated = updater(entity ?? ENTITY_NOT_EXIST)
    if (updated !== ENTITY_NOT_EXIST) {
      set(key, updated)
    } else {
      del(key)
    }
    return updated
  }

  return { get, set, del, has, update }
}

