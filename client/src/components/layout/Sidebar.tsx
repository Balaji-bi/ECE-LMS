import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const { toggleTheme } = useTheme();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
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
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 ${isOpen ? 'block' : 'hidden'}`} 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-40 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sidebar-transition`}>
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {user && <span>{getUserInitials(user.name)}</span>}
            </div>
            <div>
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">home</span>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/navigator" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/navigator' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">menu_book</span>
                <span>Knowledge Navigator</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/academic-chatbot" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/academic-chatbot' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">school</span>
                <span>Academic Assistant</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/advanced-chatbot" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/advanced-chatbot' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">psychology</span>
                <span>Advanced Assistant</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/content-tools" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/content-tools' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">build</span>
                <span>Content Tools</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/forum" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/forum' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">forum</span>
                <span>Learning Forum</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/profile" 
                onClick={onClose}
                className={`flex items-center space-x-3 p-2 rounded ${location === '/profile' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <span className="material-icons">person</span>
                <span>Profile</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <button 
            onClick={toggleTheme} 
            className="flex items-center space-x-3 p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-icons">dark_mode</span>
            <span>Toggle Theme</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-3 p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-accent"
            disabled={logoutMutation.isPending}
          >
            <span className="material-icons">logout</span>
            <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
