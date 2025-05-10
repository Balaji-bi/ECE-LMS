import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserActivity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface SettingsState {
  theme: string;
}

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    theme: theme,
  });
  
  // Update settings when theme changes
  useEffect(() => {
    setSettings(prev => ({...prev, theme}));
  }, [theme]);
  
  // Fetch user activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<UserActivity[]>({
    queryKey: ["/api/activities"],
  });
  
  // Save settings mutation
  const { mutate: saveSettings, isPending: isSavingSettings } = useMutation({
    mutationFn: async (settings: SettingsState) => {
      const res = await apiRequest("POST", "/api/settings", settings);
      return res.json();
    },
  });
  
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  const handleNotificationsToggle = () => {
    setSettings(prev => ({...prev, notifications: !prev.notifications}));
  };
  
  const handleFontSizeChange = (value: string) => {
    setSettings(prev => ({...prev, fontSize: value}));
  };
  
  const handleSaveSettings = () => {
    saveSettings(settings);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Format activity type for display
  const formatActivityType = (type: string) => {
    switch (type) {
      case "REGISTRATION":
        return "Account created";
      case "LOGIN":
        return "Logged in";
      case "LOGOUT":
        return "Logged out";
      case "CHAT":
        return "Used chatbot";
      case "CONTENT_TOOL":
        return "Used content tool";
      case "FORUM_POST":
        return "Created forum post";
      case "FORUM_REPLY":
        return "Replied to forum post";
      default:
        return type;
    }
  };
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "REGISTRATION":
        return <span className="material-icons text-primary p-1 bg-primary/10 rounded-full">person_add</span>;
      case "LOGIN":
      case "LOGOUT":
        return <span className="material-icons text-primary p-1 bg-primary/10 rounded-full">login</span>;
      case "CHAT":
        return <span className="material-icons text-primary p-1 bg-primary/10 rounded-full">chat</span>;
      case "CONTENT_TOOL":
        return <span className="material-icons text-accent p-1 bg-accent/10 rounded-full">description</span>;
      case "FORUM_POST":
      case "FORUM_REPLY":
        return <span className="material-icons text-green-500 p-1 bg-green-500/10 rounded-full">forum</span>;
      default:
        return <span className="material-icons text-primary p-1 bg-primary/10 rounded-full">info</span>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <PageHeader 
        title="Profile" 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      
      <div className="flex-1 p-4 space-y-4">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="bg-primary h-24 relative">
            <div className="absolute -bottom-12 left-4 w-24 h-24 rounded-full bg-card p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-2xl font-medium text-gray-500 dark:text-gray-300">
                  {user && getUserInitials(user.name)}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-14 pb-4">
            <h2 className="text-xl font-medium">{user?.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">@{user?.username}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="material-icons text-gray-500 mr-2 text-base">email</span>
                <span>{user?.email}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="material-icons text-gray-500 mr-2 text-base">badge</span>
                <span>{user?.rollNumber}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="material-icons text-gray-500 mr-2 text-base">school</span>
                <span>{user?.department}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="material-icons text-gray-500 mr-2 text-base">calendar_today</span>
                <span>{user?.year}{user?.year === 1 ? 'st' : user?.year === 2 ? 'nd' : user?.year === 3 ? 'rd' : 'th'} Year</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Recent Activity</h3>
            
            {isLoadingActivities ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActivityIcon(activity.activityType)}
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
            )}
          </CardContent>
        </Card>
        
        {/* Settings */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-gray-500 mr-3">dark_mode</span>
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={handleThemeToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-gray-500 mr-3">notifications</span>
                  <span className="text-sm">Notifications</span>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons text-gray-500 mr-3">font_download</span>
                  <span className="text-sm">Font Size</span>
                </div>
                <Select
                  value={settings.fontSize}
                  onValueChange={handleFontSizeChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full mt-2"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Settings"}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <span className="material-icons text-sm mr-2">logout</span>
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost"
                    className="w-full text-gray-500"
                  >
                    <span className="material-icons text-sm mr-2">delete</span>
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-accent hover:bg-accent/90">Delete Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNavigation />
    </div>
  );
}
