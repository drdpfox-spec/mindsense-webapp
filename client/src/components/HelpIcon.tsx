import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface HelpIconProps {
  title: string;
  content: string;
  size?: "sm" | "md" | "lg";
}

export function HelpIcon({ title, content, size = "sm" }: HelpIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-full"
          aria-label="Help"
        >
          <HelpCircle className={sizeClasses[size]} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {content}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
