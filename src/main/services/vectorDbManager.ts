import type { VectorDbMetadata, VectorDbSearchResponse, VectorDbClient } from '@/shared/types/vectorDb';
import { type RagSettings, RAG_SETTINGS } from '@/shared/types/ragSettings';
import { readSettings, onSettingsUpdated } from './settingsManager';
import { onProfileDeleted } from './profileManager'

interface VectorDbClientConfig {
  endpoint?: string;
  topK?: number;
  distanceThreshold?: number;
}

class CustomVectorDbClient implements VectorDbClient {
  private searchEndpoint: string;
  private addEndpoint: string;
  private distanceThreshold: number;
  private topK: number;

  constructor(config: VectorDbClientConfig) {
    this.searchEndpoint = `${config.endpoint}/api/v1/collections/messages/search`;
    this.addEndpoint = `${config.endpoint}/api/v1/collections/messages/add`;
    this.topK = config.topK ?? 10;
    this.distanceThreshold = config.distanceThreshold ?? 0.6;
  }

  async search(profileId: string, query: string): Promise<VectorDbSearchResponse> {
    const response = await fetch(this.searchEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({profileId, query, top_k: this.topK})
    });

    if(!response.ok) {
      throw new Error(`Failed to search vectorDb: ${response.statusText}`);
    }

    const result = await response.json();
    const documents: string[] = [];
    const distances: number[] = [];
    const metadatas: VectorDbMetadata[] = [];

    for (let i = 0; i < (result.distances ?? []).length; i++) {
      if (result.distances[i] <= this.distanceThreshold) {
        documents.push(result.documents[i]);
        distances.push(result.distances[i]);
        metadatas.push(result.metadatas[i]);
      }
    }

    return {
      documents,
      distances,
      metadatas
    } satisfies VectorDbSearchResponse;
  }

  async add(profileId: string, documents: string[], ids: string[], metadatas: VectorDbMetadata[]): Promise<boolean> {
    // profileId is not used in this implementation
    // but it is used in the metadatas

    const response = await fetch(this.addEndpoint, {
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
}

const clients = new Map<string, VectorDbClient>();

export const getClient = async (profileId: string): Promise<VectorDbClient> => {
  let client = clients.get(profileId);
  if (!client) {
    const settings = await readSettings(profileId, RAG_SETTINGS) as RagSettings;
    if (!settings) {
      throw new Error('RAG settings not found');
    }

    if(!settings.isOpen) {
      return null;
    }

    client = new CustomVectorDbClient(settings.custom);
    clients.set(profileId, client);
  }
  return client;
}

onSettingsUpdated(RAG_SETTINGS, (profileId, settings) => { 
  // todo: looks not working properly
  console.log("Settings updated for profileId: ", profileId, settings);
  clients.delete(profileId) 
})

onProfileDeleted((profileId) => { clients.delete(profileId) })