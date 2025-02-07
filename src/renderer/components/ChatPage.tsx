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
import MessageList from "./ChatPanel/MessageList";
import MessageInput from "./ChatPanel/MessageInput";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMessages } from "../data/messages";
import { useSettings } from "../data/settings";
import SplitView from "./SplitView";
import { useTheme } from "@mui/material/styles";
import WebPanel from "./WebPanel";
import ChatPanel from "./ChatPanel";

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contextUrl = searchParams.get("context");

  const handleLinkClick = (url: string) => {
    setSearchParams({ context: url })
  }

  return (
    <SplitView
      contextUrl={contextUrl}
      leftContent={<WebPanel contextUrl={contextUrl} />}
      rightContent={<ChatPanel handleLinkClick={handleLinkClick}/>}
    />
  )
}
