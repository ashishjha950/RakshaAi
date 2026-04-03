import { Shield, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AppHeader = ({ mode, onModeChange }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>

        <span className="text-xl font-display font-bold tracking-tight text-slate-900">
          RAKSHA
          <span className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-700 bg-clip-text text-transparent">
            AI
          </span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {token && onModeChange && (
          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button
              
              onClick = {() => navigate("/sahayak")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === "external"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Sahayak
            </button>

            <button
             onClick={() => navigate("/gupt")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${mode === "internal"
                ? "bg-gradient-to-r from-violet-500 to-pink-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
                }`}
            >
              Gupt
            </button>
          </div>
        )}

        {token ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Register / Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default AppHeader;