import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { News } from "@shared/schema";
import { NewsCard } from "@/components/news/NewsCard";

export default function HomePage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fetch news
  const { data: news, isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch chat messages count
  const { data: academicChats = [] } = useQuery<any[]>({
    queryKey: ["/api/chatbot/academic"],
    enabled: !!user,
  });
  
  const { data: advancedChats = [] } = useQuery<any[]>({
    queryKey: ["/api/chatbot/advanced"],
    enabled: !!user,
  });
  
  // Fetch forum posts count
  const { data: forumPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/forum/posts"],
    enabled: !!user,
  });
  
  // Combined chat count
  const totalChatCount = academicChats.length + advancedChats.length;
  
  // For syllabus visits, we'll count it as 0 for now (will implement tracking later)
  const syllabusVisits = 0;
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <PageHeader 
        title="ECE AI Learning Hub" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="desktop-grid">
        {/* Desktop Sidebar */}
        <div className="desktop-sidebar p-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <span className="text-xl font-bold">{getUserInitials(user?.name || "User")}</span>
                </div>
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.department} Student</p>
              </div>
              
              <div className="space-y-2">
                <Link href="/">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-gray-500">home</span>
                    <span>Home</span>
                  </div>
                </Link>
                <Link href="/navigator">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-primary">menu_book</span>
                    <span>Navigator</span>
                  </div>
                </Link>
                <Link href="/academic-chatbot">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-accent">school</span>
                    <span>Academic Bot</span>
                  </div>
                </Link>
                <Link href="/advanced-chatbot">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-blue-500">psychology</span>
                    <span>Advanced Bot</span>
                  </div>
                </Link>
                <Link href="/content-tools">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-green-500">build</span>
                    <span>Content Tools</span>
                  </div>
                </Link>
                <Link href="/forum">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-amber-500">forum</span>
                    <span>Forum</span>
                  </div>
                </Link>
                <Link href="/profile">
                  <div className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="material-icons mr-3 text-gray-500">person</span>
                    <span>Profile</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="desktop-main flex-1 p-4 space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-3">
                  <span className="material-icons">celebration</span>
                </div>
                <div>
                  <h2 className="font-medium">Welcome back!</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-2 md:grid-cols-4">
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Academic Chats</p>
                  <p className="text-lg font-medium text-primary">{academicChats.length}</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Advanced Chats</p>
                  <p className="text-lg font-medium text-green-500">{advancedChats.length}</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 text-center hidden md:block">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Forum Posts</p>
                  <p className="text-lg font-medium text-amber-500">{forumPosts.length}</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 text-center hidden md:block">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Syllabus Topics</p>
                  <p className="text-lg font-medium text-blue-500">{syllabusVisits}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* News Section */}
          <div>
            <h2 className="text-lg font-medium mb-3">ECE News & Updates</h2>
            
            <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
              {isLoadingNews ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="animate-pulse">
                      <CardContent className="h-32"></CardContent>
                    </Card>
                  ))}
                </>
              ) : news && news.length > 0 ? (
                news.map((newsItem) => (
                  <NewsCard key={newsItem.id} news={newsItem} />
                ))
              ) : (
                <Card className="md:col-span-3">
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">No news available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          

        </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
