import { Link, useLocation } from "wouter";
import { Home, TrendingUp, Smartphone, Bell, BookOpen, Lightbulb, User, Pill } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/trends", label: "Trends", icon: TrendingUp },
  { path: "/device", label: "Device", icon: Smartphone },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/medications", label: "Meds", icon: Pill },
  { path: "/insights", label: "Insights", icon: Lightbulb },
  { path: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="container max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] cursor-pointer ${
                    isActive
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
