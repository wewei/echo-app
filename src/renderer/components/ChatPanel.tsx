import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Alert, Collapse } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import {
  CHAT_SETTINGS,
  ChatSettingsSchema,
} from "../../shared/types/chatSettings";
import OpenAI from "openai";
import type { Message } from "../../shared/types/message";
import { useTranslation } from "react-i18next";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMessages } from "../data/messages";
import { useSettings } from "../data/settings";
import SplitView from "./SplitView";
import { useTheme } from "@mui/material/styles";

export default function ChatPanel() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const { profileId } = useParams<{ profileId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const contextUrl = searchParams.get("context");
  const [messages, addMessage] = useMessages(profileId);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const [chatSettings] = useSettings(profileId, CHAT_SETTINGS, ChatSettingsSchema)
  const model = chatSettings?.[chatSettings?.provider]?.model
  const navigate = useNavigate();
  const theme = useTheme();

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
            console.log('chunk', chunk.choices[0]?.delta?.content)
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
          (error: Error) => {
            setError(t("chat.error.unknown"));
            setStreamingMessage(null);
          }
      );
    }
  }, [streamingMessage, cancelStreamRef, messages]);

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

  const handleLinkClick = (url: string) => {
    setSearchParams({ context: url })
  }

  const WebView = () => {
    const webviewRef = useRef<HTMLWebViewElement>(null)

    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        bgcolor: 'background.paper',
        '& webview': {
          width: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          opacity: 0.95,
        }
      }}>
        <webview
          ref={webviewRef}
          src={contextUrl || ''}
          style={{ 
            width: '100%', 
            height: '100%',
            backgroundColor: 'white'
          }}
        />
      </Box>
    )
  }

  const ChatView = () => (
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
  )

  return (
    <SplitView
      contextUrl={contextUrl}
      leftContent={<WebView />}
      rightContent={<ChatView />}
    />
  )
}
