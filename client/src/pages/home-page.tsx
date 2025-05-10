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
        title="ECE AI Learning Hub" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-6">
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
            
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Courses</p>
                <p className="text-lg font-medium text-primary">12</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-lg font-medium text-green-500">68%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* News Section */}
        <div>
          <h2 className="text-lg font-medium mb-3">ECE News & Updates</h2>
          
          <div className="space-y-4">
            {isLoadingNews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="animate-pulse">
                    <CardContent className="h-32"></CardContent>
                  </Card>
                ))}
              </div>
            ) : news && news.length > 0 ? (
              news.map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} />
              ))
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">No news available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Quick Access */}
        <div>
          <h2 className="text-lg font-medium mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/navigator">
              <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="material-icons text-primary text-2xl mb-2">menu_book</span>
                  <span className="text-sm font-medium">Syllabus Navigator</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/academic-chatbot">
              <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="material-icons text-accent text-2xl mb-2">school</span>
                  <span className="text-sm font-medium">Academic Assistant</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/content-tools">
              <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="material-icons text-green-500 text-2xl mb-2">build</span>
                  <span className="text-sm font-medium">Content Tools</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/forum">
              <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="material-icons text-amber-500 text-2xl mb-2">forum</span>
                  <span className="text-sm font-medium">Learning Forum</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
