import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import NavigatorPage from "@/pages/navigator-page-new";
import AcademicChatbotPage from "@/pages/academic-chatbot-new";
import AdvancedChatbotPage from "@/pages/advanced-chatbot-page";
import ContentToolsPage from "@/pages/content-tools-page";
import ForumPage from "@/pages/forum-page";
import ProfilePage from "@/pages/profile-page";
import NewsPage from "@/pages/news-page";

function Router() {
  return (
    <div className="container-app">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/navigator" component={NavigatorPage} />
        <ProtectedRoute path="/academic-chatbot" component={AcademicChatbotPage} />
        <ProtectedRoute path="/advanced-chatbot" component={AdvancedChatbotPage} />
        <ProtectedRoute path="/content-tools" component={ContentToolsPage} />
        <ProtectedRoute path="/forum" component={ForumPage} />
        <ProtectedRoute path="/news" component={NewsPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
