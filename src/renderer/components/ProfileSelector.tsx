import { 
  AppBar, Toolbar, Avatar, Select, MenuItem, 
  IconButton, Menu, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Button, Box
} from '@mui/material'
import React, { useState, useRef } from 'react'
import { Profile } from '../../shared/types/profile'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PhotoIcon from '@mui/icons-material/Photo'

interface Props {
  profiles: Profile[]
  currentProfile: Profile | null
  onProfileChange: (profileId: string) => void
  onProfilesChange: (profiles: Profile[]) => void
}

export default function ProfileSelector({ 
  profiles, 
  currentProfile, 
  onProfileChange,
  onProfilesChange 
}: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [username, setUsername] = useState('')
  const [avatarAssetId, setAvatarAssetId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      console.log('buffer', buffer)
      const asset = await window.electron.asset.save(
        currentProfile?.id || 'temp',
        buffer,
        file.type
      )
      setAvatarAssetId(asset.id)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const handleCreateProfile = async () => {
    if (!avatarAssetId) return
    const profile = await window.electron.profile.create(
      username,
      `echo-asset:///${currentProfile?.id || 'temp'}/${avatarAssetId}`
    )
    
    // 将临时资源移动到新的 profile 下
    try {
      const content = await window.electron.asset.read('temp', avatarAssetId)
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

    onProfilesChange([...profiles, profile])
    setDialogOpen(false)
    setUsername('')
    setAvatarAssetId('')
  }

  const handleUpdateProfile = async () => {
    if (!currentProfile) return
    
    let avatarUrl = currentProfile.avatar
    if (avatarAssetId) {
      avatarUrl = `echo-asset:///${currentProfile.id}/${avatarAssetId}`
    }

    const updated = await window.electron.profile.update(
      currentProfile.id,
      { username, avatar: avatarUrl }
    )
    if (updated) {
      onProfilesChange(
        profiles.map(p => p.id === updated.id ? updated : p)
      )
    }
    setDialogOpen(false)
    setEditMode(false)
    setAvatarAssetId('')
  }

  const handleDeleteProfile = async () => {
    if (!currentProfile) return
    await window.electron.profile.delete(currentProfile.id)
    onProfilesChange(profiles.filter(p => p.id !== currentProfile.id))
    setMenuAnchor(null)
  }

  const handleEdit = () => {
    if (!currentProfile) return
    setUsername(currentProfile.username)
    setAvatarAssetId('')
    setEditMode(true)
    setDialogOpen(true)
    setMenuAnchor(null)
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Select
          value={currentProfile?.id || ''}
          onChange={(e) => onProfileChange(e.target.value as string)}
          sx={{ flexGrow: 1, mr: 2 }}
          displayEmpty
        >
          {profiles.map(profile => (
            <MenuItem key={profile.id} value={profile.id}>
              <Avatar 
                src={profile.avatar} 
                sx={{ width: 24, height: 24, mr: 1 }}
              />
              {profile.username}
            </MenuItem>
          ))}
        </Select>

        <IconButton onClick={() => {
          setEditMode(false)
          setDialogOpen(true)
        }}>
          <AddIcon />
        </IconButton>

        {currentProfile && (
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>编辑</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteProfile}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>删除</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {editMode ? '编辑个人资料' : '创建新的个人资料'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="用户名"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Box sx={{ 
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar
                src={avatarAssetId ? 
                  `echo-asset:///${currentProfile?.id || 'temp'}/${avatarAssetId}` :
                  currentProfile?.avatar
                }
                sx={{ width: 64, height: 64 }}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                选择头像
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={editMode ? handleUpdateProfile : handleCreateProfile}
              disabled={!username || (!editMode && !avatarAssetId)}
            >
              {editMode ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  )
} 