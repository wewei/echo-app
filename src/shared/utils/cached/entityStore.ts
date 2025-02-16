import { CacheStrategy } from "./strategies"

export type Updater<Entity, Operator> = (entity: Entity, operator: Operator) => Entity

export type EntityStoreDef<Key, Entity, Operator> = {
  fetch: (key: Key) => Entity
  update: (key: Key, updater: Updater<Entity, Operator>) => Entity
  keyToString?: (key: Key) => string
  cacheStrategy?: CacheStrategy<Key>
}

export type EntityStore<Key, Entity, Operator> = {
  peek: (key: Key) => Entity
  watch: (key: Key, handler: (entity: Entity) => void) => () => boolean
  update: (key: Key, updater: Updater<Entity, Operator>) => Entity
}

// export const makeEntityStore = <Key, Entity, Operator>({
//   fetch,
//   update,
//   keyToString,
//   cacheStrategy,
// }: EntityStore<Key, Entity, Operator>) => {
//   const cache = new Map<Key, Entity>();

//   const peek = (key: Key): Entity => {};
//   const watch = (key: Key, handler: (entity: Entity) => void): (() => boolean) => {};
//   const update = (key: Key, updater: Updater<Entity, Operator>): Entity => {};

//   return { peek, watch, update };
// };
