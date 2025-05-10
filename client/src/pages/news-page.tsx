import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { News } from "@shared/schema";
import { NewsCard } from "@/components/news/NewsCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RefreshCw, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function NewsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  // Fetch all news
  const { data: newsItems, isLoading: isLoadingNews } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });
  
  // Refresh news mutation
  const { mutate: refreshNews, isPending: isRefreshing } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/news/refresh", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "News refreshed",
        description: "Latest ECE news has been fetched and categorized",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to refresh news",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter news by category
  const filteredNews = activeTab === "all" 
    ? newsItems 
    : newsItems?.filter(item => 
        item.category?.toLowerCase() === activeTab.toLowerCase()
      );
  
  // Format time since news was published
  const formatTimeSince = (dateString: Date | null) => {
    if (!dateString) return "Unknown time";
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) { // Less than a day
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="ECE News" 
        onMenuClick={() => setIsSidebarOpen(true)}
        rightIcon={
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => refreshNews()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        }
      />
      
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium">ECE-NEWS-GPT</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered news aggregator for ECE students
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-gray-500">
              <p>🧠 This news is fetched from live, trusted sources and categorized by AI. No content is fabricated.</p>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Academic">Academic</TabsTrigger>
            <TabsTrigger value="Research">Research</TabsTrigger>
            <TabsTrigger value="Events">Events</TabsTrigger>
            <TabsTrigger value="Industry">Industry</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoadingNews ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews && filteredNews.length > 0 ? (
                  filteredNews.map((news, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge 
                            variant="outline"
                            className={`
                              ${news.category === 'Academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                              ${news.category === 'Research' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''}
                              ${news.category === 'Events' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                              ${news.category === 'Industry' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : ''}
                            `}
                          >
                            {news.category || 'News'}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatTimeSince(news.publishedAt)}</span>
                        </div>
                        
                        <h3 className="font-medium text-base mb-2">{news.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{news.content}</p>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{news.source || 'Unknown Source'}</span>
                          {news.url && (
                            <a 
                              href={news.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Read More
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No news found in this category</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => refreshNews()}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh News
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}