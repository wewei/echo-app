import { OpenAI } from "openai";
import { Agent } from "./agent";
import { streamToAsyncIterator } from "@/shared/utils/stream";
import { BaseInteraction } from "@/shared/types/interactions";

export type ChatAgentInput = {
  profileId: string
  model: string
  chatInteraction: BaseInteraction
}

const prepareMessages = async (profileId: string, { userContent, contextId, id, createdAt }: BaseInteraction): Promise<OpenAI.ChatCompletionMessageParam[]> => {
  const recentInteractions = await window.electron.interactions.getChats(profileId, {
    created: {
      before: createdAt,
    },
    contextId,
    limit: 30,
  });
  const referingInteractions = recentInteractions.filter(interaction => interaction.id !== id);
    const messages = [
    ...referingInteractions.map(({ userContent, createdAt }) => ({
      role: "user",
      content: userContent,
      timestamp: createdAt,
    })),
    { role: "user", content: userContent, timestamp: createdAt },
  ]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(({ role, content }) => ({ role, content }));

  return messages as OpenAI.ChatCompletionMessageParam[];
}

export const chatAgent: Agent<ChatAgentInput, AsyncIterable<string>> = ({
  profileId,
  model,
  chatInteraction,
}) => streamToAsyncIterator(
  new ReadableStream({
    async start(controller) {
      const messages = await prepareMessages(profileId, chatInteraction);
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
