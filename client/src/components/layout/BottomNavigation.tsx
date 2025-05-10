import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-gray-500";
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t dark:border-gray-800 flex justify-around items-center h-16 bottom-nav max-w-md mx-auto">
      <Link 
        href="/" 
        className={`${isActive("/")} flex flex-col items-center justify-center w-full`}
      >
        <span className="material-icons text-xl">home</span>
        <span className="text-xs">Home</span>
      </Link>
      
      <Link 
        href="/navigator" 
        className={`${isActive("/navigator")} flex flex-col items-center justify-center w-full`}
      >
        <span className="material-icons text-xl">menu_book</span>
        <span className="text-xs">Navigator</span>
      </Link>
      
      <Link 
        href="/academic-chatbot" 
        className={`${isActive("/academic-chatbot") || isActive("/advanced-chatbot") ? "text-primary" : "text-gray-500"} flex flex-col items-center justify-center w-full`}
      >
        <span className="material-icons text-xl">chat</span>
        <span className="text-xs">Assistant</span>
      </Link>
      
      <Link 
        href="/forum" 
        className={`${isActive("/forum")} flex flex-col items-center justify-center w-full`}
      >
        <span className="material-icons text-xl">forum</span>
        <span className="text-xs">Forum</span>
      </Link>
    </nav>
  );
}
