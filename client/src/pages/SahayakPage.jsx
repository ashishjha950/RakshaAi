import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Layers, ArrowLeft, Send, Mic, MicOff, AlertTriangle,
    Camera, MapPin, MessageSquare, ChevronRight, Sparkles,
    Shield, X, Navigation, Phone, FileText, RefreshCw,
    Radio, Zap
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// SahayakPage — AI Wingman with Internal & External modes
// Internal: AI-powered safety chat assistant (rule-based, no API)
// External: Floating quick-action overlay for SOS, Evidence, Location
// ─────────────────────────────────────────────────────────────────────

const API = "http://localhost:3000/api";
const GREET = "Namaste 🙏 I'm Sahayak, your AI Safety Wingman. I can help you:\n• Write an incident report\n• Get safety advice\n• Prepare an SOS message\n• Guide you through any emergency\n\nWhat do you need help with today?";

// ── Rule-based AI Responder ──────────────────────────────────────────
const getAIReply = (msg) => {
    const m = msg.toLowerCase().trim();

    if (/incident|report|write|happened|describe/.test(m)) {
        return `📝 **Incident Report Template**\n\nHere's what to include:\n\n1. **Date & Time**: ${new Date().toLocaleString("en-IN")}\n2. **Location**: Where did it happen?\n3. **Description**: What exactly happened?\n4. **People involved**: Describe them (appearance, vehicle, etc.)\n5. **Witnesses**: Were there any?\n6. **Your response**: What did you do?\n\nWould you like me to help you fill this out step by step?`;
    }

    if (/sos|emergency|help|danger|scared|attack|unsafe/.test(m)) {
        return `🚨 **Emergency Help**\n\nRight now:\n• **Police**: Call 100\n• **Women Helpline**: Call 1091\n• **Ambulance**: Call 108\n\n**In the app:**\n1. Go to **SOS Triggers** to alert your Inner Circle\n2. Go to **Evidence Capture** to record proof\n3. Enable **Gupt Mode** to record discreetly\n\nAre you in immediate danger? Say "yes" and I'll walk you through the fastest steps.`;
    }

    if (/yes|immediate|now|right now/.test(m)) {
        return `🔴 **IMMEDIATE STEPS**\n\n1. **Stay calm** — you can do this\n2. **Move to a public/crowded area** if possible\n3. Open the **SOS page** in this app → alert your circle\n4. **Call 112** (national emergency)\n5. **Scream/make noise** to draw attention\n\nI'm here. What else can I help with?`;
    }

    if (/safety|safe|tip|advice|precaution/.test(m)) {
        return `🛡️ **Safety Tips for Women**\n\n• Share your live location with a trusted contact when going out\n• Keep your Inner Circle updated with trusted contacts\n• Use **Gupt Mode** when you feel watched\n• Enable **SOS Voice Watch** in Evidence page — keyword detection runs silently\n• Keep emergency numbers on speed dial: 100 (Police), 1091 (Women)\n• Trust your instincts — if something feels wrong, leave immediately`;
    }

    if (/location|track|share|where/.test(m)) {
        return `📍 **Location Sharing**\n\nYou can:\n• Go to **Safe Journey** → Start journey → Your Inner Circle gets your route\n• Share your current coordinates manually via the SOS page\n• Enable live tracking during a Safe Journey\n\nWant me to guide you to the Safe Journey page?`;
    }

    if (/evidence|record|proof|video|audio|photo/.test(m)) {
        return `📸 **Evidence Collection**\n\nGo to **Evidence Capture** to:\n• Take a **silent photo** (no shutter sound)\n• **Record audio** silently\n• **Record video** with live preview\n• Write an **Incident Note** with all details\n\nAll evidence is encrypted and saved to Cloudinary. You can also enable **SOS Voice Watch** to automatically record when danger keywords are spoken.`;
    }

    if (/hello|hi|hey|namaste/.test(m)) {
        return `Hello! 👋 I'm Sahayak, your personal AI Safety Wingman.\n\nI can help you with:\n• **Emergency guidance** — step-by-step help in danger\n• **Safety tips** — precautions and best practices\n• **Incident reports** — document what happened\n• **App features** — guide you through Raksha tools\n\nWhat do you need?`;
    }

    if (/fear|afraid|anxious|nervous|worried/.test(m)) {
        return `💙 I hear you. It's okay to feel scared — your feelings are valid.\n\nHere's what you can do right now:\n1. Take 3 slow, deep breaths\n2. Tell someone you trust — open the **Inner Circle** and reach out\n3. Move to a place with more people around you\n4. If needed, use the **SOS** feature to alert your circle silently\n\nYou're not alone. What's worrying you?`;
    }

    if (/gupt|disguise|stealth|hide/.test(m)) {
        return `🕵️ **Gupt (Stealth Shield)**\n\nGupt disguises this app as a Calculator or Wellness Tracker while:\n• Recording your screen silently\n• Listening for SOS keywords (sos, help, danger, bachao…)\n• Sending automatic alerts to your Inner Circle when keywords detected\n\nAccess it via **Gupt** in the sidebar. Type PIN **1234** to exit the disguise.`;
    }

    return `I'm not sure about that specific question, but I'm here to help with your safety. Try asking me about:\n• "Write an incident report"\n• "Give me safety tips"\n• "How do I use Evidence Capture?"\n• "What to do in an emergency?"`;
};

// ── Internal Mode — AI Chat ─────────────────────────────────────────
const InternalMode = ({ onBack }) => {
    const [messages, setMessages] = useState([
        { id: "0", from: "ai", text: GREET }
    ]);
    const [input, setInput] = useState("");
    const [listening, setListening] = useState(false);
    const [thinking, setThinking] = useState(false);
    const recognitionRef = useRef(null);
    const bottomRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    const sendMessage = useCallback((text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now().toString(), from: "user", text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setThinking(true);

        setTimeout(() => {
            const reply = getAIReply(text);
            setMessages(prev => [...prev, { id: Date.now().toString() + "_ai", from: "ai", text: reply }]);
            setThinking(false);

            // Navigation triggers
            if (/guide you to safe journey|go to safe journey/i.test(reply)) navigate("/safe-journey");
        }, 800 + Math.random() * 400);
    }, [navigate]);

    const toggleVoice = () => {
        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert("Voice not supported. Use Chrome."); return; }
        const r = new SR(); r.lang = "en-IN"; r.interimResults = false;
        recognitionRef.current = r;
        r.onstart = () => setListening(true);
        r.onend = () => setListening(false);
        r.onerror = () => setListening(false);
        r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); };
        r.start();
    };

    const quickActions = [
        { label: "Emergency Steps", icon: AlertTriangle },
        { label: "Write Incident Report", icon: FileText },
        { label: "Safety Tips", icon: Shield },
        { label: "How to use Gupt?", icon: Radio },
    ];

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-[calc(100vh-6rem)] max-h-[820px]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-400/30">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-sm">Sahayak AI</h2>
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />Online · Safety Wingman</p>
                    </div>
                </div>
                <button onClick={() => setMessages([{ id: "0", from: "ai", text: GREET }])}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 flex-wrap">
                {quickActions.map(a => (
                    <button key={a.label} onClick={() => sendMessage(a.label)}
                        className="flex items-center gap-1.5 text-[11px] font-medium bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded-full transition-all shadow-sm">
                        <a.icon className="w-3 h-3" />{a.label}
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 shadow-inner">
                {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.from === "ai" && (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm
              ${msg.from === "user"
                                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-tr-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"}`}>
                            {msg.from === "ai" ? (
                                <span dangerouslySetInnerHTML={{
                                    __html: msg.text
                                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                        .replace(/•/g, "•")
                                }} />
                            ) : msg.text}
                        </div>
                    </motion.div>
                ))}
                {thinking && (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Row */}
            <div className="flex gap-2 mt-3">
                <button onClick={toggleVoice}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${listening ? "bg-red-500 shadow-lg shadow-red-400/40 ring-2 ring-red-200" : "bg-slate-100 hover:bg-slate-200"}`}>
                    {listening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-slate-500" />}
                </button>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                    placeholder={listening ? "Listening… speak now" : "Type your message or question…"}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 transition-all"
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-400/30 hover:shadow-lg transition-all disabled:opacity-40 active:scale-95">
                    <Send className="w-4 h-4 text-white" />
                </button>
            </div>
        </motion.div>
    );
};

// ── External Mode — Floating Quick-Action Overlay ────────────────────
const ExternalMode = ({ onBack }) => {
    const navigate = useNavigate();
    const [sosSent, setSosSent] = useState(false);
    const [locShared, setLocShared] = useState(false);
    const [recActive, setRecActive] = useState(false);
    const [recTimer, setRecTimer] = useState(0);
    const timerRef = useRef(null);
    const recRef = useRef(null);
    const chunksRef = useRef([]);

    const sendSOS = async () => {
        try {
            let coords = null;
            try {
                const p = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }));
                coords = { lat: p.coords.latitude, lng: p.coords.longitude };
            } catch { /**/ }
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            await fetch(`${API}/contacts/sos`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?._id || "", coordinates: coords }),
            });
            setSosSent(true);
        } catch { setSosSent(true); }
    };

    const shareLocation = () => {
        navigator.geolocation.getCurrentPosition(p => {
            const url = `https://maps.google.com/?q=${p.coords.latitude},${p.coords.longitude}`;
            navigator.clipboard.writeText(url).then(() => setLocShared(true));
        }, () => setLocShared(true));
    };

    const toggleRecord = async () => {
        if (recActive) {
            recRef.current?.stop();
            setRecActive(false);
            clearInterval(timerRef.current);
            setRecTimer(0);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
            chunksRef.current = [];
            rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            rec.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                const id = Date.now().toString();
                const now = new Date().toLocaleString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
                const entry = { id, type: "audio", name: `🛡️ Sahayak Audio — ${now}`, date: now, size: `${(blob.size / 1024).toFixed(1)} KB`, encrypted: true, url, uploading: false };
                const existing = JSON.parse(localStorage.getItem("raksha_evidence_cloud") || "[]");
                existing.unshift(entry);
                localStorage.setItem("raksha_evidence_cloud", JSON.stringify(existing.slice(0, 50)));
            };
            recRef.current = rec;
            rec.start(500);
            setRecActive(true);
            setRecTimer(0);
            timerRef.current = setInterval(() => setRecTimer(t => t + 1), 1000);
        } catch { alert("Microphone access denied."); }
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    const formatSec = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const actions = [
        {
            label: "Send SOS Alert", sublabel: "Alert your Inner Circle now", icon: AlertTriangle,
            gradient: "from-red-500 to-rose-600", shadow: "shadow-red-400/40",
            done: sosSent, doneLabel: "✅ SOS Sent!",
            onClick: sendSOS
        },
        {
            label: "Quick Evidence", sublabel: "Go to evidence capture", icon: Camera,
            gradient: "from-rose-500 via-pink-600 to-purple-700", shadow: "shadow-pink-400/30",
            onClick: () => navigate("/evidence"), done: false, doneLabel: ""
        },
        {
            label: recActive ? `● Recording ${formatSec(recTimer)}` : "Record Audio",
            sublabel: recActive ? "Tap to stop & save to vault" : "Silent audio saved to Evidence",
            icon: Mic,
            gradient: recActive ? "from-red-600 to-red-700" : "from-amber-500 to-orange-600",
            shadow: recActive ? "shadow-red-500/50" : "shadow-amber-400/30",
            onClick: toggleRecord, done: false, doneLabel: "", active: recActive
        },
        {
            label: "Share Location", sublabel: "Copy Google Maps link", icon: MapPin,
            gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-400/30",
            done: locShared, doneLabel: "📋 Link Copied!",
            onClick: shareLocation
        },
        {
            label: "Call 112", sublabel: "National emergency number", icon: Phone,
            gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-400/30",
            onClick: () => window.open("tel:112"), done: false, doneLabel: ""
        },
        {
            label: "Safe Journey", sublabel: "Start tracking your route", icon: Navigation,
            gradient: "from-teal-500 to-cyan-600", shadow: "shadow-teal-400/30",
            onClick: () => navigate("/safe-journey"), done: false, doneLabel: ""
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center shadow-lg shadow-rose-400/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-sm">External Wingman</h2>
                        <p className="text-[10px] text-slate-500">Quick-action emergency panel</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((action, i) => (
                    <motion.button key={action.label} onClick={action.onClick}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className={`bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-md hover:shadow-xl transition-all relative overflow-hidden ${action.active ? "border-red-400" : ""}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg ${action.shadow} ${action.active ? "animate-pulse" : ""}`}>
                            <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className={`font-bold text-sm ${action.done ? "text-emerald-600" : "text-slate-900"} leading-snug`}>
                            {action.done ? action.doneLabel : action.label}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{action.sublabel}</p>
                        <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-slate-300" />
                    </motion.button>
                ))}
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                    💡 <strong className="text-white">Tip:</strong> For silent protection, switch to{" "}
                    <button onClick={() => navigate("/gupt")} className="text-pink-400 underline">Gupt Mode</button>{" "}
                    — it disguises the app while recording in background.
                </p>
            </div>
        </motion.div>
    );
};

// ── Sahayak Mode Picker ───────────────────────────────────────────────
const SahayakPage = () => {
    const [mode, setMode] = useState(null); // null | "internal" | "external"

    if (mode === "internal") return <InternalMode onBack={() => setMode(null)} />;
    if (mode === "external") return <ExternalMode onBack={() => setMode(null)} />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
            {/* Header */}
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h1 className="text-3xl font-display font-bold text-slate-900">Sahayak</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Your Active AI Safety Wingman. Choose how you want assistance.
                </p>
            </motion.div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Internal */}
                <motion.button onClick={() => setMode("internal")}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 rounded-3xl p-7 text-left shadow-2xl shadow-violet-500/30 relative overflow-hidden group">
                    {/* Glow orbs */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-5 shadow-lg group-hover:bg-white/30 transition-colors">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Internal</h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            AI chat assistant. Get safety advice, write incident reports, and receive step-by-step emergency guidance.
                        </p>
                        <div className="mt-5 flex items-center gap-2">
                            <span className="text-xs text-white/60 font-medium">Open AI Chat</span>
                            <ChevronRight className="w-4 h-4 text-white/60" />
                        </div>
                    </div>
                </motion.button>

                {/* External */}
                <motion.button onClick={() => setMode("external")}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 rounded-3xl p-7 text-left shadow-2xl shadow-rose-500/30 relative overflow-hidden group">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-5 shadow-lg group-hover:bg-white/30 transition-colors">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">External</h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Quick-action panel. Send SOS, record audio, share location, and access emergency tools instantly.
                        </p>
                        <div className="mt-5 flex items-center gap-2">
                            <span className="text-xs text-white/60 font-medium">Open Quick Actions</span>
                            <ChevronRight className="w-4 h-4 text-white/60" />
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* Info strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">What Sahayak can do</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {[
                        "🤖 AI safety advice & guidance",
                        "📝 Incident report templates",
                        "🚨 One-tap SOS to Inner Circle",
                        "📍 Share live GPS location",
                        "🎙️ Silent audio recording",
                        "📞 Direct emergency call links",
                    ].map((f, i) => <p key={i}>{f}</p>)}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SahayakPage;
