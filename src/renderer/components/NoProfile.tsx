import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Profile } from '../../shared/types/profile'

interface Props {
  onProfileCreated: (profile: Profile) => void
}

// 生成默认头像的 SVG
const generateDefaultAvatar = () => {
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#9c27b0" />
      <text x="50" y="60" 
        font-family="Arial" 
        font-size="40" 
        fill="white" 
        text-anchor="middle"
      >
        U
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export default function NoProfile({ onProfileCreated }: Props) {
  const { t } = useTranslation()

  const handleCreateProfile = async () => {
    // 创建默认头像资源
    const svgContent = generateDefaultAvatar()
    const response = await fetch(svgContent)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    const asset = await window.electron.asset.save(
      'temp',
      Buffer.from(buffer),
      'image/svg+xml'
    )

    const profile = await window.electron.profile.create(
      '新用户',
      `echo-asset:///${'temp'}/${asset.id}`
    )

    // 将临时资源移动到新的 profile 下
    try {
      const content = await window.electron.asset.read('temp', asset.id)
      if (content) {
        await window.electron.asset.save(
          profile.id,
          content.content,
          content.metadata.mimeType
        )
      }
    } catch (error) {
      console.error('Failed to move avatar:', error)
    }

    onProfileCreated(profile)
  }

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2
    }}>
      <Typography variant="h5">
        {t('welcome.title')}
      </Typography>
      <Typography color="text.secondary">
        {t('welcome.subtitle')}
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleCreateProfile}
      >
        {t('welcome.createProfile')}
      </Button>
    </Box>
  )
} 