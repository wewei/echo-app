import {
  type Query,
  type Response,
  type QuerySearchOptions,
} from "@/shared/types/interactions";

import { useCurrentProfileId } from "@/renderer/data/profile";

export const queryCache = new Map<string, Query>();
