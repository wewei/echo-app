import React, { useRef, useEffect } from 'react'
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import { Message } from "../../shared/types/message";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ReactMarkdown from "react-markdown";

interface Props {
  messages: Message[];
  streamingMessage: Message | null;
}

function MessageItem({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming: boolean;
}) {
  return (
    <Box
      key={message.uuid}
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        opacity: isStreaming ? 0.7 : 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor:
            message.sender === "agent" ? "primary.main" : "secondary.main",
        }}
      >
        {message.sender === "agent" ? (
          isStreaming ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SmartToyIcon />
          )
        ) : (
          <PersonIcon />
        )}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="body1"
          component="div"
          sx={{
            "& p": { m: 0 },
            "& p + p": { mt: 1 },
          }}
        >
          <ReactMarkdown>{message.content || " "}</ReactMarkdown>
        </Typography>
      </Box>
    </Box>
  );
}

export default function MessageList({ messages, streamingMessage }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {messages.map((message) => (
        <MessageItem message={message} isStreaming={false} key={message.uuid} />
      ))}
      {streamingMessage && (
        <MessageItem
          message={streamingMessage}
          isStreaming={true}
          key={streamingMessage.uuid}
        />
      )}
      <div ref={bottomRef} />
    </Box>
  );
} 