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
  
  useEffect(() => {
    if (topicContent) {
      console.log("Topic content loaded:", topicContent);
    }
  }, [topicContent]);
  
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
  
  // Function to generate an image for a section
  const [generatingImage, setGeneratingImage] = useState(false);
  const [sectionImages, setSectionImages] = useState<{[key: string]: string}>({});
  
  const generateImageForSection = async (section: string) => {
    if (!selectedTopic || !selectedSubject || generatingImage) return;
    
    try {
      setGeneratingImage(true);
      
      const prompt = `Create a educational diagram of ${selectedTopic} for ${selectedSubject?.name}`;
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
      
      const data = await response.json();
      
      setSectionImages(prev => ({
        ...prev,
        [section]: data.imageUrl
      }));
      
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setGeneratingImage(false);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semesters?.map((semester) => (
              <Card 
                key={semester.semester} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSemesterSelect(semester.semester.toString())}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Semester {semester.semester}</h3>
                    <p className="text-sm text-gray-500">{semester.subjectCount} Subjects</p>
                  </div>
                  <span className="material-icons">arrow_forward</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
        
      case "subjects":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Semester {selectedSemester} Subjects</h2>
            {subjects?.map((subject) => (
              <Card 
                key={subject.code} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSubjectSelect(subject)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{subject.code}</h3>
                    <p className="text-sm">{subject.name}</p>
                  </div>
                  <span className="material-icons">arrow_forward</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
        
      case "units":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{selectedSubject?.code} - {selectedSubject?.name}</h2>
            {units?.map((unit) => (
              <Card 
                key={unit.number} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleUnitSelect(unit)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">UNIT {unit.number}</h3>
                    <p className="text-sm">{unit.title}</p>
                  </div>
                  <span className="material-icons">arrow_forward</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );
        
      case "topics":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">UNIT {selectedUnit?.number} - {selectedUnit?.title}</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <ul className="space-y-3">
                {topicDetails?.topics.map((topic, index) => (
                  <li 
                    key={index} 
                    className="flex items-start space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer"
                    onClick={() => handleTopicSelect(topic, index)}
                  >
                    {isTopicCompleted({code: selectedSubject?.code || "", unit: selectedUnit?.number || 0, topic: index}) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <span className="material-icons text-gray-400 flex-shrink-0">article</span>
                    )}
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case "content":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{selectedTopic}</h2>
            
            <Tabs defaultValue="explanation" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="explanation">Explanation</TabsTrigger>
                <TabsTrigger value="formulas">🧮 Formulas</TabsTrigger>
                <TabsTrigger value="visualizations">🖼️ Visuals</TabsTrigger>
                <TabsTrigger value="references">🔗 References</TabsTrigger>
              </TabsList>
              
              <TabsContent value="explanation" className="mt-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h2 className="text-xl font-semibold mb-4">Detailed Explanation</h2>
                      {topicContent ? (
                        <div dangerouslySetInnerHTML={{
                          __html: extractSectionContent(topicContent.content, "Detailed Explanation")
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        }} />
                      ) : (
                        <p>Loading explanation...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="formulas" className="mt-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🧮</span>
                        Key Formulas
                      </h2>
                      {topicContent ? (
                        <div className="mt-4 leading-relaxed">
                          <div dangerouslySetInnerHTML={{
                            __html: extractSectionContent(topicContent.content, "Key Formulas")
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-lg text-primary">$1</strong>')
                              .replace(/\*\s(.*)/g, '<div class="mb-2">• $1</div>')
                              .replace(/\n\n/g, '<div class="mb-4"></div>')
                              .replace(/\n/g, '<br />')
                          }} />
                        </div>
                      ) : (
                        <p>Loading formulas...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="visualizations" className="mt-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                          <span className="mr-2">🖼️</span>
                          Visuals & Diagrams
                        </h2>
                        
                        {!sectionImages["visualizations"] && (
                          <Button 
                            size="sm"
                            onClick={() => generateImageForSection("visualizations")}
                            disabled={generatingImage}
                          >
                            {generatingImage ? 
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : 
                              <>Generate Diagram</>
                            }
                          </Button>
                        )}
                      </div>
                      
                      {sectionImages["visualizations"] && (
                        <div className="mt-4 mb-6 flex justify-center">
                          <img 
                            src={sectionImages["visualizations"]} 
                            alt={`Diagram for ${selectedTopic}`}
                            className="max-w-full border rounded-md shadow-md"
                          />
                        </div>
                      )}
                      
                      {topicContent && (
                        <div className="mt-4">
                          <div dangerouslySetInnerHTML={{
                            __html: extractSectionContent(topicContent.content, "Visuals & Diagrams")
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-primary">$1</strong>')
                              .replace(/\*\s(.*)/g, '<div class="mb-2">• $1</div>')
                              .replace(/\n\n/g, '<div class="mb-4"></div>')
                              .replace(/\n/g, '<br />')
                          }} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="references" className="mt-4">
                <Card>
                  <CardContent className="pt-6 pb-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🔗</span>
                        IEEE Paper References
                      </h2>
                      {topicContent ? (
                        <div dangerouslySetInnerHTML={{
                          __html: extractSectionContent(topicContent.content, "IEEE Paper References")
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-primary">$1</strong>')
                            .replace(/\*\s(.*)/g, '<div class="mb-2">• $1</div>')
                            .replace(/\n\n/g, '<div class="mb-4"></div>')
                            .replace(/\n/g, '<br />')
                        }} />
                      ) : (
                        <p>Loading references...</p>
                      )}
                      
                      <h2 className="text-xl font-semibold mt-8 mb-4 flex items-center">
                        <span className="mr-2">🧩</span>
                        Prerequisite & Related Topics
                      </h2>
                      {topicContent ? (
                        <div dangerouslySetInnerHTML={{
                          __html: extractSectionContent(topicContent.content, "Prerequisite & Related Topics")
                            .replace(/\*\*([^*]+)\*\*/g, '<h3 class="font-semibold mt-4 mb-2">$1</h3>')
                            .replace(/\*\s(.*)/g, '<div class="mb-2">• $1</div>')
                            .replace(/\n\n/g, '<div class="mb-4"></div>')
                            .replace(/\n/g, '<br />')
                        }} />
                      ) : (
                        <p>Loading prerequisites...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <Button onClick={goBack} variant="outline">
                <span className="material-icons mr-1">arrow_back</span>
                Back to Topics
              </Button>
              
              <Button 
                onClick={handleMarkAsCompleted}
                variant={isTopicCompleted({
                  code: selectedSubject?.code || "", 
                  unit: selectedUnit?.number || 0, 
                  topic: selectedTopicIndex
                }) ? "outline" : "default"}
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
                  <>
                    <span className="material-icons mr-1">check_circle</span>
                    Mark as Completed
                  </>
                )}
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Syllabus Navigator" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-medium mb-3">Anna University ECE Syllabus</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">21st Regulation Curriculum</p>
            
            <div className="space-y-4">
              {renderBreadcrumbs()}
              
              {view !== "content" && (
                <div className="relative">
                  <Input
                    placeholder="Search subjects, topics, or concepts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {renderContent()}
        </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}