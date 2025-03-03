export type VectorDbMetadata = Record<string, unknown>;

export type VectorDbSearchResponse = {
    documents: string[],
    ids: string[],
    metadatas: VectorDbMetadata[]
}
