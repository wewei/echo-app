import { useState, useEffect } from "react";
import {
  type Query,
  type Response,
  type QuerySearchOptions,
} from "@/shared/types/interactions";

import { useCurrentProfileId } from "@/renderer/data/profile";
import { cachedEntity } from "./cachedEntity";

export const useQuery = cachedEntity(async (key: string) => {
  const profileId = useCurrentProfileId()
  const queries = await window.electron.interactions.getQueries(profileId, [key])
  return queries[0]
})

export const useRecentQueryIds = (): { ids: string[], loadMore: (maxCount: number) => void } => {
  const [ids, setIds] = useState<string[]>([])
  const [maxCount, setMaxCount] = useState(10)
  const profileId = useCurrentProfileId()

  // TODO

  const loadMore = () => setMaxCount(maxCount + 10)

  return {ids, loadMore}
}