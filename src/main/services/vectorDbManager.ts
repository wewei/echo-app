import type { VectorDbMetadata, VectorDbSearchResponse } from '@/shared/types/vectorDb';
const vectorDbEndpoint = 'http://localhost:8001';

const searchEndpoint = `${vectorDbEndpoint}/api/v1/collections/messages/search`; 
const addEndpoint = `${vectorDbEndpoint}/api/v1/collections/messages/add`;

export const search = async (profileId: string, query: string, top_k: number): Promise<VectorDbSearchResponse> => {
  const response = await fetch(searchEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({profileId,  query, top_k })
  });

  if(!response.ok) {
    throw new Error(`Failed to search vectorDb: ${response.statusText}`);
  }

  const { documents, ids, metadatas } = await response.json();
  return { documents, ids, metadatas };
}

export const add = async (documents: string[], ids: string[], metadatas: VectorDbMetadata[]): Promise<boolean> => {
  const response = await fetch(addEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({documents, ids, metadatas })
  });

  if (!response.ok) {
      throw new Error(`Failed to add documents to vectorDb: ${response.statusText}`);
  }
  return true
}

