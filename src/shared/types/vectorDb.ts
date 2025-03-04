export type VectorDbMetadata = Record<string, unknown>;

export type VectorDbSearchResponse = {
    documents: string[],
    ids: string[],
    metadatas: VectorDbMetadata[]
}

export type VectorDbInteraction = {
    interactionId: number,
    type: 'chat' | 'nav',
    role: 'user' | 'assistant',
    profileId: string,
    contextId: number | null,
    createdAt?: number,
    updatedAt?: number,
    userContent?: string,
    assistantContent?: string,
    tile?: string,
    description?: string,
    favIconUrl?: string,
    imageAssetId?: string
}
