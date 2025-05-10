import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ForumPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    category: string;
    createdAt: string;
    user: {
      id: number;
      username: string;
      name: string;
    };
    replyCount: number;
  };
}

export function ForumPost({ post }: ForumPostProps) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  
  // Fetch replies
  const fetchReplies = async () => {
    if (!showReplies && post.replyCount > 0) {
      setIsLoadingReplies(true);
      try {
        const response = await fetch(`/api/forum/posts/${post.id}`);
        if (!response.ok) throw new Error("Failed to fetch replies");
        const data = await response.json();
        setReplies(data.replies || []);
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };
  
  // Add reply mutation
  const { mutate: addReply, isPending: isAddingReply } = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/forum/posts/${post.id}/replies`, { content });
      return res.json();
    },
    onSuccess: (newReply) => {
      setReplies([...replies, newReply]);
      setReplyContent("");
      setShowReplyForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
  });
  
  const handleReply = () => {
    if (replyContent.trim()) {
      addReply(replyContent);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs">{getUserInitials(post.user.name)}</span>
          </div>
          <div>
            <h3 className="text-sm font-medium">{post.user.name}</h3>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)} · {post.category}</p>
          </div>
        </div>
        
        <h3 className="font-medium mb-2">{post.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{post.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Badge variant="outline" className="bg-primary/5">
              {post.category}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-gray-500"
            >
              <span className="material-icons text-sm mr-1">comment</span>
              {post.replyCount}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-primary font-medium"
              onClick={() => {
                if (!showReplyForm) {
                  setShowReplies(true);
                  fetchReplies();
                }
                setShowReplyForm(!showReplyForm);
              }}
            >
              Reply
            </Button>
          </div>
        </div>
      </CardContent>
      
      {showReplies && (
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          {isLoadingReplies ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">{getUserInitials(reply.user?.name || "Anonymous")}</span>
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <h4 className="text-xs font-medium mr-1">{reply.user?.name || "Anonymous"}</h4>
                      <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-gray-500">No replies yet. Be the first to reply!</p>
          )}
        </div>
      )}
      
      {showReplyForm && (
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <Textarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[100px] mb-2 bg-card"
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleReply}
              disabled={!replyContent.trim() || isAddingReply}
            >
              {isAddingReply ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Posting...
                </>
              ) : "Post Reply"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
