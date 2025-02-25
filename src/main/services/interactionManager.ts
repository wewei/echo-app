import { app } from 'electron'
import { cached } from '@/shared/utils/cache'
import { createInteractionStore } from '../store/interactions'
import path from 'node:path'
import fs from 'node:fs'
import { isEntityExist } from '@/shared/types/entity'
import { getProfileDir, onProfileWillBeDeleted } from './profileManager'

const [getInteractionStore, cache] = cached((profileId: string) => {
  const dbDir = path.join(getProfileDir(profileId), 'db')
  fs.mkdirSync(dbDir, { recursive: true })
  const dbPath = path.join(dbDir, 'interactions.sqlite')
  return createInteractionStore(dbPath)
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