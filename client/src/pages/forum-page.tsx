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
  likes: number;
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
      
      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 p-4">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block md:col-span-3 lg:col-span-2 mb-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                <div 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${filter === 'all' ? 'bg-primary/10' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <span className="material-icons mr-3 text-gray-500">forum</span>
                  <span>All Posts</span>
                </div>
                <div 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${filter === 'ECE General' ? 'bg-primary/10' : ''}`}
                  onClick={() => setFilter('ECE General')}
                >
                  <span className="material-icons mr-3 text-primary">category</span>
                  <span>ECE General</span>
                </div>
                <div 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${filter === 'Academics' ? 'bg-primary/10' : ''}`}
                  onClick={() => setFilter('Academics')}
                >
                  <span className="material-icons mr-3 text-blue-500">school</span>
                  <span>Academics</span>
                </div>
                <div 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${filter === 'Project Ideas' ? 'bg-primary/10' : ''}`}
                  onClick={() => setFilter('Project Ideas')}
                >
                  <span className="material-icons mr-3 text-green-500">lightbulb</span>
                  <span>Project Ideas</span>
                </div>
                <div 
                  className={`flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${filter === 'Career Advice' ? 'bg-primary/10' : ''}`}
                  onClick={() => setFilter('Career Advice')}
                >
                  <span className="material-icons mr-3 text-amber-500">work</span>
                  <span>Career Advice</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full" onClick={() => setIsNewPostDialogOpen(true)}>
                  <span className="material-icons mr-2">add</span>
                  New Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-9 lg:col-span-10 space-y-4">
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
              
              <div className="flex flex-col md:flex-row items-center gap-3 my-4">
                <Tabs 
                  defaultValue="all" 
                  value={filter}
                  onValueChange={setFilter}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid grid-cols-3 h-9">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="ECE General">ECE</TabsTrigger>
                    <TabsTrigger value="Academics">Academics</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex-1" />
                
                <Button
                  onClick={() => setIsNewPostDialogOpen(true)}
                  className="md:flex hidden"
                >
                  <span className="material-icons mr-2">add</span>
                  New Post
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
      </div>
      
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsNewPostDialogOpen(true)}
        className="fixed right-6 bottom-20 w-14 h-14 rounded-full shadow-lg p-0 md:hidden"
      >
        <span className="material-icons">add</span>
      </Button>
      
      {/* New Post Dialog */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your thoughts, questions, or insights with the ECE community
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
                        placeholder="Write your post content here..."
                        className="min-h-[120px]"
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