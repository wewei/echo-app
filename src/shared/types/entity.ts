export const ENTITY_NOT_EXIST = Symbol("ENTITY_NOT_EXIST")
export type EntityNotExist = typeof ENTITY_NOT_EXIST
export type EntityState<Entity> = Entity | EntityNotExist

export const isEntityExist = <Entity>(entity: EntityState<Entity>): entity is Entity =>
  entity !== ENTITY_NOT_EXIST