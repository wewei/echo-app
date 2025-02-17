import { CacheStrategy, unlimited } from "./strategies"

export const ENTITY_NOT_EXIST = Symbol("ENTITY_NOT_EXIST")
export type EntityNotExist = typeof ENTITY_NOT_EXIST
export type EntityState<Entity> = Entity | EntityNotExist

export const isEntityExist = <Entity>(entity: EntityState<Entity>): entity is Entity =>
  entity !== ENTITY_NOT_EXIST

export type Cache<Key, Entity> = {
  get: (key: Key) => EntityState<Entity>
  set: (key: Key, entity: Entity) => void
  del: (key: Key) => void
  has: (key: Key) => boolean
  update: (key: Key, updater: (entity: EntityState<Entity>) => EntityState<Entity>) => EntityState<Entity>
}

/**
 * Make a cache
 * @param strategy The cache strategy, default is unlimited
 * @returns The cache
 */
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
    if (isEntityExist(entity)) {
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
    const entity = entities.get(key) ?? ENTITY_NOT_EXIST
    const updated = updater(entity)
    if (isEntityExist(updated)) {
      set(key, updated)
    } else {
      del(key)
    }
    return updated
  }

  return { get, set, del, has, update }
}

export type AsyncCache<Key, Entity> = Cache<Key, Promise<Entity>>

export const makeAsyncCache = <Key, Entity>(
  strategy: CacheStrategy<Key> = unlimited<Key>()
): AsyncCache<Key, Entity> => {
  const cache = makeCache<Key, Promise<Entity>>(strategy);
  const { del } = cache;
  const deleteInvalidEntity = (key: Key, entity: Promise<Entity>) =>
    cache.get(key) === entity && del(key);

  return {
    ...cache,
    set: (key: Key, entity: Promise<Entity>) => {
      cache.set(key, entity);
      entity.then(
        (value) => {
          if (!isEntityExist(value)) {
            deleteInvalidEntity(key, entity);
          }
          return value;
        },
        (error) => {
          deleteInvalidEntity(key, entity);
          throw error;
        }
      );
    },
  };
};

export const cachedWith =
  <Key, Entity>(cache: Cache<Key, Entity>) =>
  (fn: (key: Key) => Entity) =>
  (key: Key): Entity => {
    const cached = cache.get(key);
    if (isEntityExist(cached)) {
      return cached;
    }

    const result = fn(key);

    if (isEntityExist(result)) {
      cache.set(key, result);
    }

    return result;
  };
