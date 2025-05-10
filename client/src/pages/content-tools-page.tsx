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
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ToolCard } from "@/components/content-tools/ToolCard";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function ContentToolsPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assignment");
  
  // Assignment generator state
  const [assignmentData, setAssignmentData] = useState({
    topic: "",
    wordCount: "15000-20000",
    subject: "",
    book: "",
    difficulty: "Intermediate",
    dataSource: "books"
  });
  
  // Research paper assistant state
  const [researchData, setResearchData] = useState({
    title: "",
    authors: "",
    institution: "",
    introduction: "",
    methodology: "",
    workingPrinciple: "",
    implementation: "",
    resultAndConclusion: ""
  });
  
  // Resume builder state
  const [resumeData, setResumeData] = useState({
    name: user?.name || "",
    education: "",
    skills: "",
    projects: "",
    experience: "",
    certifications: "",
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
                    <Label>Word Count Range</Label>
                    <Select
                      value={assignmentData.wordCount}
                      onValueChange={(value) => setAssignmentData({...assignmentData, wordCount: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select word count range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15000-20000">15,000 - 20,000 words</SelectItem>
                        <SelectItem value="20000-25000">20,000 - 25,000 words</SelectItem>
                        <SelectItem value="25000-30000">25,000 - 30,000 words</SelectItem>
                        <SelectItem value="30000-35000">30,000 - 35,000 words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subject (Optional)</Label>
                    <Select
                      value={assignmentData.subject}
                      onValueChange={(value) => setAssignmentData({...assignmentData, subject: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EC3251 - Linear Integrated Circuits">EC3251 - Linear Integrated Circuits</SelectItem>
                        <SelectItem value="EC8395 - Communication Theory">EC8395 - Communication Theory</SelectItem>
                        <SelectItem value="EC8452 - Electronic Circuits II">EC8452 - Electronic Circuits II</SelectItem>
                        <SelectItem value="EC8491 - Communication Theory">EC8491 - Communication Theory</SelectItem>
                        <SelectItem value="MA8352 - Linear Algebra and Numeric Analysis">MA8352 - Linear Algebra and Numeric Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Reference Book (Optional)</Label>
                    <Input 
                      placeholder="e.g., Engineering Circuit Analysis" 
                      value={assignmentData.book}
                      onChange={(e) => setAssignmentData({...assignmentData, book: e.target.value})}
                    />
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
                    <div className="whitespace-pre-line text-sm">
                      {assignmentMutation.data.assignment}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(assignmentMutation.data.assignment);
                          // You could add a toast notification here
                        }}
                      >
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Copy
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
                    <Label>Introduction</Label>
                    <Textarea 
                      placeholder="Briefly introduce your research topic and problem statement" 
                      value={researchData.introduction}
                      onChange={(e) => setResearchData({...researchData, introduction: e.target.value})}
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
                    <Label>Result and Conclusion</Label>
                    <Textarea 
                      placeholder="Summarize your findings and conclusions (optional)" 
                      value={researchData.resultAndConclusion}
                      onChange={(e) => setResearchData({...researchData, resultAndConclusion: e.target.value})}
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
                          // You could add a toast notification here
                        }}
                      >
                        <span className="material-icons text-sm mr-1">content_copy</span>
                        Copy
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
                
                <form onSubmit={handleResumeSubmit} className="space-y-3">
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      value={resumeData.name}
                      onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Education</Label>
                    <Textarea 
                      placeholder="e.g., B.Tech in ECE, Anna University (2020-2024)" 
                      value={resumeData.education}
                      onChange={(e) => setResumeData({...resumeData, education: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Technical Skills</Label>
                    <Textarea 
                      placeholder="e.g., MATLAB, Python, Verilog, PCB Design" 
                      value={resumeData.skills}
                      onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Projects</Label>
                    <Textarea 
                      placeholder="e.g., IoT-based Home Automation System, RF Signal Analyzer" 
                      value={resumeData.projects}
                      onChange={(e) => setResumeData({...resumeData, projects: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Work Experience (Optional)</Label>
                    <Textarea 
                      placeholder="e.g., Internship at XYZ Electronics (Summer 2023)" 
                      value={resumeData.experience}
                      onChange={(e) => setResumeData({...resumeData, experience: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Certifications (Optional)</Label>
                    <Textarea 
                      placeholder="e.g., CCNA, Embedded Systems Certification" 
                      value={resumeData.certifications}
                      onChange={(e) => setResumeData({...resumeData, certifications: e.target.value})}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!resumeData.name || !resumeData.education || !resumeData.skills || !resumeData.projects || resumeMutation.isPending}
                  >
                    {resumeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : "Generate Resume"}
                  </Button>
                </form>
                
                {resumeMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Generated Resume</h4>
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
