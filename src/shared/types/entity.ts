export const ENTITY_NOT_EXIST = Symbol("ENTITY_NOT_EXIST")
export type EntityNotExist = typeof ENTITY_NOT_EXIST
export type EntityState<E> = E | EntityNotExist

export const isEntityExist = <E>(entity: EntityState<E>): entity is E =>
  entity !== ENTITY_NOT_EXIST

export type EntityData<E> = Omit<E, 'id'>
