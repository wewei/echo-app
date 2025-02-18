import { OpenAI } from "openai";
import { Agent } from "./agent";
import { streamToAsyncIterator } from "@/shared/utils/stream";
import { Query } from "@/shared/types/interactions";

export type ChatAgentInput = {
  profileId: string
  model: string
  query: Query
}

const prepareMessages = async (profileId: string, { content, contextId, id }: Query): Promise<OpenAI.ChatCompletionMessageParam[]> => {
  const recentQueries = await window.electron.interactions.searchQueries(profileId, {
    created: {
      type: 'before',
      timestamp: Date.now(),
    },
    contextId,
    maxCount: 30,
  })
  const referingQueries = recentQueries.filter(q => q.id !== id)
  const referingResponseIds = await Promise.all(
    recentQueries
      .filter((q) => q.id !== id)
      .map(({ id }) =>
        window.electron.interactions
          .getQueryResponseIds(profileId, id)
          .then((ids) => (ids.length > 0 ? ids[0] : null))
      )
  );
  const referingResponses = await Promise.all(referingResponseIds.map((id) => window.electron.interactions.getResponse(profileId, id)))
  const messages = [
    ...referingQueries.map(({ content, timestamp }) => ({
      role: "user",
      content,
      timestamp,
    })),
    ...referingResponses.map(({ content, timestamp }) => ({
      role: "assistant",
      content,
      timestamp,
    })),
    { role: "user", content, timestamp: Date.now() },
  ]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ role, content }) => ({ role, content }));

  return messages as OpenAI.ChatCompletionMessageParam[];
}

export const chatAgent: Agent<ChatAgentInput, AsyncIterable<string>> = ({
  profileId,
  model,
  query,
}) => streamToAsyncIterator(
  new ReadableStream({
    async start(controller) {
      const messages = await prepareMessages(profileId, query);
      window.electron.chat.stream(
        profileId,
        { messages, model },
        (delta) => {
          controller.enqueue(delta.choices[0]?.delta?.content ?? "");
        },
        () => {
          controller.close();
        },
        (error) => {
          controller.error(error);
        }
      );
    },
  })
)
