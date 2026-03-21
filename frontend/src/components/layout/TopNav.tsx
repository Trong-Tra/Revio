import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Settings, User } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

export function TopNav() {
  const location = useLocation();

  const navItems = [
    { name: "Discover", path: "/" },
    { name: "My Library", path: "/library" },
    { name: "Agent Settings", path: "/settings" },
    { name: "Documentation", path: "/docs" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-[20px] border-b border-outline-variant/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-label font-bold text-xl tracking-tight text-primary">
            The Digital Atelier
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-surface-container-high text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search papers, authors, agents..." 
              className="pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="text-on-surface-variant">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-on-surface-variant">
            <Settings className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-label font-bold text-sm ml-2 shadow-sm">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
