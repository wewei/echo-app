import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Settings } from '@/shared/types/settings'

export const useSettings = <T extends Settings>(profileId: string, scope: string, schema: z.ZodSchema<T>): [T | null, (settings: T) => void] => {
  const [settings, setSettings] = useState<T | null>(null)
  useEffect(() => {
    const readSettings = async () => {
      const settings = await window.electron.settings.read(profileId, scope)
      setSettings(schema.parse(settings))
    }
    readSettings()
  }, [scope, profileId])
  return [settings, (settings: T) => {
    setSettings(settings)
    window.electron.settings.write(profileId, scope, settings)
  }]
}
