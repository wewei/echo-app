import React from "react";
import { Box, Paper, Typography, Avatar, IconButton } from "@mui/material";
import { useMessage } from "../../data/messages";
import Loading from "../Loading";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@mui/material";
import { useSearchParams } from "react-router-dom";

function MessageDetailPanel({ profileId, messageId }: { profileId: string; messageId: string }) {
  const message = useMessage(profileId, messageId);
  const [, setSearchParams] = useSearchParams();

  if (!message) return <Loading />;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 顶部栏 */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          borderRadius: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: message.sender === "agent" ? "primary.main" : "secondary.main",
            }}
          >
            {message.sender === "agent" ? <SmartToyIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="subtitle1">
            {message.sender === "agent" ? "AI Assistant" : "You"}
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          onClick={() => setSearchParams({})}
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </Paper>

      {/* 消息内容 */}
      <Paper 
        sx={{ 
          flex: 1, 
          overflow: "auto", 
          p: 3,
          borderRadius: 0,
          bgcolor: "background.default" 
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{
            "& p": { m: 0 },
            "& p + p": { mt: 1 },
            "& a": {
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            "& pre": {
              p: 1.5,
              borderRadius: 1,
              bgcolor: "action.hover",
              overflow: "auto",
            },
            "& code": {
              fontFamily: "monospace",
              bgcolor: "action.hover",
              p: 0.5,
              borderRadius: 0.5,
            },
            "& ul, & ol": {
              pl: 3,
              "& li": {
                mb: 0.5,
              },
            },
            "& blockquote": {
              borderLeft: 4,
              borderColor: "divider",
              pl: 2,
              ml: 0,
              my: 1,
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <Link {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Typography>
      </Paper>
    </Box>
  );
}

export default MessageDetailPanel;