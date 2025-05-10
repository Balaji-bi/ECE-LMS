import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Sample syllabus data
const syllabus = [
  {
    semester: 3,
    subjects: [
      {
        code: "MA8352",
        name: "Linear Algebra and Numeric Analysis",
        units: [
          "Matrices and Linear Systems",
          "Vector Spaces",
          "Inner Product Spaces",
          "Numerical Differentiation and Integration",
          "Numerical Solution of ODE"
        ]
      },
      {
        code: "EC8395",
        name: "Communication Theory",
        units: [
          "Amplitude Modulation",
          "Angle Modulation",
          "Pulse Modulation",
          "Digital Modulation",
          "Error Control Coding"
        ]
      }
    ]
  },
  {
    semester: 4,
    subjects: [
      {
        code: "EC8452",
        name: "Electronic Circuits II",
        units: [
          "Feedback Amplifiers",
          "Oscillators",
          "Tuned Amplifiers",
          "Wave Shaping Circuits",
          "Multivibrators"
        ]
      },
      {
        code: "EC8491",
        name: "Communication Theory",
        units: [
          "Linear Block Codes",
          "Convolutional Codes",
          "Information Theory",
          "Spread Spectrum Communication",
          "Multiple Access Techniques"
        ]
      }
    ]
  },
  {
    semester: 5,
    subjects: []
  }
];

export default function NavigatorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredSyllabus = selectedSemester === "all"
    ? syllabus
    : syllabus.filter(sem => sem.semester.toString() === selectedSemester);
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Knowledge Navigator" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-medium mb-3">Anna University ECE Syllabus</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">21st Regulation Curriculum</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Semester</span>
                <Select 
                  value={selectedSemester} 
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="relative">
              <Input
                placeholder="Search subjects, topics, or concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {filteredSyllabus.map((semester) => (
            <Card key={semester.semester} className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
                <h3 className="font-medium">Semester {semester.semester}</h3>
                <span className="material-icons">expand_more</span>
              </div>
              
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {semester.subjects.map((subject) => (
                    <AccordionItem key={subject.code} value={subject.code}>
                      <AccordionTrigger className="px-3 py-4 hover:no-underline">
                        <span className="font-medium text-left">{subject.code} - {subject.name}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Units</h4>
                            <ul className="mt-1 ml-5 text-sm text-gray-600 dark:text-gray-400 list-disc">
                              {subject.units.map((unit, index) => (
                                <li key={index}>{unit}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" className="text-xs flex items-center">
                              <span className="material-icons text-xs mr-1">play_circle</span>
                              Learn
                            </Button>
                            
                            <Link href="/academic-chatbot">
                              <Button size="sm" variant="outline" className="text-xs flex items-center">
                                <span className="material-icons text-xs mr-1">chat</span>
                                Ask Questions
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
