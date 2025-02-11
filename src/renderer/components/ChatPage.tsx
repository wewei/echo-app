import React, { useRef }  from "react";
import { useSearchParams } from "react-router-dom";
import SplitView from "./SplitView";
import WebPanel, { WebPanelRef } from "./WebPanel";
import ChatPanel from "./ChatPanel";
import MessageDetailPanel from "./MessageDetailPanel/MessageDetailPanel";

const matchMessageDetailUrl = (contextUrl: string): { profileId: string, messageId: string } | null => {
  if (!contextUrl) {
    return null;
  }
  const url = new URL(contextUrl);
  if (url.protocol === "echo-message:") {
    const profileId = url.pathname.split("/")[1];
    const messageId = url.pathname.split("/")[2];
    return profileId && messageId ? { profileId, messageId } : null;
  }
  return null;
}

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contextUrl = searchParams.get("context");
  const webPanelRef = useRef<WebPanelRef>(null);

  const handleLinkClick = (url: string) => {
    setSearchParams({ context: url })
    if (url) {
      webPanelRef.current?.addTab(url);
    }
  }

  const messageDetail = matchMessageDetailUrl(contextUrl);


  return (
    <SplitView
      leftContent={
        messageDetail ? (
          <MessageDetailPanel
            profileId={messageDetail.profileId}
            messageId={messageDetail.messageId}
          />
        ) : (
          <WebPanel ref={webPanelRef} />
        )
      }
      rightContent={<ChatPanel handleLinkClick={handleLinkClick} />}
    />
  );
}
