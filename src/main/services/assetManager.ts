import { app, protocol } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { AssetMetadata, AssetsMetadata, AssetMetadataSchema, AssetsMetadataSchema } from '../../shared/types/asset'

const ASSETS_METADATA_FILE = 'assets.json'
const ASSETS_DIR = 'assets'

// 获取 profile 的 assets 目录路径
const getProfileAssetsDir = (profileId: string) => 
  path.join(app.getPath('userData'), 'profiles', profileId, ASSETS_DIR)

// 获取 profile 的 assets 元数据文件路径
const getProfileAssetsMetadataPath = (profileId: string) =>
  path.join(app.getPath('userData'), 'profiles', profileId, ASSETS_METADATA_FILE)

// 获取 asset 文件路径
const getAssetPath = (profileId: string, assetId: string) =>
  path.join(getProfileAssetsDir(profileId), assetId)

// 读取 assets 元数据
const readAssetsMetadata = async (profileId: string) => {
  try {
    const filePath = getProfileAssetsMetadataPath(profileId)
    const data = await fs.readFile(filePath, 'utf-8')
    return AssetsMetadataSchema.parse(JSON.parse(data))
  } catch (error) {
    return { assets: {} }
  }
}

// 保存 assets 元数据
const saveAssetsMetadata = async (profileId: string, data: AssetsMetadata) => {
  const filePath = getProfileAssetsMetadataPath(profileId)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// 确保 assets 目录存在
const ensureAssetsDir = async (profileId: string) => {
  const dir = getProfileAssetsDir(profileId)
  await fs.mkdir(dir, { recursive: true })
}

// 保存 asset
export const saveAsset = async (
  profileId: string,
  content: Buffer,
  mimeType: string
): Promise<AssetMetadata> => {
  await ensureAssetsDir(profileId)
  
  const metadata = AssetMetadataSchema.parse({
    id: uuidv4(),
    mimeType,
    createdAt: Date.now(),
  })
  
  // 保存文件
  await fs.writeFile(getAssetPath(profileId, metadata.id), content)
  
  // 更新元数据
  const assetsMetadata = await readAssetsMetadata(profileId)
  assetsMetadata.assets[metadata.id] = metadata
  await saveAssetsMetadata(profileId, assetsMetadata)
  
  return metadata
}

// 读取 asset
export const readAsset = async (
  profileId: string,
  assetId: string
): Promise<{ content: Buffer; metadata: AssetMetadata } | null> => {
  try {
    const assetsMetadata = await readAssetsMetadata(profileId)
    const metadata = assetsMetadata.assets[assetId]
    if (!metadata) return null
    
    const content = await fs.readFile(getAssetPath(profileId, assetId))
    return { content, metadata }
  } catch (error) {
    return null
  }
}

// 删除 asset
export const deleteAsset = async (profileId: string, assetId: string): Promise<void> => {
  try {
    // 读取元数据
    const assetsMetadata = await readAssetsMetadata(profileId)
    
    // 检查 asset 是否存在
    if (!assetsMetadata.assets[assetId]) {
      return
    }
    
    // 删除文件
    await fs.rm(getAssetPath(profileId, assetId), { force: true })
    
    // 更新元数据
    delete assetsMetadata.assets[assetId]
    await saveAssetsMetadata(profileId, assetsMetadata)
  } catch (error) {
    console.error('Failed to delete asset:', error)
  }
} 

// 注册自定义协议
export const registerAssetProtocol = () => {
  protocol.handle('echo-asset', async (request) => {
    try {
      const url = new URL(request.url)
      const [, profileId, assetId] = url.pathname.split('/')
      
      if (!profileId || !assetId) {
        return new Response('Not Found', { status: 404 })
      }
      
      const assetPath = getAssetPath(profileId, assetId)
      
      try {
        const metadata = (await readAssetsMetadata(profileId)).assets[assetId]
        if (!metadata) {
          return new Response('Not Found', { status: 404 })
        }
        
        const content = await fs.readFile(assetPath)
        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': metadata.mimeType,
            'Cache-Control': 'no-cache'
          }
        })
      } catch (error) {
        return new Response('Not Found', { status: 404 })
      }
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 })
    }
  })
}
