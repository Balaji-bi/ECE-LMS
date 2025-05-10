import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { ForumPost } from "@/components/forum/ForumPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Post form schema
const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

type PostFormValues = z.infer<typeof postSchema>;

interface ForumPostWithDetails {
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
}

export default function ForumPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  
  // Fetch forum posts
  const { data: posts, isLoading } = useQuery<ForumPostWithDetails[]>({
    queryKey: ["/api/forum/posts"],
  });
  
  // New post form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "ECE General",
    },
  });
  
  // Create post mutation
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (data: PostFormValues) => {
      const res = await apiRequest("POST", "/api/forum/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setIsNewPostDialogOpen(false);
      form.reset();
    },
  });
  
  // Handle form submission
  const onSubmit = (data: PostFormValues) => {
    createPost(data);
  };
  
  // Filter posts based on filter and search query
  const filteredPosts = posts ? posts.filter(post => {
    const matchesFilter = filter === "all" || post.category.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) : [];
  
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <PageHeader 
        title="Learning Forum" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <span className="material-icons">forum</span>
              </div>
              <div>
                <h2 className="font-medium">ECE Discussion Forum</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Connect with peers and discuss topics</p>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm" 
                className="rounded-full"
                onClick={() => setFilter("all")}
              >
                All Topics
              </Button>
              <Button 
                variant={filter === "question" ? "default" : "outline"} 
                size="sm" 
                className="rounded-full"
                onClick={() => setFilter("question")}
              >
                Questions
              </Button>
              <Button 
                variant={filter === "resource" ? "default" : "outline"} 
                size="sm" 
                className="rounded-full"
                onClick={() => setFilter("resource")}
              >
                Resources
              </Button>
              <Button 
                variant={filter === "event" ? "default" : "outline"} 
                size="sm" 
                className="rounded-full"
                onClick={() => setFilter("event")}
              >
                Events
              </Button>
            </div>
            
            <div className="relative">
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <ForumPost key={post.id} post={post} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">forum</span>
                <h3 className="text-lg font-medium mb-1">No discussions found</h3>
                <p className="text-sm text-gray-500 mb-4">Be the first to start a discussion</p>
                <Button onClick={() => setIsNewPostDialogOpen(true)}>Create Post</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsNewPostDialogOpen(true)}
        className="fixed right-6 bottom-20 w-14 h-14 rounded-full shadow-lg p-0"
      >
        <span className="material-icons">add</span>
      </Button>
      
      {/* New Post Dialog */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your questions, insights, or resources with the ECE community
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts, questions, or insights..." 
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ECE General">ECE General</SelectItem>
                        <SelectItem value="Question">Question</SelectItem>
                        <SelectItem value="Resource">Resource</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Career">Career</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewPostDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : "Post"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
