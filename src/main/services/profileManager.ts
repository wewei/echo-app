import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { type Profile, ProfileSchema, ProfilesSchema } from '../../shared/types/profile'

const PROFILES_FILE = 'profiles.json'

// 获取配置文件路径
const getProfilesPath = () => path.join(app.getPath('userData'), PROFILES_FILE)

// 获取指定 profile 的目录路径
const getProfileDir = (profileId: string) => 
  path.join(app.getPath('userData'), 'profiles', profileId)

// 读取 profiles 配置
const readProfiles = async () => {
  try {
    const filePath = getProfilesPath()
    const data = await fs.readFile(filePath, 'utf-8')
    return ProfilesSchema.parse(JSON.parse(data))
  } catch (error) {
    // 如果文件不存在，返回初始状态
    return { profiles: [] }
  }
}

// 保存 profiles 配置
const saveProfiles = async (data: { profiles: Profile[] }) => {
  const filePath = getProfilesPath()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// 创建 profile 目录
const createProfileDir = async (profileId: string) => {
  const dir = getProfileDir(profileId)
  await fs.mkdir(dir, { recursive: true })
}

// 删除 profile 目录
const removeProfileDir = async (profileId: string) => {
  const dir = getProfileDir(profileId)
  await fs.rm(dir, { recursive: true, force: true })
}

// 创建新的 profile
export const createProfile = async (username: string, avatar: string): Promise<Profile> => {
  const profiles = await readProfiles()
  const newProfile = ProfileSchema.parse({
    id: uuidv4(),
    username,
    avatar
  })
  
  await createProfileDir(newProfile.id)
  await saveProfiles({ profiles: [...profiles.profiles, newProfile] });
  
  return newProfile
}

// 删除 profile
export const deleteProfile = async (profileId: string): Promise<void> => {
  const profiles = await readProfiles()
  const newProfiles = profiles.profiles.filter(p => p.id !== profileId)
  
  await removeProfileDir(profileId)
  await saveProfiles({ profiles: newProfiles })
}

// 更新 profile
export const updateProfile = async (
  profileId: string, 
  updates: Partial<Omit<Profile, 'id'>>
): Promise<Profile | null> => {
  const profiles = await readProfiles()
  const updatedProfiles = profiles.profiles.map(p => 
    p.id === profileId ? { ...p, ...updates, id: profileId } : p
  )
  
  await saveProfiles({ profiles: updatedProfiles })
  
  return updatedProfiles.find(p => p.id === profileId) || null
}

// 获取所有 profiles
export const getAllProfiles = async (): Promise<Profile[]> => {
  const profiles = await readProfiles()
  return profiles.profiles
}

// 获取指定 profile
export const getProfile = async (profileId: string): Promise<Profile | null> => {
  const profiles = await readProfiles()
  return profiles.profiles.find(p => p.id === profileId) || null
}
