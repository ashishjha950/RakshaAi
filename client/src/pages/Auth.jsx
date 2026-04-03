import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // ── Demo account — works without backend ──────────────────────
        const DEMO_EMAIL = "user12@gmail.com";
        const DEMO_PASS = "1234";
        if (isLogin && email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASS) {
            const demoUser = {
                _id: "demo_user_001",
                name: "Priyanshu Kumar",
                email: DEMO_EMAIL,
                token: "demo_token_raksha_2026",
            };
            localStorage.setItem("token", demoUser.token);
            localStorage.setItem("user", JSON.stringify(demoUser));
            setMessage("✅ Welcome back, Priyanshu!");
            setTimeout(() => navigate("/"), 800);
            setIsLoading(false);
            return;
        }
        // ─────────────────────────────────────────────────────────────

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || (isLogin ? "Login successful!" : "Registration successful!"));
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    setTimeout(() => {
                        navigate("/");
                    }, 1000);
                }
            } else {
                setMessage(data.message || "Authentication failed");
            }
        } catch (error) {
            setMessage("Error connecting to server.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-display font-bold tracking-tight text-slate-900">
                        Raksha
                    </span>
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
                    <div className="flex justify-center mb-6 space-x-4 border-b border-slate-200 pb-4">
                        <button
                            onClick={() => { setIsLogin(true); setMessage(""); }}
                            className={`text-lg font-bold transition-colors ${isLogin ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setMessage(""); }}
                            className={`text-lg font-bold transition-colors ${!isLogin ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            Register
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login" : "register"}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-3xl font-display font-bold text-slate-900">
                                    {isLogin ? "Welcome Back" : "Create Account"}
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    {isLogin ? "Enter your email and password to continue" : "Join Raksha to ensure your safety"}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <div className="mt-1 relative rounded-xl shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-200 pr-3">
                                                <span className="text-slate-500 sm:text-sm font-medium">👤</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                className="flex-1 block w-full outline-none focus:ring-2 focus:ring-purple-500 min-w-0 rounded-xl sm:text-sm border-slate-200 py-3 pl-16 pr-4 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="mt-1 relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-200 pr-3">
                                            <span className="text-slate-500 sm:text-sm font-medium">✉️</span>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            className="flex-1 block w-full outline-none focus:ring-2 focus:ring-purple-500 min-w-0 rounded-xl sm:text-sm border-slate-200 py-3 pl-16 pr-4 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mt-1 relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-200 pr-3">
                                            <span className="text-slate-500 sm:text-sm font-medium">🔒</span>
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            className="flex-1 block w-full outline-none focus:ring-2 focus:ring-purple-500 min-w-0 rounded-xl sm:text-sm border-slate-200 py-3 pl-16 pr-4 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <p className={`text-sm font-medium ${message.includes("success") ? "text-emerald-500" : "text-rose-500"}`}>
                                        {message}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {isLoading ? 'Processing...' : (isLogin ? 'Login ->' : 'Register ->')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Auth;
