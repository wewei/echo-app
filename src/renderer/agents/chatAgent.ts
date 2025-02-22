import { OpenAI } from "openai";
import { Agent } from "./agent";
import { streamToAsyncIterator } from "@/shared/utils/stream";
import { ChatInteraction } from "@/shared/types/interactionsV2";

export type ChatAgentInput = {
  profileId: string
  model: string
  chatInteraction: ChatInteraction
}

const prepareMessages = async (profileId: string, { userContent, contextId, id, assistantContent }: ChatInteraction): Promise<OpenAI.ChatCompletionMessageParam[]> => {
  const recentInteractions = await window.electron.interactionsV2.getChats(profileId, {
    created: {
      before: Date.now(),
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
    { role: "user", content: assistantContent, timestamp: Date.now() },
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
