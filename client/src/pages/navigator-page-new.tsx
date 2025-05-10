import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Type definitions
type Semester = {
  semester: number;
  subjectCount: number;
};

type Subject = {
  code: string;
  name: string;
};

type Unit = {
  number: number;
  title: string;
};

type TopicDetails = {
  title: string;
  topics: string[];
};

type TopicContent = {
  subject: string;
  unit: string;
  topic: string;
  content: string;
};

// Progress tracking
type CompletedTopic = {
  code: string;
  unit: number;
  topic: number;
};

export default function NavigatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(-1);
  const [completedTopics, setCompletedTopics] = useState<CompletedTopic[]>([]);
  const [view, setView] = useState<"semesters" | "subjects" | "units" | "topics" | "content">("semesters");
  
  // Fetch semesters
  const { 
    data: semesters, 
    isLoading: isLoadingSemesters,
    error: semestersError
  } = useQuery<Semester[]>({
    queryKey: ["/api/syllabus"],
    enabled: view === "semesters"
  });
  
  // Fetch subjects for selected semester
  const {
    data: subjects,
    isLoading: isLoadingSubjects,
    error: subjectsError
  } = useQuery<Subject[]>({
    queryKey: [`/api/syllabus/semester/${selectedSemester}`],
    enabled: selectedSemester !== "" && selectedSemester !== "all" && view === "subjects"
  });
  
  // Fetch units for selected subject
  const {
    data: units,
    isLoading: isLoadingUnits,
    error: unitsError
  } = useQuery<Unit[]>({
    queryKey: [`/api/syllabus/subject/${selectedSubject?.code}`],
    enabled: !!selectedSubject && view === "units"
  });
  
  // Fetch topics for selected unit
  const {
    data: topicDetails,
    isLoading: isLoadingTopics,
    error: topicsError
  } = useQuery<TopicDetails>({
    queryKey: [`/api/syllabus/unit/${selectedSubject?.code}/${selectedUnit?.number}`],
    enabled: !!selectedSubject && !!selectedUnit && view === "topics"
  });
  
  // Fetch content for selected topic
  const {
    data: topicContent,
    isLoading: isLoadingContent,
    error: contentError
  } = useQuery<TopicContent>({
    queryKey: [`/api/syllabus/topic/${selectedSubject?.code}/${selectedUnit?.number}/${selectedTopicIndex}`],
    enabled: !!selectedSubject && !!selectedUnit && selectedTopicIndex >= 0 && view === "content"
  });
  
  // Set view based on selections
  useEffect(() => {
    if (selectedTopic !== null && selectedUnit && selectedSubject) {
      setView("content");
    } else if (selectedUnit && selectedSubject && selectedTopic === null) {
      setView("topics");
    } else if (selectedSubject && !selectedUnit) {
      setView("units");
    } else if (selectedSemester && selectedSemester !== "all" && !selectedSubject) {
      setView("subjects");
    } else {
      setView("semesters");
    }
  }, [selectedSemester, selectedSubject, selectedUnit, selectedTopic]);
  
  // Go to subjects list for a specific semester
  const handleSemesterSelect = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setSelectedTopicIndex(-1);
    setView("subjects");
  };
  
  // Go to units list for a specific subject
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setSelectedTopicIndex(-1);
    setView("units");
  };
  
  // Go to topics list for a specific unit
  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedTopic(null);
    setSelectedTopicIndex(-1);
    setView("topics");
  };
  
  // Go to content view for a specific topic
  const handleTopicSelect = (topic: string, index: number) => {
    setSelectedTopic(topic);
    setSelectedTopicIndex(index);
    setView("content");
  };
  
  // Mark a topic as completed
  const handleMarkAsCompleted = () => {
    if (selectedSubject && selectedUnit && selectedTopicIndex >= 0) {
      const newCompletedTopic: CompletedTopic = {
        code: selectedSubject.code,
        unit: selectedUnit.number,
        topic: selectedTopicIndex
      };
      
      if (!isTopicCompleted(newCompletedTopic)) {
        setCompletedTopics([...completedTopics, newCompletedTopic]);
        
        try {
          fetch("/api/syllabus/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCompletedTopic)
          });
        } catch (error) {
          console.error("Error marking topic as completed:", error);
        }
      }
    }
  };
  
  // Check if a topic is completed
  const isTopicCompleted = (topic: CompletedTopic | { code: string, unit: number, topic: number }) => {
    return completedTopics.some(
      t => t.code === topic.code && t.unit === topic.unit && t.topic === topic.topic
    );
  };
  
  // Navigation controls
  const goBack = () => {
    if (view === "content") {
      setSelectedTopic(null);
      setSelectedTopicIndex(-1);
      setView("topics");
    } else if (view === "topics") {
      setSelectedUnit(null);
      setView("units");
    } else if (view === "units") {
      setSelectedSubject(null);
      setView("subjects");
    } else if (view === "subjects") {
      setSelectedSemester("all");
      setView("semesters");
    }
  };
  
  // Breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => {
              setSelectedSemester("all");
              setSelectedSubject(null);
              setSelectedUnit(null);
              setSelectedTopic(null);
              setSelectedTopicIndex(-1);
              setView("semesters");
            }}>
              Syllabus
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {selectedSemester && selectedSemester !== "all" && (
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => {
                setSelectedSubject(null);
                setSelectedUnit(null);
                setSelectedTopic(null);
                setSelectedTopicIndex(-1);
                setView("subjects");
              }}>
                Semester {selectedSemester}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          
          {selectedSubject && (
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => {
                setSelectedUnit(null);
                setSelectedTopic(null);
                setSelectedTopicIndex(-1);
                setView("units");
              }}>
                {selectedSubject.code}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          
          {selectedUnit && (
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => {
                setSelectedTopic(null);
                setSelectedTopicIndex(-1);
                setView("topics");
              }}>
                UNIT {selectedUnit.number}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          
          {selectedTopic && (
            <BreadcrumbItem>
              <BreadcrumbLink>
                {selectedTopic}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };
  
  // Helper function to parse content sections
  const extractSectionContent = (content: string, section: string): string => {
    if (!content) return "";
    
    const sections = [
      "Detailed Explanation",
      "Key Formulas",
      "Visuals & Diagrams",
      "IEEE Paper References", 
      "Prerequisite & Related Topics"
    ];
    
    // For Detailed Explanation, we'll use a different approach
    if (section === "Detailed Explanation") {
      const startMarker = "Detailed Explanation";
      const endMarker = "**2. 🧮 Key Formulas**";
      
      const startPos = content.indexOf(startMarker);
      if (startPos === -1) return "";
      
      const endPos = content.indexOf(endMarker);
      if (endPos === -1) return content.slice(startPos + startMarker.length).trim();
      
      return content.slice(startPos + startMarker.length, endPos).trim();
    }
    
    // For other sections, use section markers
    let startMarker = "";
    let endMarker = "";
    
    switch(section) {
      case "Key Formulas":
        startMarker = "**2. 🧮 Key Formulas**";
        endMarker = "**3. 🖼️ Visuals & Diagrams**";
        break;
      case "Visuals & Diagrams":
        startMarker = "**3. 🖼️ Visuals & Diagrams**";
        endMarker = "**4. 🔗 IEEE Paper References**";
        break;
      case "IEEE Paper References":
        startMarker = "**4. 🔗 IEEE Paper References**";
        endMarker = "**5. 🧩 Prerequisite & Related Topics**";
        break;
      case "Prerequisite & Related Topics":
        startMarker = "**5. 🧩 Prerequisite & Related Topics**";
        endMarker = ""; // End of content
        break;
      default:
        return "";
    }
    
    const startPos = content.indexOf(startMarker);
    if (startPos === -1) return "";
    
    if (endMarker === "") {
      return content.slice(startPos + startMarker.length).trim();
    }
    
    const endPos = content.indexOf(endMarker);
    if (endPos === -1) return content.slice(startPos + startMarker.length).trim();
    
    return content.slice(startPos + startMarker.length, endPos).trim();
  };
  
  // Render content based on current view
  const renderContent = () => {
    if (isLoadingSemesters || isLoadingSubjects || isLoadingUnits || isLoadingTopics || isLoadingContent) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      );
    }
    
    if (semestersError || subjectsError || unitsError || topicsError || contentError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading the syllabus. Please try again.
          </AlertDescription>
        </Alert>
      );
    }
    
    switch (view) {
      case "semesters":
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 mb-1">Select a semester:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {semesters?.map((semester) => (
                <Button 
                  key={semester.semester}
                  variant="outline"
                  className="h-auto py-3"
                  onClick={() => handleSemesterSelect(semester.semester.toString())}
                >
                  <div className="text-center">
                    <h3 className="font-medium text-lg">Semester {semester.semester}</h3>
                    <p className="text-xs text-gray-500">{semester.subjectCount} Subjects</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );
        
      case "subjects":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Semester {selectedSemester} Subjects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects?.map((subject) => (
                <Button
                  key={subject.code}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <div className="text-left">
                    <h3 className="font-medium">{subject.code}</h3>
                    <p className="text-xs text-gray-500">{subject.name}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );
        
      case "units":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{selectedSubject?.code} - {selectedSubject?.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {units?.map((unit) => (
                <Button
                  key={unit.number}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleUnitSelect(unit)}
                >
                  <div className="text-left">
                    <h3 className="font-medium">UNIT {unit.number}</h3>
                    <p className="text-xs text-gray-500">{unit.title}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );
        
      case "topics":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">UNIT {selectedUnit?.number} - {selectedUnit?.title}</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <ul className="space-y-2">
                {topicDetails?.topics.map((topic, index) => (
                  <li key={index}>
                    <Button
                      variant={isTopicCompleted({
                        code: selectedSubject?.code || "", 
                        unit: selectedUnit?.number || 0, 
                        topic: index
                      }) ? "default" : "outline"}
                      className="w-full justify-start h-auto py-2 text-left"
                      onClick={() => handleTopicSelect(topic, index)}
                    >
                      <span className="mr-2">
                        {isTopicCompleted({
                          code: selectedSubject?.code || "", 
                          unit: selectedUnit?.number || 0, 
                          topic: index
                        }) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {topic}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case "content":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedTopic}</h2>
              
              <div className="flex space-x-2">
                <Button onClick={goBack} variant="outline" size="sm">
                  Back
                </Button>
                
                <Button 
                  onClick={handleMarkAsCompleted}
                  variant={isTopicCompleted({
                    code: selectedSubject?.code || "", 
                    unit: selectedUnit?.number || 0, 
                    topic: selectedTopicIndex
                  }) ? "outline" : "default"}
                  size="sm"
                >
                  {isTopicCompleted({
                    code: selectedSubject?.code || "", 
                    unit: selectedUnit?.number || 0, 
                    topic: selectedTopicIndex
                  }) ? (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    "Mark as Completed"
                  )}
                </Button>
              </div>
            </div>
            
            {topicContent && (
              <Tabs defaultValue="explanation" className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-5">
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  <TabsTrigger value="formulas">Formulas</TabsTrigger>
                  <TabsTrigger value="visuals">Visuals</TabsTrigger>
                  <TabsTrigger value="papers" className="hidden md:block">Papers</TabsTrigger>
                  <TabsTrigger value="related" className="hidden md:block">Related</TabsTrigger>
                </TabsList>
                
                <TabsContent value="explanation" className="rounded-md p-4 bg-gray-50 dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: extractSectionContent(topicContent.content, "Detailed Explanation").replace(/\n/g, '<br/>') }} />
                </TabsContent>
                
                <TabsContent value="formulas" className="rounded-md p-4 bg-gray-50 dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: extractSectionContent(topicContent.content, "Key Formulas").replace(/\n/g, '<br/>') }} />
                </TabsContent>
                
                <TabsContent value="visuals" className="rounded-md p-4 bg-gray-50 dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: extractSectionContent(topicContent.content, "Visuals & Diagrams").replace(/\n/g, '<br/>') }} />
                </TabsContent>
                
                <TabsContent value="papers" className="rounded-md p-4 bg-gray-50 dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: extractSectionContent(topicContent.content, "IEEE Paper References").replace(/\n/g, '<br/>') }} />
                </TabsContent>
                
                <TabsContent value="related" className="rounded-md p-4 bg-gray-50 dark:bg-gray-800 prose dark:prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: extractSectionContent(topicContent.content, "Prerequisite & Related Topics").replace(/\n/g, '<br/>') }} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const syllabusVisits = completedTopics.length;
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Syllabus Navigator" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            {renderBreadcrumbs()}
            {renderContent()}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}