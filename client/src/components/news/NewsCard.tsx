import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { News } from "@shared/schema";

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = diffMs / 1000;
    const diffMins = diffSecs / 60;
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;
    
    if (diffSecs < 60) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${Math.floor(diffMins)} minutes ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 2) {
      return "Yesterday";
    } else {
      return `${Math.floor(diffDays)} days ago`;
    }
  };
  
  // Get badge color based on category
  const getBadgeVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case "department news":
        return "bg-primary/10 text-primary";
      case "academic alert":
        return "bg-accent/10 text-accent";
      case "event":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-200/80 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(news.publishedAt)}</span>
        <h3 className="font-medium mt-1 mb-2">{news.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{news.description}</p>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={getBadgeVariant(news.category)}>
            {news.category}
          </Badge>
          <Button variant="ghost" size="sm">
            <span className="material-icons text-sm">arrow_forward</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
