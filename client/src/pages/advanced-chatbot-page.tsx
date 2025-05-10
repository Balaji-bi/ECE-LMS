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

export default function AdvancedChatbotPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  
  // Helper function to enhance formula formatting in AI responses
  const enhanceFormulaFormatting = (content: string) => {
    if (!content) return content;
    
    // Handle responses that might be just plain text
    try {
      // Process strong tags for formula highlighting
      let enhancedContent = content;
      
      // Replace markdown-style bold mathematical expressions with styled formulas
      enhancedContent = enhancedContent.replace(
        /\*\*(.*?)\*\*/g, 
        '<div class="formula"><strong>$1</strong></div>'
      );
      
      // Replace HTML-style bold with formula style when they contain common math symbols
      enhancedContent = enhancedContent.replace(
        /<strong>([^<]*?[+\-*/=×÷∑∫√∂∆∇≈≠≤≥][^<]*?)<\/strong>/g,
        '<div class="formula"><strong>$1</strong></div>'
      );
      
      // Improve variable lists after formulas
      enhancedContent = enhancedContent.replace(
        /<ul>\s*<li><strong>([A-Za-z0-9]+)<\/strong>: (.*?)<\/li>/g,
        '<ul class="var-list"><li><strong>$1</strong>: $2</li>'
      );
      
      // Format step-by-step derivations
      enhancedContent = enhancedContent.replace(
        /<ol>\s*<li>(.*?)<strong>(.*?)<\/strong>(.*?)<\/li>/g,
        '<div class="derivation-steps"><div class="derivation-step">$1<div class="formula"><strong>$2</strong></div>$3</div>'
      );
      
      return enhancedContent;
    } catch (e) {
      // If any error occurs during processing, return original content
      return content;
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chatbot/advanced"],
  });
  
  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chatbot/advanced", { message });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/advanced"] });
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
        title="Advanced Assistant" 
        onMenuClick={() => setIsSidebarOpen(true)}
        rightIcon={
          <Link href="/academic-chatbot">
            <Button variant="ghost" size="icon" className="mr-2">
              <span className="material-icons">school</span>
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mr-3">
                <span className="material-icons">psychology</span>
              </div>
              <div>
                <h2 className="font-medium">Advanced Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explore beyond the syllabus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : (
            <>
              {/* Welcome message if no history */}
              {(!chatHistory || chatHistory.length === 0) && (
                <ChatMessageComponent
                  isUser={false}
                  message="Hello! I'm your Advanced Learning Assistant. I can help you explore topics beyond your syllabus, connect concepts across domains, and provide in-depth explanations. What would you like to discuss today?"
                  senderIcon={<span className="material-icons text-sm">psychology</span>}
                  senderColor="bg-green-500"
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
                    customContent={
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: enhanceFormulaFormatting(chat.response)
                        }} 
                      />
                    }
                    senderIcon={<span className="material-icons text-sm">psychology</span>}
                    senderColor="bg-green-500"
                  />
                </div>
              ))}
              
              {/* Loading indicator for new message */}
              {isSending && (
                <ChatMessageComponent
                  isUser={false}
                  message="Thinking..."
                  senderIcon={<span className="material-icons text-sm">psychology</span>}
                  senderColor="bg-green-500"
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
                placeholder="Explore advanced topics..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0"
                disabled={isSending}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="text-green-500 ml-2"
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
