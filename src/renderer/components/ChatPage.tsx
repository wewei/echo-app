import React  from "react";
import { useSearchParams } from "react-router-dom";
import SplitView from "./SplitView";
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
