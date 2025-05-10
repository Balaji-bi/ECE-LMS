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
    subject: "",
    topic: "",
    type: "Questions",
    difficulty: 3,
  });
  
  // Research paper assistant state
  const [researchData, setResearchData] = useState({
    topic: "",
    type: "Outline",
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
                    <Label>Subject</Label>
                    <Select
                      value={assignmentData.subject}
                      onValueChange={(value) => setAssignmentData({...assignmentData, subject: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EC8395 - Communication Theory">EC8395 - Communication Theory</SelectItem>
                        <SelectItem value="EC8452 - Electronic Circuits II">EC8452 - Electronic Circuits II</SelectItem>
                        <SelectItem value="EC8491 - Communication Theory">EC8491 - Communication Theory</SelectItem>
                        <SelectItem value="MA8352 - Linear Algebra and Numeric Analysis">MA8352 - Linear Algebra and Numeric Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Topic/Unit</Label>
                    <Input 
                      placeholder="e.g., Amplitude Modulation" 
                      value={assignmentData.topic}
                      onChange={(e) => setAssignmentData({...assignmentData, topic: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Assignment Type</Label>
                    <RadioGroup
                      value={assignmentData.type}
                      onValueChange={(value) => setAssignmentData({...assignmentData, type: value})}
                      className="grid grid-cols-3 gap-2 mt-2"
                    >
                      <Label
                        htmlFor="questions"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Questions" id="questions" className="sr-only" />
                        <span className="text-sm">Questions</span>
                      </Label>
                      <Label
                        htmlFor="case-study"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Case Study" id="case-study" className="sr-only" />
                        <span className="text-sm">Case Study</span>
                      </Label>
                      <Label
                        htmlFor="project"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Project" id="project" className="sr-only" />
                        <span className="text-sm">Project</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Difficulty Level</Label>
                      <span className="text-sm">
                        {assignmentData.difficulty === 1 && "Easy"}
                        {assignmentData.difficulty === 2 && "Moderate"}
                        {assignmentData.difficulty === 3 && "Medium"}
                        {assignmentData.difficulty === 4 && "Challenging"}
                        {assignmentData.difficulty === 5 && "Difficult"}
                      </span>
                    </div>
                    <Slider
                      value={[assignmentData.difficulty]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => setAssignmentData({...assignmentData, difficulty: value[0]})}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!assignmentData.subject || !assignmentData.topic || assignmentMutation.isPending}
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
                    <Label>Research Topic</Label>
                    <Input 
                      placeholder="e.g., Advancements in 5G Technology" 
                      value={researchData.topic}
                      onChange={(e) => setResearchData({...researchData, topic: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>What do you need help with?</Label>
                    <RadioGroup
                      value={researchData.type}
                      onValueChange={(value) => setResearchData({...researchData, type: value})}
                      className="grid grid-cols-3 gap-2 mt-2"
                    >
                      <Label
                        htmlFor="outline"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Outline" id="outline" className="sr-only" />
                        <span className="text-sm">Outline</span>
                      </Label>
                      <Label
                        htmlFor="literature"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Literature Review" id="literature" className="sr-only" />
                        <span className="text-sm">Literature Review</span>
                      </Label>
                      <Label
                        htmlFor="methodology"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-2 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="Methodology" id="methodology" className="sr-only" />
                        <span className="text-sm">Methodology</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!researchData.topic || researchMutation.isPending}
                  >
                    {researchMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : `Generate ${researchData.type}`}
                  </Button>
                </form>
                
                {researchMutation.isSuccess && (
                  <div className="mt-6 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Generated Research Content</h4>
                    <div className="whitespace-pre-line text-sm">
                      {researchMutation.data.research}
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
