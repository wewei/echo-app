import React from 'react'
import { SearchSettingsSchema, SEARCH_SETTINGS } from '@/shared/types/searchSettings'
import { useSettings } from '@/renderer/data/settings'
import type { Profile } from '@/shared/types/profile'
import Loading from '@/renderer/components/Loading'
import SearchSettingsViewRp from './SearchSettingsViewRp'

interface Props {
  profile: Profile
}

export default function SearchSettingsViewCt({ profile }: Props) {
  const [settings, setSettings] = useSettings(profile.id, SEARCH_SETTINGS, SearchSettingsSchema)

  if (!settings) {
    return <Loading />
  }

  const handleProviderChange = (value: string) => {
    setSettings({
      ...settings,
      provider: value as 'bing'
    })
  }

  const handleBingApiKeyChange = (value: string) => {
    setSettings({
      ...settings,
      bing: {
        ...settings.bing,
        apiKey: value
      }
    })
  }

  return (
    <SearchSettingsViewRp
      settings={settings}
      onProviderChange={handleProviderChange}
      onBingApiKeyChange={handleBingApiKeyChange}
    />
  )
} 