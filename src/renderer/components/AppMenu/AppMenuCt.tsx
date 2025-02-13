import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useProfile } from '@/renderer/data/profile'
import AppMenuRp from './AppMenuRp'

export default function AppMenuCt() {
  const { profileId } = useParams()
  const profile = useProfile(profileId)
  const [searchParams, setSearchParams] = useSearchParams()
  const path = searchParams.get("menu")

  const handleOpenSettings = () => {
    setSearchParams({ menu: "/settings" })
  }

  return (
    <AppMenuRp
      profile={profile}
      showSettings={path === "/settings"}
      onOpenSettings={handleOpenSettings}
    />
  )
} 