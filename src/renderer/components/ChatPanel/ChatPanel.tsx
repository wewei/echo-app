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

const ChatPanel = ({ handleLinkClick }: { handleLinkClick: (url: string) => void }) => {
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

  useEffect(() => () => cancelStreamRef.current?.(), [cancelStreamRef]);

  useEffect(() => {
    if (streamingMessage && model && !cancelStreamRef.current && messages[messages.length - 1].sender === "user") {
      let content = ""
      cancelStreamRef.current = window.electron.chat.stream(
        profileId,
          {
            messages: [...messages, streamingMessage].map((message) => ({
              role: message.sender === "user" ? "user" : "assistant",
              content: message.content,
            })),
            model
          },
          (chunk: OpenAI.ChatCompletionChunk) => {
            const delta = chunk.choices[0]?.delta?.content || ""
            if (delta) {
              content += delta
              setStreamingMessage(
                (prev) =>
                  prev && {
                  ...prev,
                  content:
                    prev.content + (chunk.choices[0]?.delta?.content || ""),
                }
              )
            }
          },
          () => {
            if (streamingMessage) {
              addMessage({
                ...streamingMessage,
                content,
                timestamp: new Date().getTime(),
              });
              setStreamingMessage(null);
            }
            cancelStreamRef.current = null;
          },
          () => {
            setError(t("chat.error.unknown"));
            setStreamingMessage(null);
          }
      );
    }
  }, [cancelStreamRef.current, messages]);

  const handleSend = (content: string) => {
    addMessage({
      uuid: uuidv4(),
      sender: "user",
      content,
      timestamp: new Date().getTime(),
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
      <MessageList
        messages={messages}
        streamingMessage={streamingMessage}
        onLinkClick={handleLinkClick}
      />
      <MessageInput onSend={handleSend} disabled={streamingMessage !== null} />
    </Box>
  );
};

export default ChatPanel;