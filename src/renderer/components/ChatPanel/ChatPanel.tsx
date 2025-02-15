import React, { useEffect, useState, useRef } from 'react'
import { Box, Collapse, Alert } from '@mui/material'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import type { OpenAI } from 'openai'

import { useMessages } from '@/renderer/data/messages'
import { useSettings } from '@/renderer/data/settings'
import { CHAT_SETTINGS, ChatSettingsSchema } from '@/shared/types/chatSettings'
import { Message } from '@/shared/types/message'
import { useRecentQueryIds, createResponse, getQueries, getResponsesOfQuery} from '@/renderer/data/interactions'
import QueryListCt from '../QueryList'
import { isEntityReady } from '@/renderer/data/cachedEntity'

const ChatPanel = ({ handleLinkClick }: { handleLinkClick: (url: string) => void }) => {
  const BATCH_SIZE = 20
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const { profileId } = useParams<{ profileId: string }>();
  const [messages, addMessage] = useMessages(profileId);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model


  const { ids, loadMore, hasMore, createQuery } = useRecentQueryIds();

  useEffect(() => () => cancelStreamRef.current?.(), [cancelStreamRef]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (streamingMessage && model && !cancelStreamRef.current) {
        let content = "";

        // Await the resolution of the promises
        type MessageType = {
          role: "user" | "assistant";
          content: string;
        };

        const messages: MessageType[] = [];
        const queries = await getQueries(profileId, ids);
        for (const query of queries) {
          if (isEntityReady(query)) {
            messages.push(
              { role: "user", content: query.content || "" }
            );

            const responses = await getResponsesOfQuery(profileId, query.id);
            if (isEntityReady(responses)) {
              for (const response of responses) {
                messages.push(
                  { role: "assistant", content: response || "" }
                );
              }
            }
          }
        }

        cancelStreamRef.current = window.electron.chat.stream(
          profileId,
          {
            messages: messages,
            model
          },
          (chunk: OpenAI.ChatCompletionChunk) => {
            const delta = chunk.choices[0]?.delta?.content || ""
            if (delta) {
              content += delta
              // setStreamingMessage(
              //   (prev) =>
              //     prev && {
              //     ...prev,
              //     content:
              //       prev.content + (chunk.choices[0]?.delta?.content || ""),
              //   }
              // )
              console.log("content", content);
            }
          },
          () => {
            if (streamingMessage) {
              // addMessage({
              //   ...streamingMessage,
              //   content,
              //   timestamp: new Date().getTime(),
              // });
              // setStreamingMessage(null);
          
              createResponse(profileId, {
                query: streamingMessage.uuid, // replace with the actual query ID related to this response
                content: streamingMessage.content,
                timestamp: streamingMessage.timestamp,
                agents: 'chat',
                // Add any additional fields required by ResponseInput
              });
          
              setStreamingMessage(null); // Clear the streaming message after creating the response
            }
            cancelStreamRef.current = null;
          },
          () => {
            setError(t("chat.error.unknown"));
            setStreamingMessage(null);
          }
        );
      }
    };

    fetchMessages();
  }, [cancelStreamRef.current, streamingMessage]);

  const handleSend = (content: string) => {
    createQuery({
      content,
      timestamp: new Date().getTime(),
      type: "user",
      contexts: []
    });
    setStreamingMessage({
      uuid: uuidv4(),
      sender: "agent",
      content: "",
      timestamp: new Date().getTime(),
    });
  };


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxWidth: 800,
        mx: "auto",
        width: "100%",
        p: 2,
      }}
    >
      <Collapse in={!!error}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error || t("chat.error.unknown")}
        </Alert>
      </Collapse>
      {/* <MessageList
        messages={messages}
        streamingMessage={streamingMessage}
        onLinkClick={handleLinkClick}
      /> */}
      <QueryListCt
        queryIds={ids}
        onQueryClick={handleLinkClick}
        loadMore={() => loadMore(BATCH_SIZE)}
        hasMore={hasMore}
      />
      <MessageInput onSend={handleSend} disabled={streamingMessage !== null} />
    </Box>
  );
};

export default ChatPanel;