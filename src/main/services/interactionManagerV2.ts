import { app } from 'electron'
import { cached } from '@/shared/utils/cache'
import { createInteractionStore } from '../store/interactionsV2'
import path from 'node:path'
import { isEntityExist } from '@/shared/types/entity'
import { onProfileWillBeDeleted } from './profileManager'

const [getInteractionStore, cache] = cached((profileId: string) => {
  return createInteractionStore(profileId)
})

export { getInteractionStore }

onProfileWillBeDeleted((profileId) => {
  const manager = cache.get(profileId)
  if (isEntityExist(manager)) {
    manager.close()
    cache.del(profileId)
  }
})

app.on('will-quit', () => {
  cache.keys().forEach((profileId) => {
    const manager = cache.get(profileId)
    if (isEntityExist(manager)) {
      manager.close()
    }
  })
})