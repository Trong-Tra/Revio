import { Link, useLocation } from "react-router-dom";

export function TopNav() {
  const location = useLocation();

  const navItems = [
    { name: "Research", path: "/" },
    { name: "AI Agents", path: "/settings" },
    { name: "Documentation", path: "/docs" },
    { name: "Upload", path: "/upload" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">
            Digital Atelier
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-sans text-sm tracking-tight">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={
                  location.pathname === item.path
                    ? "text-emerald-700 font-semibold border-b-2 border-emerald-700 pb-1"
                    : "text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-zinc-100 rounded-lg">
            <span className="material-symbols-outlined text-zinc-400 text-lg mr-2">search</span>
            <input
              type="text"
              placeholder="Search research..."
              className="bg-transparent border-none focus:ring-0 text-xs w-48"
            />
          </div>

          <button className="material-symbols-outlined text-zinc-500 hover:text-emerald-700 transition-colors">notifications</button>
          <button className="material-symbols-outlined text-zinc-500 hover:text-emerald-700 transition-colors">account_circle</button>
          <button className="hidden lg:block px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-700/20 rounded-full hover:bg-emerald-50 transition-colors">
            Sign In
          </button>
        </div>
      </div>
      <div className="bg-zinc-100 h-px w-full"></div>
    </header>
  );
}
