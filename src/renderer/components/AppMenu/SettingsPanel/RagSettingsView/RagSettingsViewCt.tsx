import React from 'react'
import { RagSettingSchema, RAG_SETTINGS } from '@/shared/types/ragSettings'
import { useSettings } from '@/renderer/data/settings'
import type { Profile } from '@/shared/types/profile'
import Loading from '@/renderer/components/Loading'
import RagSettingsViewRp from './RagSettingsViewRp'

interface Props {
  profile: Profile
}

export default function RagSettingsViewCt({ profile }: Props) {
  const [settings, setSettings] = useSettings(profile.id, RAG_SETTINGS, RagSettingSchema)

  if (!settings) {
    return <Loading />
  }

  const handleProviderChange = (value: string) => {
    setSettings({
      ...settings,
      provider: value as 'custom'
    })
  }

  const handleEndpointChange = (value: string) => {
    setSettings({
      ...settings,
      custom: {
        ...settings.custom,
        endpoint: value
      }
    })
  }

  const handleTopKChange = (value: number) => {
    setSettings({
      ...settings,
      custom: {
        ...settings.custom,
        topK: value
      }
    })
  }

  const handleDistanceThresholdChange = (value: number) => {
    setSettings({
      ...settings,
      custom: {
        ...settings.custom,
        distanceThreshold: value
      }
    })
  }


  const toggleOpen = () => {
    console.log("settings.isOpen", settings.isOpen)
    setSettings({
      ...settings,
      isOpen: !settings.isOpen
    })

  }

  return (
    <RagSettingsViewRp
      settings={settings}
      onProviderChange={handleProviderChange}
      onEndpointChange={handleEndpointChange}
      onTopKChange={handleTopKChange}
      onDistanceThresholdChange={handleDistanceThresholdChange}
      isOpen={settings.isOpen}
      onToggle={toggleOpen}
    />
  )
}
