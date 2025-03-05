export type VectorDbMetadata = {
    profileId: string,
    role: 'user' | 'assistant',
    type: 'chat' | 'nav',
    interactionId: number,
    contextId: number | null,
    createdAt: number,
    index?: number // message indice after split
}

export type VectorDbSearchResponse = {
    documents: string[],
    distances: number[],
    metadatas: VectorDbMetadata[]
}

export type VectorDbInteraction = {
    userContent?: string,
    assistantContent?: string,
    tile?: string,
    description?: string,
    favIconUrl?: string,
    imageAssetId?: string
} & VectorDbMetadata


export interface VectorDbClient {
    search: (profileId: string, query: string) => Promise<VectorDbSearchResponse>
    add: (profileId: string, documents: string[], ids: string[], metadatas: VectorDbMetadata[]) => Promise<boolean>
}

