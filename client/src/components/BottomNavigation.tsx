import { Link, useLocation } from "wouter";
import { Home, TrendingUp, AlertCircle, BookOpen, Pill, Brain, Calendar, Users, Settings, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/device", label: "Device", icon: Wifi },
  { href: "/alerts", label: "Alerts", icon: AlertCircle },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/medications", label: "Meds", icon: Pill },
  { href: "/insights", label: "Insights", icon: Brain },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/profile", label: "Profile", icon: Settings },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="flex items-center justify-around h-16 md:h-20 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-max transition-colors",
                  "hover:text-primary",
                  isActive
                    ? "text-primary border-t-2 border-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
