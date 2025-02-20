import { ENTITY_NOT_EXIST, EntityNotExist, EntityState } from "@/shared/types/entity"

export const ENTITY_PENDING = Symbol("ENTITY_PENDING")
export type EntityPending = typeof ENTITY_PENDING
export type EntityRendererState<E> = EntityState<E> | EntityPending

export const isEntityReady = <E>(entity: EntityRendererState<E>): entity is E =>
  entity !== ENTITY_PENDING && entity !== ENTITY_NOT_EXIST

export const isEntityPending = <E>(entity: EntityRendererState<E>): entity is EntityPending =>
  entity === ENTITY_PENDING

export const isEntityNotExist = <E>(entity: EntityRendererState<E>): entity is EntityNotExist =>
  entity === ENTITY_NOT_EXIST

export { ENTITY_NOT_EXIST, EntityNotExist, EntityState }