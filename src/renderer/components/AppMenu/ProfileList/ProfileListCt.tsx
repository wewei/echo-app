import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProfiles } from '@/renderer/data/profile'
import ProfileListRp from './ProfileListRp'

export default function ProfileListCt() {
  const [profiles, createProfile] = useProfiles()
  const { profileId } = useParams()
  const navigate = useNavigate()

  const handleProfileClick = (id: string) => {
    navigate(`/profile/${id}`)
  }

  const handleCreateProfile = async () => {
    const { id } = await createProfile()
    navigate(`/profile/${id}?menu=/settings`)
  }

  return (
    <ProfileListRp
      profiles={profiles}
      currentProfileId={profileId}
      onProfileClick={handleProfileClick}
      onCreateProfile={handleCreateProfile}
    />
  )
} 