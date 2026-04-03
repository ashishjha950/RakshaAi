import { Bell, Search, CheckCircle, Bot, ScanFace, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AppTopBar = ({ onHamburger }) => {
  const [active, setActive] = useState(null); // "sahayak" | "gupt" | null
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const initial = (user?.name || user?.email || "U")[0].toUpperCase();

  const go = (page) => {
    setActive(page);
    navigate(`/${page}`);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Hamburger — visible only on mobile */}
        <button
          onClick={onHamburger}
          className="md:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Search — hidden on mobile */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search features, contacts..."
            className="bg-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm w-48 lg:w-72 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">

        {/* Sahayak / Gupt quick-launch toggle — hidden on very small screens */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 gap-0.5">
          <button
            onClick={() => go("sahayak")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${active === "sahayak"
              ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Sahayak
          </button>

          <button
            onClick={() => go("gupt")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${active === "gupt"
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
              }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            Gupt
          </button>
        </div>

        {/* Status — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">Protected</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors">
          <Bell className="w-4 h-4 text-slate-500" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center text-white font-display font-semibold text-sm">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;