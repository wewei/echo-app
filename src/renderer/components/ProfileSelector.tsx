import { 
  AppBar, Toolbar, Avatar, Select, MenuItem, 
  IconButton, Menu, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Button
} from '@mui/material'
import React, { useState } from 'react'
import { Profile } from '../../shared/types/profile'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'

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
  const [avatarUrl, setAvatarUrl] = useState('')

  const handleCreateProfile = async () => {
    const profile = await window.electron.profile.create(username, avatarUrl)
    onProfilesChange([...profiles, profile])
    setDialogOpen(false)
    setUsername('')
    setAvatarUrl('')
  }

  const handleUpdateProfile = async () => {
    if (!currentProfile) return
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
    setAvatarUrl(currentProfile.avatar)
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
            <TextField
              margin="dense"
              label="头像 URL"
              fullWidth
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              onClick={editMode ? handleUpdateProfile : handleCreateProfile}
              disabled={!username || !avatarUrl}
            >
              {editMode ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  )
} 