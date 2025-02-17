import { OpenAI } from "openai";
import { Agent } from "./agent";
import { streamToAsyncIterator } from "@/shared/utils/stream";

export type ChatAgentInput = {
  profileId: string
  model: string
  content: string
  context?: string
}

const prepareMessages = async (content: string, context?: string): Promise<OpenAI.ChatCompletionMessageParam[]> => {
  return [
    { role: 'user', content },
  ];
}

export const chatAgent: Agent<ChatAgentInput, AsyncIterable<string>> = ({
  profileId,
  model,
  content,
  context,
}) => streamToAsyncIterator(
  new ReadableStream({
    async start(controller) {
      const messages = await prepareMessages(content, context);
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
