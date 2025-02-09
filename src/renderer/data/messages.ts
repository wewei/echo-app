import { useState, useEffect } from "react"
import { Message } from "@/shared/types/message"

export const useMessages = (profileId: string): [Message[], (message: Message) => Promise<void>] => {
  const [messages, setMessages] = useState<Message[]>([])
  useEffect(() => {
    const loadMessages = async () => {
      const history = await window.electron.message.query(profileId, {
        take: 50,  // 最近50条消息
        skip: 0
      })
      setMessages(history.reverse())
    }
    loadMessages()
  }, [])
  
  return [messages, (message: Message) => {
    setMessages((messages) => [...messages, message])
    return window.electron.message.add(profileId, message)
  }]
}

export const useMessage = (profileId: string, messageId: string): Message | null=> {
  const [message, setMessage] = useState<Message | null>(null);
  useEffect(() => {
    const loadMessage = async () => {
      const message = await window.electron.message.get(profileId, messageId);
      setMessage(message);
    }
    loadMessage();
  }, [profileId, messageId]);
  return message;
}