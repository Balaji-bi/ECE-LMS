import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: string;
  title: string;
  color: string;
  onClick: () => void;
  active?: boolean;
}

export function ToolCard({ icon, title, color, onClick, active = false }: ToolCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg p-3 flex flex-col items-center text-center cursor-pointer transition-colors",
        active 
          ? `border-2 border-${color} bg-${color}/5`
          : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      <span className={`material-icons text-${color} text-2xl mb-2`}>{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
