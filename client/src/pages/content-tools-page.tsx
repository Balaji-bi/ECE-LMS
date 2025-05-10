import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ToolCard } from "@/components/content-tools/ToolCard";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentToolsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assignment");
  
  // Assignment generator state
  const [assignmentData, setAssignmentData] = useState({
    topic: "",
    characterCount: "15000-20000",
    subject: "",
    book: "",
    difficulty: "Intermediate",
    dataSource: "books"
  });
  
  // Available books per subject mapping
  const subjectBooks: Record<string, string[]> = {
    "EC3251 - Circuit Analysis": ["Hayt Jack Kemmerly, Engineering Circuit Analysis", "Boylestad, Electronic Devices and Circuit Theory"],
    "EC8452 - Electronic Circuits II": ["Rashid, Microelectronic Circuits", "Sedra & Smith, Microelectronic Circuits"],
    "EC8451 - Electromagnetic Fields": ["Hayt & Buck, Engineering Electromagnetics", "David K. Cheng, Field and Wave Electromagnetics"]
  };
  
  // Research paper assistant state
  const [researchData, setResearchData] = useState({
    title: "",
    authors: "",
    institution: "",
    abstract: "",
    introduction: "",
    literatureSurvey: "",
    methodology: "",
    workingPrinciple: "",
    implementation: "",
    tabulation: "",
    challenges: "",
    results: "",
    conclusion: ""
  });
  
  // Resume builder state
  const [resumeData, setResumeData] = useState({
    name: user?.name || "",
    email: "",
    phone: "",
    linkedin: "",
    educationDetails: "",   // Institution, Degree, year, CGPA
    technicalDetails: "",   // Skills
    projectDetails: "",     // Project Title, technology used, description
    achievementDetails: "", // title, Description
    experienceDetails: "",  // Company Name, Position, Duration, Responsibilities
    languageDetails: "",    // Language, known (read, write, speak)
  });
  
  // Content rewriter state
  const [rewriteData, setRewriteData] = useState({
    content: "",
    style: "Academic",
  });
  
  // Assignment generator mutation
  const assignmentMutation = useMutation({
    mutationFn: async (data: typeof assignmentData) => {
      const res = await apiRequest("POST", "/api/content-tools/assignment", data);
      return res.json();
    },
  });
  
  // Research paper assistant mutation
  const researchMutation = useMutation({
    mutationFn: async (data: typeof researchData) => {
      const res = await apiRequest("POST", "/api/content-tools/research", data);
      return res.json();
    },
  });
  
  // Resume builder mutation
  const resumeMutation = useMutation({
    mutationFn: async (data: typeof resumeData) => {
      const res = await apiRequest("POST", "/api/content-tools/resume", data);
      return res.json();
    },
  });
  
  // Content rewriter mutation
  const rewriteMutation = useMutation({
    mutationFn: async (data: typeof rewriteData) => {
      const res = await apiRequest("POST", "/api/content-tools/rewrite", data);
      return res.json();
    },
  });
  
  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignmentMutation.mutate(assignmentData);
  };
  
  const handleResearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    researchMutation.mutate(researchData);
  };
  
  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resumeMutation.mutate(resumeData);
  };
  
  const handleRewriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rewriteMutation.mutate(rewriteData);
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Content Creation Tools" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-medium mb-2">AI-Powered Creation Tools</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generate and enhance your content with AI assistance</p>
            
            <div className="grid grid-cols-2 gap-3">
              <ToolCard 
                icon="assignment" 
                title="Assignment Generator" 
                color="primary" 
                onClick={() => setActiveTab("assignment")}
                active={activeTab === "assignment"}
              />
              
              <ToolCard 
                icon="description" 
                title="Research Paper Assistant" 
                color="accent" 
                onClick={() => setActiveTab("research")}
                active={activeTab === "research"}
              />
              
              <ToolCard 
                icon="person" 
                title="Resume Builder" 
                color="green-500" 
                onClick={() => setActiveTab("resume")}
                active={activeTab === "resume"}
              />
              
              <ToolCard 
                icon="autorenew" 
                title="Content Rewriter" 
                color="amber-500" 
                onClick={() => setActiveTab("rewrite")}
                active={activeTab === "rewrite"}
              />
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Assignment Generator */}
          <TabsContent value="assignment">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <span className="material-icons text-primary mr-2">assignment</span>
                  Assignment Generator
                </h3>
                
                <form onSubmit={handleAssignmentSubmit} className="space-y-3">
                  <div>
                    <Label>Topic Name</Label>
                    <Input 
                      placeholder="e.g., Operational Amplifiers" 
                      value={assignmentData.topic}
                      onChange={(e) => setAssignmentData({...assignmentData, topic: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Character Count Range</Label>
                    <Select
                      value={assignmentData.characterCount}
                      onValueChange={(value) => setAssignmentData({...assignmentData, characterCount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select character count range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15000-20000">15,000 - 20,000 characters</SelectItem>
                        <SelectItem value="20000-25000">20,000 - 25,000 characters</SelectItem>
                        <SelectItem value="25000-30000">25,000 - 30,000 characters</SelectItem>
                        <SelectItem value="30000-35000">30,000 - 35,000 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={assignmentData.subject}
                      onValueChange={(value) => {
                        setAssignmentData({
                          ...assignmentData, 
                          subject: value,
                          book: "" // Reset book selection when subject changes
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EC3251 - Circuit Analysis">EC3251 - Circuit Analysis</SelectItem>
                        <SelectItem value="EC8452 - Electronic Circuits II">EC8452 - Electronic Circuits II</SelectItem>
                        <SelectItem value="EC8451 - Electromagnetic Fields">EC8451 - Electromagnetic Fields</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Reference Book</Label>
                    <Select
                      value={assignmentData.book}
                      onValueChange={(value) => setAssignmentData({...assignmentData, book: value})}
                      disabled={!assignmentData.subject || !subjectBooks[assignmentData.subject]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!assignmentData.subject ? "Select a subject first" : "Select book reference"} />
                      </SelectTrigger>
                      <SelectContent>
                        {assignmentData.subject && 
                          subjectBooks[assignmentData.subject] ? 
                            subjectBooks[assignmentData.subject].map((book: string, index: number) => (
                              <SelectItem key={index} value={book}>{book}</SelectItem>
                            )) : 
                            <SelectItem value="no-books-available">No books available</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Difficulty Level</Label>
                    <RadioGroup
                      value={assignmentData.difficulty}
                      onValueChange={(value) => setAssignmentData({...assignmentData, difficulty: value})}
                      className="grid grid-cols-3 gap-2 mt-2"
                    >
                      <Label
                        htmlFor="basic"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Basic" id="basic" className="sr-only" />
                        <span className="text-sm">Basic</span>
                      </Label>
                      <Label
                        htmlFor="intermediate"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Intermediate" id="intermediate" className="sr-only" />
                        <span className="text-sm">Intermediate</span>
                      </Label>
                      <Label
                        htmlFor="hard"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Hard" id="hard" className="sr-only" />
                        <span className="text-sm">Hard</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label>Data Source</Label>
                    <RadioGroup
                      value={assignmentData.dataSource}
                      onValueChange={(value) => setAssignmentData({...assignmentData, dataSource: value})}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      <Label
                        htmlFor="internet"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="internet" id="internet" className="sr-only" />
                        <span className="text-sm">Internet</span>
                      </Label>
                      <Label
                        htmlFor="books"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="books" id="books" className="sr-only" />
                        <span className="text-sm">Books & Internet</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!assignmentData.topic || assignmentMutation.isPending}
                  >
                    {assignmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : "Generate Assignment"}
                  </Button>
                </form>
                
                {assignmentMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Generated Assignment</h4>
                    <div 
                      className="text-sm overflow-auto max-h-[600px] p-4 bg-white dark:bg-gray-800 rounded-md" 
                      dangerouslySetInnerHTML={{ 
                        __html: assignmentMutation.data.assignment
                          // Clean up any script tags for security
                          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                          // Remove code backticks that might be in the response
                          .replace(/```html|```/g, '')
                          // Add custom styling to formula containers
                          .replace(/<div class="formula">/g, '<div class="formula" style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin: 15px 0; font-family: \'Times New Roman\', Times, serif;">')
                          // Add styling to variable lists
                          .replace(/<ul class="var-list">/g, '<ul class="var-list" style="margin-left: 20px; margin-bottom: 20px; list-style-type: disc;">')
                          // Add styling to list items in variable lists
                          .replace(/<li><strong>/g, '<li style="margin-bottom: 5px;"><strong>')
                      }}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(assignmentMutation.data.assignment);
                          toast({
                            title: "Copied to clipboard",
                            description: "Assignment has been copied to clipboard"
                          });
                        }}
                      >
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Copy
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Create a blob with the assignment content and styling
                          const styleCSS = `
                          <style>
                            body {
                              font-family: Arial, sans-serif;
                              line-height: 1.6;
                              margin: 40px;
                              color: #333;
                            }
                            h1, h2, h3 {
                              color: #1a5fb4;
                              margin-top: 25px;
                            }
                            .formula {
                              background-color: #f9f9f9;
                              padding: 10px;
                              border-radius: 5px;
                              margin: 15px 0;
                              font-family: "Times New Roman", Times, serif;
                            }
                            .var-list {
                              margin-left: 20px;
                              margin-bottom: 20px;
                            }
                            .var-list li {
                              margin-bottom: 5px;
                            }
                            p {
                              text-align: justify;
                            }
                          </style>`;
                          
                          // Format the HTML content
                          const htmlContent = `
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Assignment: ${assignmentData.topic}</title>
                            ${styleCSS}
                          </head>
                          <body>
                            <h1 style="text-align: center;">Assignment: ${assignmentData.topic}</h1>
                            <div>${assignmentMutation.data.assignment}</div>
                          </body>
                          </html>`;
                          
                          const blob = new Blob([htmlContent], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          
                          // Create a temporary link and trigger download
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Assignment_${assignmentData.topic.replace(/\s+/g, '_')}.html`;
                          document.body.appendChild(a);
                          a.click();
                          
                          // Cleanup
                          setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 100);
                          
                          toast({
                            title: "Download started",
                            description: "Your assignment is being downloaded"
                          });
                        }}
                      >
                        <span className="material-icons text-sm mr-1">download</span>
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Research Paper Assistant */}
          <TabsContent value="research">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <span className="material-icons text-accent mr-2">description</span>
                  Research Paper Assistant
                </h3>
                
                <form onSubmit={handleResearchSubmit} className="space-y-3">
                  <div>
                    <Label>Paper Title</Label>
                    <Input 
                      placeholder="e.g., Advancements in 5G Technology for Smart City Applications" 
                      value={researchData.title}
                      onChange={(e) => setResearchData({...researchData, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Author(s)</Label>
                    <Input 
                      placeholder="e.g., John Doe, Jane Smith" 
                      value={researchData.authors}
                      onChange={(e) => setResearchData({...researchData, authors: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Institution</Label>
                    <Input 
                      placeholder="e.g., Anna University, Department of ECE" 
                      value={researchData.institution}
                      onChange={(e) => setResearchData({...researchData, institution: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Abstract</Label>
                    <Textarea 
                      placeholder="Provide a brief summary of the research paper (200-300 words)"
                      className="min-h-[80px]"
                      value={researchData.abstract}
                      onChange={(e) => setResearchData({...researchData, abstract: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Introduction</Label>
                    <Textarea 
                      placeholder="Briefly introduce your research topic and problem statement" 
                      value={researchData.introduction}
                      onChange={(e) => setResearchData({...researchData, introduction: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Literature Survey</Label>
                    <Textarea 
                      placeholder="Review relevant literature and existing research in this area" 
                      value={researchData.literatureSurvey}
                      onChange={(e) => setResearchData({...researchData, literatureSurvey: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Methodology</Label>
                    <Textarea 
                      placeholder="Describe your research methods (optional)" 
                      value={researchData.methodology}
                      onChange={(e) => setResearchData({...researchData, methodology: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Working Principle</Label>
                    <Textarea 
                      placeholder="Explain the working principles or theoretical framework (optional)" 
                      value={researchData.workingPrinciple}
                      onChange={(e) => setResearchData({...researchData, workingPrinciple: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Implementation</Label>
                    <Textarea 
                      placeholder="Describe your implementation or experimental setup (optional)" 
                      value={researchData.implementation}
                      onChange={(e) => setResearchData({...researchData, implementation: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Tabulation</Label>
                    <Textarea 
                      placeholder="Include tabular data or summarized experimental results (optional)"
                      value={researchData.tabulation}
                      onChange={(e) => setResearchData({...researchData, tabulation: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Challenges</Label>
                    <Textarea 
                      placeholder="Describe challenges faced during research and how they were addressed (optional)"
                      value={researchData.challenges}
                      onChange={(e) => setResearchData({...researchData, challenges: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Results</Label>
                    <Textarea 
                      placeholder="Describe the results of your research (optional)"
                      value={researchData.results}
                      onChange={(e) => setResearchData({...researchData, results: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Conclusion</Label>
                    <Textarea 
                      placeholder="Summarize your conclusions and future work (optional)"
                      value={researchData.conclusion}
                      onChange={(e) => setResearchData({...researchData, conclusion: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!researchData.title || researchMutation.isPending}
                  >
                    {researchMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Research Paper...
                      </>
                    ) : "Generate Research Paper"}
                  </Button>
                </form>
                
                {researchMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Generated Research Paper</h4>
                    <div className="whitespace-pre-line text-sm">
                      {researchMutation.data.research}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(researchMutation.data.research);
                          toast({
                            title: "Copied to clipboard",
                            description: "Research paper has been copied to clipboard"
                          });
                        }}
                      >
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Copy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Create plain text content for download
                          const plainText = researchMutation.data.research;
                          const blob = new Blob([plainText], {type: "text/plain"});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${researchData.title || "research-paper"}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          
                          // Cleanup
                          setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 100);
                          
                          toast({
                            title: "Download started",
                            description: "Your research paper is being downloaded as a text file"
                          });
                        }}
                      >
                        <span className="material-icons text-sm mr-1">download</span>
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Resume Builder */}
          <TabsContent value="resume">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <span className="material-icons text-green-500 mr-2">person</span>
                  Resume Builder
                </h3>
                
                <form onSubmit={handleResumeSubmit} className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3 mb-4">
                    <h4 className="text-sm font-medium mb-3">Personal Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Full Name</Label>
                        <Input 
                          value={resumeData.name}
                          onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                          placeholder="e.g., John Doe"
                        />
                      </div>
                      
                      <div>
                        <Label>Email</Label>
                        <Input 
                          value={resumeData.email}
                          onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                          placeholder="e.g., john.doe@example.com"
                          type="email"
                        />
                      </div>
                      
                      <div>
                        <Label>Phone Number</Label>
                        <Input 
                          value={resumeData.phone}
                          onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                          placeholder="e.g., +91 9876543210"
                        />
                      </div>
                      
                      <div>
                        <Label>LinkedIn (Optional)</Label>
                        <Input 
                          value={resumeData.linkedin}
                          onChange={(e) => setResumeData({...resumeData, linkedin: e.target.value})}
                          placeholder="e.g., linkedin.com/in/johndoe"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Education</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter each education item on a new line (Institution, Degree, Year, CGPA)</p>
                    
                    <Textarea 
                      placeholder="e.g., Anna University, B.E. in ECE, 2020-2024, 8.5 CGPA
MIT, M.Tech in Electronics, 2024-2026, 9.0 CGPA" 
                      value={resumeData.educationDetails}
                      onChange={(e) => setResumeData({...resumeData, educationDetails: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter all your technical skills separated by commas</p>
                    
                    <Textarea 
                      placeholder="e.g., Python, MATLAB, PCB Design, C++, VHDL, Embedded Systems, Circuit Design, Microcontrollers" 
                      value={resumeData.technicalDetails}
                      onChange={(e) => setResumeData({...resumeData, technicalDetails: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Projects</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter each project on a new line (Title, Technologies, Description)</p>
                    
                    <Textarea 
                      placeholder="e.g., IoT-based Home Automation System, Arduino & ESP8266, Designed and implemented a system to control home appliances via mobile app
Smart Energy Meter, Raspberry Pi & Python, Created a digital energy monitoring system for real-time consumption tracking" 
                      value={resumeData.projectDetails}
                      onChange={(e) => setResumeData({...resumeData, projectDetails: e.target.value})}
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Achievements (Optional)</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter each achievement on a new line (Title, Description)</p>
                    
                    <Textarea 
                      placeholder="e.g., Best Project Award, First prize in college technical symposium for IoT project
IEEE Paper Publication, Published research on advanced circuit design in IEEE journal" 
                      value={resumeData.achievementDetails}
                      onChange={(e) => setResumeData({...resumeData, achievementDetails: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Experience (Optional)</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter each experience on a new line (Company, Position, Duration, Responsibilities)</p>
                    
                    <Textarea 
                      placeholder="e.g., ABC Electronics, Summer Intern, May-Jul 2023, Developed embedded systems firmware and assisted in PCB design
XYZ Technologies, Project Trainee, Jan-Apr 2023, Worked on IoT device integration and sensor calibration" 
                      value={resumeData.experienceDetails}
                      onChange={(e) => setResumeData({...resumeData, experienceDetails: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">Languages (Optional)</h4>
                    <p className="text-xs text-muted-foreground mb-3">Enter each language on a new line (Language, Skills: read/write/speak)</p>
                    
                    <Textarea 
                      placeholder="e.g., English, Skills: read, write, speak
Tamil, Skills: read, write, speak
Hindi, Skills: read, speak" 
                      value={resumeData.languageDetails}
                      onChange={(e) => setResumeData({...resumeData, languageDetails: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!resumeData.name || !resumeData.email || !resumeData.phone || !resumeData.educationDetails || !resumeData.technicalDetails || !resumeData.projectDetails || resumeMutation.isPending}
                  >
                    {resumeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : "Generate Professional Resume"}
                  </Button>
                </form>
                
                {resumeMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Generated Professional Resume</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Create plain text content for download
                          const plainText = resumeMutation.data.resume;
                          const blob = new Blob([plainText], {type: "text/plain"});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${resumeData.name.trim() || "resume"}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          
                          // Cleanup
                          setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 100);
                          
                          toast({
                            title: "Download started",
                            description: "Your resume is being downloaded as a text file"
                          });
                        }}
                      >
                        <span className="material-icons text-sm mr-1">download</span>
                        Download
                      </Button>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {resumeMutation.data.resume}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Content Rewriter */}
          <TabsContent value="rewrite">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <span className="material-icons text-amber-500 mr-2">autorenew</span>
                  Content Rewriter
                </h3>
                
                <form onSubmit={handleRewriteSubmit} className="space-y-3">
                  <div>
                    <Label>Content to Rewrite</Label>
                    <Textarea 
                      placeholder="Paste your text here..." 
                      value={rewriteData.content}
                      onChange={(e) => setRewriteData({...rewriteData, content: e.target.value})}
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Target Style</Label>
                    <RadioGroup
                      value={rewriteData.style}
                      onValueChange={(value) => setRewriteData({...rewriteData, style: value})}
                      className="grid grid-cols-3 gap-2 mt-2"
                    >
                      <Label
                        htmlFor="academic"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Academic" id="academic" className="sr-only" />
                        <span className="text-sm">Academic</span>
                      </Label>
                      <Label
                        htmlFor="simplified"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Simplified" id="simplified" className="sr-only" />
                        <span className="text-sm">Simplified</span>
                      </Label>
                      <Label
                        htmlFor="professional"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Professional" id="professional" className="sr-only" />
                        <span className="text-sm">Professional</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!rewriteData.content || rewriteMutation.isPending}
                  >
                    {rewriteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rewriting...
                      </>
                    ) : "Rewrite Content"}
                  </Button>
                </form>
                
                {rewriteMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Rewritten Content</h4>
                    <div className="whitespace-pre-line text-sm">
                      {rewriteMutation.data.rewritten}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
