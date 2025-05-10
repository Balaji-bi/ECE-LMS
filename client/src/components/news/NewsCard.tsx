import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { News } from "@shared/schema";

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  // Format time since publication
  const formatTimeSince = (dateString: Date) => {
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
  
  // Get badge color based on category
  const getBadgeVariant = (category?: string) => {
    if (!category) return "bg-gray-200/80 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "research":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "events":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "industry":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-200/80 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            variant="outline" 
            className={getBadgeVariant(news.category)}
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
              className="text-primary hover:underline flex items-center gap-1"
            >
              Read More <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
