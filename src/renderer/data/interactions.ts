import { useState, useEffect, useCallback } from "react";
import {
  type Query,
  type QueryInput,
  type ResponseInput,
} from "@/shared/types/interactions";

import { useCurrentProfileId } from "@/renderer/data/profile";
import { profileCachedEntity } from "./cachedEntity";

const [useQuery, updateQuery] = profileCachedEntity(
  (profileId: string) => async (key: string) => {
    const queries = await window.electron.interactions.getQueries(profileId, [
      key,
    ]);
    return queries[0];
  }
);

const [useResponse, updateResponse] = profileCachedEntity(
  (profileId: string) => async (key: string) => {
    const responses = await window.electron.interactions.getResponses(
      profileId,
      [key]
    );
    return responses[0];
  }
);

const BATCH_SIZE = 20;

const useRecentQueryIds = (): {
  ids: string[];
  loadMore: (maxCount: number) => void;
  hasMore: boolean;
  createQuery: (input: QueryInput) => Promise<Query>;
} => {
  const [ids, setIds] = useState<string[]>([]);
  const [maxCount, setMaxCount] = useState(BATCH_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const profileId = useCurrentProfileId();
  const count = ids.length;

  useEffect(() => {
    if (count < maxCount && hasMore) {
      window.electron.interactions
        .searchQueries(profileId, {
          maxCount: maxCount - count,
          created: {
            type: "before",
            timestamp: Date.now(),
          },
        })
        .then((result) => {
          for (const query of result) {
            updateQuery(profileId, query.id, () => query);
          }
          setIds([...result.map((q) => q.id), ...ids]);
          setHasMore(result.length === maxCount - count);
        });
    }
  }, [count, maxCount, hasMore]);

  const loadMore = useCallback(() => {
    if (count === maxCount && hasMore) {
      setMaxCount(maxCount + 10);
    }
  }, [count, maxCount, hasMore]);

  const createQuery = useCallback(
    async (input: QueryInput) => {
      const query = await window.electron.interactions.createQuery(
        profileId,
        input
      );
      updateQuery(profileId, query.id, () => query);
      setIds([...ids, query.id]);
      setMaxCount((c) => c + 1);
      return query;
    },
    [profileId, ids]
  );

  return { ids, loadMore, hasMore, createQuery };
};

const [useQueryResponses, updateQueryResponses] = profileCachedEntity(
  (profileId: string) => async (queryId: string) => {
    const responses = await window.electron.interactions.getResponsesOfQuery(
      profileId,
      queryId
    );
    return responses;
  }
);

const createResponse = async (profileId: string, input: ResponseInput) => {
  const response = await window.electron.interactions.createResponse(
    profileId,
    input
  );
  updateResponse(profileId, response.id, () => response);
  updateQueryResponses(profileId, response.query, (cur) => [
    ...cur,
    response.id,
  ]);
  return response;
};

const appendResponseContent = async (profileId: string, responseId: string, content: string) => {
  const response = await window.electron.interactions.appendResponse(
    profileId,
    responseId,
    content
  );
  updateResponse(profileId, response.id, () => response);
  return response;
};

// TODO, use the cached entities
const getQueries = window.electron.interactions.getQueries;
const getResponses = window.electron.interactions.getResponses;
const getResponsesOfQuery = window.electron.interactions.getResponsesOfQuery;

export {
  useQuery,
  useResponse,
  useRecentQueryIds,
  useQueryResponses,
  createResponse,
  appendResponseContent,
  getQueries,
  getResponses,
  getResponsesOfQuery,
};
