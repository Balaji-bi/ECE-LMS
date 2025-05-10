import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ChatMessage } from "@shared/schema";
import { ChatMessage as ChatMessageComponent } from "@/components/chatbot/ChatMessage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Copy, ImageIcon, Loader2, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Enhanced types for the academic chatbot
interface EnhancedChatMessage extends ChatMessage {
  response: {
    content: string;
    metadata: {
      topic: string;
      knowledgeLevel?: string;
      subject?: string;
      book?: string;
      imageUrl?: string;
      sources: {
        usesInternet: boolean;
        usesBookReferences: boolean;
        bookSources: string[];
      };
    };
  };
}

// Knowledge levels
const knowledgeLevels = [
  { value: "R", label: "Remember", description: "Recall facts and basic concepts" },
  { value: "U", label: "Understand", description: "Explain ideas or concepts" },
  { value: "AP", label: "Apply", description: "Use information in new situations" },
  { value: "AN", label: "Analyze", description: "Connect ideas and break them into parts" },
  { value: "E", label: "Evaluate", description: "Justify a stand or decision" },
  { value: "C", label: "Create", description: "Produce new or original work" },
];

// ECE subjects (can be expanded)
const eceSubjects = [
  { value: "EC3251", label: "Circuit Analysis" },
  { value: "PH3151", label: "Engineering Physics" },
  // Add more subjects as needed
];

export default function AcademicChatbotPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState<string | undefined>(undefined);
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [book, setBook] = useState<string | undefined>(undefined);
  const [generateImage, setGenerateImage] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("simple");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<EnhancedChatMessage[]>({
    queryKey: ["/api/chatbot/academic"],
  });
  
  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (query: { 
      topic: string; 
      knowledgeLevel?: string; 
      subject?: string; 
      book?: string;
      generateImage: boolean;
      showRecommendedResources: boolean;
      imageData?: string;
    }) => {
      const res = await apiRequest("POST", "/api/chatbot/academic", query);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/academic"] });
      setTopic("");
      setImageData(undefined);
    },
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isSending) {
      sendMessage({
        topic,
        knowledgeLevel,
        subject,
        book,
        generateImage,
        showRecommendedResources: showResources,
        imageData
      });
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Extract just the base64 data part
        const base64Content = base64data.split(',')[1];
        setImageData(base64Content);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could show a toast here
        console.log("Text copied to clipboard");
      })
      .catch(err => {
        console.error("Error copying text: ", err);
      });
  };
  
  // Render enhanced chatbot response
  const renderChatbotResponse = (response: EnhancedChatMessage['response']) => {
    return (
      <div className="relative">
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: response.content }} />
          
          {response.metadata.imageUrl && (
            <div className="my-4 flex justify-center">
              <img 
                src={response.metadata.imageUrl} 
                alt={`Diagram for ${response.metadata.topic}`} 
                className="max-w-full rounded-lg border shadow-sm"
              />
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4 border-t pt-2">
            <p>
              This content is taken from{" "}
              {response.metadata.sources.usesInternet ? "Internet and Book resources" : "Book resources"}
            </p>
            {response.metadata.sources.bookSources.length > 0 && (
              <p className="mt-1">
                <strong>Sources:</strong>{" "}
                {response.metadata.sources.bookSources.join(", ")}
              </p>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-0 right-0"
          onClick={() => copyToClipboard(response.content)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    );
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expert on ECE syllabus with textbook-based learning
                </p>
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
                  message={`Hello! I'm your Academic Assistant for the ECE curriculum. I provide structured, textbook-based responses formatted like mini research papers. Ask me about any topic in the syllabus!`}
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
                    customContent={renderChatbotResponse(chat.response)}
                    senderIcon={<span className="material-icons text-sm">school</span>}
                    senderColor="bg-primary"
                  />
                </div>
              ))}
              
              {/* Loading indicator for new message */}
              {isSending && (
                <ChatMessageComponent
                  isUser={false}
                  message="Researching this topic..."
                  senderIcon={<span className="material-icons text-sm">school</span>}
                  senderColor="bg-primary"
                  isLoading={true}
                />
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <Card className="border-0 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="space-y-4">
              <form onSubmit={handleSendMessage}>
                <CardContent className="pt-4 pb-2">
                  <div className="flex items-center">
                    <Input
                      placeholder="Enter topic or question..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="flex-1 border-0 focus-visible:ring-0"
                      disabled={isSending}
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary ml-2"
                      disabled={!topic.trim() || isSending}
                    >
                      <span className="material-icons">send</span>
                    </Button>
                  </div>
                </CardContent>
              </form>
            </TabsContent>
            
            <TabsContent value="advanced">
              <form onSubmit={handleSendMessage}>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="Enter a topic name or question..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="knowledge-level">Knowledge Level (optional)</Label>
                      <Select 
                        value={knowledgeLevel} 
                        onValueChange={setKnowledgeLevel}
                        disabled={isSending}
                      >
                        <SelectTrigger id="knowledge-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {knowledgeLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label} ({level.value}) - {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject (optional)</Label>
                      <Select 
                        value={subject} 
                        onValueChange={setSubject}
                        disabled={isSending}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {eceSubjects.map(subj => (
                            <SelectItem key={subj.value} value={subj.value}>
                              {subj.label} ({subj.value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="book">Book (optional)</Label>
                    <Select 
                      value={book} 
                      onValueChange={setBook}
                      disabled={isSending || !subject}
                    >
                      <SelectTrigger id="book">
                        <SelectValue placeholder={subject ? "Select book" : "Select subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {subject === "EC3251" && (
                          <SelectItem value="Engineering Circuit Analysis">
                            Engineering Circuit Analysis (Hayt, Kemmerly, Durbin)
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="gen-image">Generate Image</Label>
                        <p className="text-sm text-muted-foreground">
                          Generate diagrams for the topic
                        </p>
                      </div>
                      <Switch
                        id="gen-image"
                        checked={generateImage}
                        onCheckedChange={setGenerateImage}
                        disabled={isSending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-resources">Learning Resources</Label>
                        <p className="text-sm text-muted-foreground">
                          Include YouTube videos, papers, etc.
                        </p>
                      </div>
                      <Switch
                        id="show-resources"
                        checked={showResources}
                        onCheckedChange={setShowResources}
                        disabled={isSending}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" type="button" onClick={triggerFileInput} className="w-full">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {imageData ? "Image Uploaded" : "Upload Image (Optional)"}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {imageData && (
                      <p className="text-xs text-green-600 mt-1">
                        Image uploaded successfully
                      </p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  {knowledgeLevel && (
                    <div className="text-xs text-gray-500">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            What does {knowledgeLevels.find(k => k.value === knowledgeLevel)?.label} mean?
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <h4 className="font-medium mb-2">
                            {knowledgeLevels.find(k => k.value === knowledgeLevel)?.label} ({knowledgeLevel})
                          </h4>
                          <p className="text-sm">
                            {knowledgeLevels.find(k => k.value === knowledgeLevel)?.description}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  
                  <Button 
                    type="submit"
                    className="ml-auto"
                    disabled={!topic.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Submit</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
