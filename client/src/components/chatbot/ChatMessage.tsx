import { cn } from "@/lib/utils";
import React from "react";

interface ChatMessageProps {
  isUser: boolean;
  message?: string;
  customContent?: React.ReactNode;
  senderIcon: React.ReactNode;
  senderColor: string;
  isLoading?: boolean;
}

export function ChatMessage({ isUser, message, customContent, senderIcon, senderColor, isLoading }: ChatMessageProps) {
  return (
    <div className={cn("flex", isUser && "flex-row-reverse")}>
      <div 
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center", 
          isUser ? "ml-2" : "mr-2",
          senderColor
        )}
      >
        {senderIcon}
      </div>
      
      <div 
        className={cn(
          "p-3 max-w-[90%] md:max-w-[80%]",
          isUser 
            ? "chat-bubble-user bg-primary text-primary-foreground" 
            : "chat-bubble-ai bg-muted"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 bg-current opacity-40 rounded-full animate-bounce"></div>
            <div className="h-1.5 w-1.5 bg-current opacity-60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="h-1.5 w-1.5 bg-current opacity-80 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        ) : customContent ? (
          <div className="text-sm">{customContent}</div>
        ) : (
          <p className="text-sm whitespace-pre-line">{message}</p>
        )}
      </div>
    </div>
  );
}
