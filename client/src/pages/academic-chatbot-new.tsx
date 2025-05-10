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
import { Switch } from "@/components/ui/switch";
import { ChatMessage } from "@shared/schema";
import { ChatMessage as ChatMessageComponent } from "@/components/chatbot/ChatMessage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Copy, ImageIcon, Loader2, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Enhanced types for the academic chatbot
// We don't extend ChatMessage since we're overriding the response type
interface EnhancedChatMessage {
  id: number;
  userId: number;
  message: string;
  isAdvanced: boolean;
  createdAt: Date | null;
  response: string | {
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
  // Removed generateImage option as requested
  const [showResources, setShowResources] = useState(false);
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  
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
  
  // Helper function to explain source selection logic
  const getSourceExplanation = (
    knowledgeLevel?: string, 
    subject?: string, 
    book?: string, 
    showRecommendedResources?: boolean
  ): string => {
    // Handle "none" values as undefined for logic
    const kLevel = knowledgeLevel === "none" ? undefined : knowledgeLevel;
    const subj = subject === "none" ? undefined : subject;
    const bk = book === "none" ? undefined : book;
    
    if (kLevel) {
      // Cases with knowledge level selected
      if (subj && bk) {
        return "Using Internet + Specific book: This allows for comprehensive answers with textbook accuracy.";
      } else if (subj) {
        return "Using Internet + All books from selected subject: Providing broad curriculum coverage.";
      } else {
        return "Using Internet + All available books: Drawing from full knowledge base.";
      }
    } else {
      // Cases without knowledge level
      if (subj && bk) {
        return "Using only the selected book (no internet): Ensuring answers follow textbook exactly.";
      } else if (subj) {
        return "Using all books under selected subject (no internet): Following curriculum strictly.";
      } else if (bk) {
        return "Using only the selected book (no internet): Providing textbook-accurate responses.";
      } else {
        return "Using books related to the topic's subject: Selecting relevant curriculum materials.";
      }
    }
  };
  
  // Helper function to explain knowledge levels in detail
  const getKnowledgeLevelExplanation = (level: string): string => {
    switch(level) {
      case "R":
        return "Example: 'Define Ohm's Law and write its mathematical expression.' Focuses on basic recall of definitions, formulas, and concepts.";
      case "U":
        return "Example: 'Explain the significance of Ohm's Law in circuit analysis.' Emphasizes understanding meaning and interpreting concepts.";
      case "AP":
        return "Example: 'Use Ohm's Law to calculate the resistance in a circuit with 12V and 2A current.' Applies knowledge to solve problems.";
      case "AN":
        return "Example: 'Analyze how Ohm's Law relates to Kirchhoff's Laws.' Breaks down concepts and explores relationships between ideas.";
      case "E":
        return "Example: 'Evaluate the limitations of Ohm's Law in semiconductor materials.' Makes judgments based on criteria and standards.";
      case "C":
        return "Example: 'Design a circuit to demonstrate Ohm's Law with variable resistance.' Creates new ideas or approaches using existing knowledge.";
      default:
        return "";
    }
  };
  
  // Handle form submission and massage the data format
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isSending) {
      // Ensure we're sending properly formatted data to the backend
      sendMessage({
        topic,
        // Send undefined if none or missing - don't send empty string
        knowledgeLevel: knowledgeLevel && knowledgeLevel !== "none" ? knowledgeLevel : undefined,
        subject: subject && subject !== "none" ? subject : undefined,
        book: book && book !== "none" ? book : undefined,
        generateImage,
        showRecommendedResources: showResources,
        imageData
      });
      
      console.log("Sending query:", {
        topic,
        knowledgeLevel: knowledgeLevel && knowledgeLevel !== "none" ? knowledgeLevel : undefined,
        subject: subject && subject !== "none" ? subject : undefined,
        book: book && book !== "none" ? book : undefined,
        generateImage,
        showRecommendedResources: showResources,
        hasImage: !!imageData
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
  const renderChatbotResponse = (response: any) => {
    // Check if this is the new enhanced format (with metadata) or old string format
    if (typeof response === 'string') {
      // Legacy format - just display the string
      return (
        <div className="relative">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-line">{response}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-0 right-0"
            onClick={() => copyToClipboard(response)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    // Helper function to enhance formula formatting 
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
        
        // Create nicer spacing around equations with proper line breaks
        enhancedContent = enhancedContent.replace(
          /(<\/p>)\s*(<div class="formula">)/g,
          '$1<br />$2'
        );
        
        return enhancedContent;
      } catch (e) {
        // If any error occurs during processing, return original content
        return content;
      }
    };
    
    // New enhanced format with metadata
    return (
      <div className="relative">
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: enhanceFormulaFormatting(response.content) }} />
          
          {response.metadata?.imageUrl && (
            <div className="my-4 flex justify-center">
              <img 
                src={response.metadata.imageUrl} 
                alt={`Diagram for ${response.metadata.topic || 'topic'}`} 
                className="max-w-full rounded-lg border shadow-sm"
              />
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4 border-t pt-2">
            <p>
              This content is taken from{" "}
              {response.metadata?.sources?.usesInternet ? "Internet and Book resources" : "Book resources"}
            </p>
            {response.metadata?.sources?.bookSources?.length > 0 && (
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
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center">
              <span className="material-icons text-primary mr-2">school</span>
              Ask the Academic Assistant
            </CardTitle>
            <CardDescription>
              Provides syllabus-based responses with textbook references
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSendMessage}>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Question</Label>
                <Input
                  id="topic"
                  placeholder="Enter a topic name or specific question..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isSending}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="knowledge-level">Knowledge Level</Label>
                  <Select 
                    value={knowledgeLevel} 
                    onValueChange={setKnowledgeLevel}
                    disabled={isSending}
                  >
                    <SelectTrigger id="knowledge-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {knowledgeLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label} ({level.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {knowledgeLevel && knowledgeLevel !== "none" ? 
                      knowledgeLevels.find(k => k.value === knowledgeLevel)?.description :
                      "Select a level to determine the depth of the response"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={subject} 
                    onValueChange={(val) => {
                      setSubject(val);
                      // Reset book selection when subject changes
                      if (val !== subject) {
                        setBook(undefined);
                      }
                    }}
                    disabled={isSending}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {eceSubjects.map(subj => (
                        <SelectItem key={subj.value} value={subj.value}>
                          {subj.label} ({subj.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {subject && subject !== "none" ?
                      `${eceSubjects.find(s => s.value === subject)?.label} curriculum` :
                      "Leave blank to search across all subjects"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="book">Textbook Reference</Label>
                <Select 
                  value={book} 
                  onValueChange={setBook}
                  disabled={isSending || !subject || subject === "none"}
                >
                  <SelectTrigger id="book">
                    <SelectValue placeholder={subject && subject !== "none" ? "Select book" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="none" value="none">None</SelectItem>
                    {subject === "EC3251" && (
                      <SelectItem key="circuit-analysis" value="Engineering Circuit Analysis">
                        Engineering Circuit Analysis (Hayt, Kemmerly, Durbin)
                      </SelectItem>
                    )}
                    {subject === "PH3151" && (
                      <SelectItem key="physics" value="Engineering Physics">
                        Engineering Physics (Standard Textbook)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {book && book !== "none" ? 
                    "Response will prioritize this specific textbook" : 
                    "Leave blank to use all available books for the subject"}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3 space-y-3">
                <h3 className="text-sm font-medium">Response Options</h3>
                

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-resources">Recommended Resources</Label>
                    <p className="text-xs text-muted-foreground">
                      Include YouTube, papers, and courses
                    </p>
                  </div>
                  <Switch
                    id="show-resources"
                    checked={showResources}
                    onCheckedChange={setShowResources}
                    disabled={isSending}
                  />
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" type="button" onClick={triggerFileInput} className="w-full">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {imageData ? "Image Uploaded ✓" : "Upload Image (Optional)"}
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
                      Image will be analyzed along with your query
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3">
                <h3 className="text-sm font-medium flex items-center mb-2">
                  <span className="material-icons text-yellow-600 dark:text-yellow-400 mr-1 text-base">info</span>
                  Source Selection Logic
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getSourceExplanation(knowledgeLevel, subject, book, showResources)}
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-0">
              {knowledgeLevel && knowledgeLevel !== "none" && (
                <div className="text-xs text-gray-500">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        About {knowledgeLevels.find(k => k.value === knowledgeLevel)?.label} level
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <h4 className="font-medium mb-2">
                        {knowledgeLevels.find(k => k.value === knowledgeLevel)?.label} ({knowledgeLevel})
                      </h4>
                      <p className="text-sm mb-2">
                        {knowledgeLevels.find(k => k.value === knowledgeLevel)?.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {getKnowledgeLevelExplanation(knowledgeLevel)}
                      </div>
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
        </Card>
      </div>
      
      <BottomNavigation />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}