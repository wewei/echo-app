import React, { useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Loading from '@/renderer/components/Loading'

export default function DefaultView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      const profiles = await window.electron.profile.getAll()
      setLoading(false)
      if (profiles.length > 0) {
        navigate(`/profile/${profiles[0].id}`)
      }
    }
    loadProfile()
  }, [])

  const handleCreateProfile = async () => {
    const profile = await window.electron.profile.create(
      t('profile.defaultName'),
      ''  // 空头像
    )

    navigate(`/profile/${profile.id}?menu=/settings`)
  }

  return loading ? <Loading /> : (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h5">{t("welcome.title")}</Typography>
      <Typography color="text.secondary">{t("welcome.subtitle")}</Typography>
      <Button variant="contained" onClick={handleCreateProfile}>
        {t("welcome.createProfile")}
      </Button>
    </Box>
  );
} 