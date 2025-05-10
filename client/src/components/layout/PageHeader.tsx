import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  onMenuClick: () => void;
  rightIcon?: React.ReactNode;
}

export function PageHeader({ title, onMenuClick, rightIcon }: PageHeaderProps) {
  const { user } = useAuth();
  
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="bg-card shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
      <button onClick={onMenuClick} className="p-1">
        <span className="material-icons">menu</span>
      </button>
      <h1 className="text-lg font-medium">{title}</h1>
      <div className="flex items-center space-x-2">
        {rightIcon}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
          {user && <span>{getUserInitials(user.name)}</span>}
        </Link>
      </div>
    </header>
  );
}
