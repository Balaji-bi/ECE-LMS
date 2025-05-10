import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@shared/schema";
import { ChatMessage as ChatMessageComponent } from "@/components/chatbot/ChatMessage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AcademicChatbotPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chatbot/academic"],
  });
  
  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chatbot/academic", { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/academic"] });
      setMessage("");
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      sendMessage(message);
    }
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Academic Assistant" 
        onMenuClick={() => setIsSidebarOpen(true)}
        rightIcon={
          <Link href="/advanced-chatbot">
            <Button variant="ghost" size="icon" className="mr-2">
              <span className="material-icons">psychology</span>
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <span className="material-icons">school</span>
              </div>
              <div>
                <h2 className="font-medium">Academic Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions based on ECE syllabus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Welcome message if no history */}
              {(!chatHistory || chatHistory.length === 0) && (
                <ChatMessageComponent
                  isUser={false}
                  message="Hello! I'm your Academic Assistant, specialized in the Anna University ECE curriculum (21st regulation). How can I help you today?"
                  senderIcon={<span className="material-icons text-sm">school</span>}
                  senderColor="bg-primary"
                />
              )}
              
              {/* Chat history */}
              {chatHistory?.map((chat, index) => (
                <div key={index}>
                  <ChatMessageComponent
                    isUser={true}
                    message={chat.message}
                    senderIcon={<span>{user ? getUserInitials(user.name) : "U"}</span>}
                    senderColor="bg-accent"
                  />
                  <ChatMessageComponent
                    isUser={false}
                    message={chat.response}
                    senderIcon={<span className="material-icons text-sm">school</span>}
                    senderColor="bg-primary"
                  />
                </div>
              ))}
              
              {/* Loading indicator for new message */}
              {isSending && (
                <ChatMessageComponent
                  isUser={false}
                  message="Thinking..."
                  senderIcon={<span className="material-icons text-sm">school</span>}
                  senderColor="bg-primary"
                  isLoading={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="sticky bottom-0">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-2 flex items-center">
              <Input
                placeholder="Ask about ECE syllabus topics..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0"
                disabled={isSending}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="text-primary ml-2"
                disabled={!message.trim() || isSending}
              >
                <span className="material-icons">send</span>
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
