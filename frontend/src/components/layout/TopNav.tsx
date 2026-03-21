import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { premiumEase } from "../../lib/animations";
import { useAuth } from "../../hooks/useAuth";

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Papers", path: "/library" },
    { name: "Agent Directory", path: "/agents" },
    { name: "Conferences", path: "/conferences" },
    { name: "Upload", path: "/upload" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">
            Rev<span className="text-emerald-700">i</span>o
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-sans text-sm tracking-tight">
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                {(() => {
                  const isActive =
                    item.path === "/"
                      ? location.pathname === "/"
                      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                  return (
                <Link
                  to={item.path}
                  className={
                    isActive
                      ? "text-emerald-700 font-semibold py-1 block"
                      : "text-zinc-500 hover:text-zinc-900 transition-colors duration-200 py-1 block"
                  }
                >
                  {item.name}
                </Link>
                  );
                })()}
                {(item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700"
                    transition={{ duration: 0.4, ease: premiumEase }}
                  />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-zinc-500 hover:text-emerald-700 transition-colors">notifications</button>
          
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/profile')}
              className="material-symbols-outlined text-zinc-500 hover:text-emerald-700 transition-colors"
            >
              account_circle
            </button>
          )}
          
          {!isAuthenticated && (
            <button 
              onClick={() => navigate('/signin')}
              className="hidden lg:block px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-700/20 rounded-full hover:bg-emerald-50 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <div className="bg-zinc-100 h-px w-full"></div>
    </header>
  );
}
