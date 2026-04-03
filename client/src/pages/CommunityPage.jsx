import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Heart, MessageCircle, MapPin, Shield, ChevronDown,
    PlusCircle, Users, Send, Loader, X, Tag, Eye, EyeOff,
    AlertTriangle, CheckCircle, Mic, MicOff, Paperclip,
    Share2, Download, FileText, Music, Image as ImageIcon, Link, Volume2
} from "lucide-react";

const API = "http://localhost:3000/api/community";
const MEDIA_BASE = "http://localhost:3000";

const CATEGORIES = [
    { value: "harassment", label: "Harassment", color: "rose" },
    { value: "stalking", label: "Stalking", color: "orange" },
    { value: "assault", label: "Assault", color: "red" },
    { value: "eve-teasing", label: "Eve-Teasing", color: "amber" },
    { value: "online-abuse", label: "Online Abuse", color: "purple" },
    { value: "workplace", label: "Workplace Issue", color: "blue" },
    { value: "safe-experience", label: "Safe Experience ✅", color: "emerald" },
    { value: "other", label: "Other", color: "slate" },
];

const categoryColor = {
    harassment: "rose", stalking: "orange", assault: "red",
    "eve-teasing": "amber", "online-abuse": "purple",
    workplace: "blue", "safe-experience": "emerald", other: "slate"
};

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

// ─── Voice-to-Text Hook ──────────────────────────────────────────
const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef(null);

    const startListening = useCallback((onResult) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("Voice input not supported in this browser. Try Chrome."); return; }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = true;
        recognition.continuous = true;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (e) => {
            let interim = "";
            let final = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }
            setTranscript(interim);
            if (final) onResult(final);
        };
        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
        setTranscript("");
    }, []);

    return { isListening, transcript, startListening, stopListening };
};

// ─── Mic Button ─────────────────────────────────────────────────
const MicButton = ({ onResult, fieldName }) => {
    const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

    const toggle = () => {
        if (isListening) stopListening();
        else startListening(onResult);
    };

    return (
        <div className="relative inline-flex items-center">
            <button type="button" onClick={toggle}
                title={isListening ? "Stop recording" : `Speak to fill ${fieldName}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-rose-300"
                    : "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500"}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {isListening && transcript && (
                <span className="absolute -bottom-6 left-0 text-[10px] text-rose-500 whitespace-nowrap bg-white px-1 rounded shadow-sm border border-rose-100">
                    🎤 {transcript}
                </span>
            )}
        </div>
    );
};

// ─── File Preview ────────────────────────────────────────────────
const FilePreviewChip = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/");
    const url = URL.createObjectURL(file);
    return (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 relative">
            {isImage
                ? <img src={url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                : <FileText className="w-4 h-4 text-purple-500" />}
            <span className="max-w-[120px] truncate font-medium">{file.name}</span>
            <button type="button" onClick={onRemove}
                className="w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center ml-1 transition-colors">
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

// ─── Post Media Display ──────────────────────────────────────────
const PostMedia = ({ mediaUrl, mediaType, mediaName }) => {
    if (!mediaUrl) return null;
    const fullUrl = `${MEDIA_BASE}${mediaUrl}`;

    if (mediaType === "image") {
        return (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                <img src={fullUrl} alt="Post attachment"
                    className="w-full max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(fullUrl, "_blank")}
                />
            </div>
        );
    }
    if (mediaType === "audio") {
        return (
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 flex items-center gap-3 border border-purple-100">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-white" />
                </div>
                <audio controls className="flex-1 h-8" src={fullUrl}>Your browser does not support audio.</audio>
            </div>
        );
    }
    return (
        <div className="mt-3">
            <a href={fullUrl} download={mediaName} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors">
                <Download className="w-3.5 h-3.5" />
                {mediaName || "Download attachment"}
            </a>
        </div>
    );
};

// ─── Share Button ────────────────────────────────────────────────
const ShareButton = ({ post }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: `${post.story.slice(0, 100)}...`,
            url: `${window.location.origin}/community#${post._id}`,
        };

        if (navigator.share) {
            try { await navigator.share(shareData); return; } catch { /* user cancelled */ }
        }

        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <button onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${copied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>
            {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
        </button>
    );
};

// ── CommunityPage ──────────────────────────────────────────────────────────
const CommunityPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterCat, setFilterCat] = useState("all");
    const [expandedPost, setExpandedPost] = useState(null);
    const [user, setUser] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [story, setStory] = useState("");
    const [category, setCategory] = useState("harassment");
    const [location, setLocation] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));

        // Handle deep-link from global voice button
        const params = new URLSearchParams(window.location.search);
        const voiceStory = params.get("voiceStory");
        if (voiceStory) {
            setStory(decodeURIComponent(voiceStory));
            setShowForm(true);
            window.history.replaceState({}, "", window.location.pathname);
        }

        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch(API);
            if (res.ok) setPosts(await res.json());
        } catch (err) {
            console.error("Failed to load posts", err);
        } finally {
            setLoading(false);
        }
    };

    const submitPost = async (e) => {
        e.preventDefault();
        if (!title.trim() || !story.trim()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("authorId", user?._id || "guest");
            formData.append("authorName", user?.name || "Anonymous Sister");
            formData.append("title", title);
            formData.append("story", story);
            formData.append("category", category);
            formData.append("location", location);
            formData.append("isAnonymous", isAnonymous);
            formData.append("tags", JSON.stringify([]));
            if (mediaFile) formData.append("media", mediaFile);

            const res = await fetch(API, { method: "POST", body: formData });
            if (res.ok) {
                const newPost = await res.json();
                setPosts(prev => [newPost, ...prev]);
                setTitle(""); setStory(""); setLocation(""); setCategory("harassment");
                setIsAnonymous(false); setMediaFile(null);
                setShowForm(false);
                setSuccessMsg("Your experience has been shared with the community 💜");
                setTimeout(() => setSuccessMsg(""), 4000);
            }
        } catch (err) {
            console.error("Failed to post", err);
        } finally {
            setSubmitting(false);
        }
    };

    const likePost = async (postId) => {
        if (!user) return;
        try {
            const res = await fetch(`${API}/${postId}/like`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id }),
            });
            if (res.ok) {
                const { likes, liked } = await res.json();
                setPosts(prev => prev.map(p => p._id === postId
                    ? { ...p, likes, likedBy: liked ? [...(p.likedBy || []), user._id] : (p.likedBy || []).filter(id => id !== user._id) }
                    : p));
            }
        } catch (err) { console.error("Like failed", err); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setMediaFile(file);
    };

    const filtered = filterCat === "all" ? posts : posts.filter(p => p.category === filterCat);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">

            {/* Header */}
            <motion.div variants={item} className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Community</h1>
                    <p className="text-slate-500 mt-1 text-sm">A safe space to share your story, support others, and heal together.</p>
                </div>
                <button onClick={() => setShowForm(s => !s)}
                    className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5">
                    <PlusCircle className="w-4 h-4" /> Share Your Story
                </button>
            </motion.div>

            {/* Success toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-emerald-800 text-sm font-medium">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Post Form ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-lg shadow-rose-500/10">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-rose-500" /> Write Your Experience
                                </h3>
                                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <X className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>

                            {/* Voice tip banner */}
                            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 mb-4">
                                <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                                <p className="text-xs text-purple-700">Click the 🎤 mic buttons to <strong>speak your story</strong> — your voice will be written automatically.</p>
                            </div>

                            <form onSubmit={submitPost} className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Title *</label>
                                    <div className="flex items-center gap-2">
                                        <input value={title} onChange={e => setTitle(e.target.value)}
                                            placeholder="Give your story a title..."
                                            required maxLength={120}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                        <MicButton fieldName="title" onResult={text => setTitle(prev => (prev + " " + text).trim())} />
                                    </div>
                                </div>

                                {/* Story */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-slate-600">Your Story *</label>
                                        <MicButton fieldName="story" onResult={text => setStory(prev => (prev + " " + text).trim())} />
                                    </div>
                                    <textarea value={story} onChange={e => setStory(e.target.value)}
                                        placeholder="Share what happened — this is a safe space. You can write as much or as little as you like. Or use the mic button above to speak."
                                        required rows={6}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Category + Location row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400">
                                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 block mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location (optional)</label>
                                        <input value={location} onChange={e => setLocation(e.target.value)}
                                            placeholder="e.g. Lajpat Nagar, Delhi"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                    </div>
                                </div>

                                {/* ── File Attachment ─────────────────────────────── */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1">
                                        <Paperclip className="w-3 h-3" /> Attachment (optional)
                                    </label>
                                    {mediaFile ? (
                                        <FilePreviewChip file={mediaFile} onRemove={() => { setMediaFile(null); fileInputRef.current.value = ""; }} />
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 flex flex-col items-center gap-2 text-slate-400 text-xs hover:border-rose-300 hover:text-rose-400 transition-colors cursor-pointer">
                                            <div className="flex gap-3">
                                                <ImageIcon className="w-5 h-5" />
                                                <Music className="w-5 h-5" />
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span>Click to attach an image, audio, or document</span>
                                            <span className="text-[10px] text-slate-300">Max 10 MB</span>
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden"
                                        accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* Anonymous toggle */}
                                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        {isAnonymous ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Post Anonymously</p>
                                            <p className="text-xs text-slate-500">Your name will be hidden if enabled</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setIsAnonymous(!isAnonymous)}
                                        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${isAnonymous ? "bg-rose-500 justify-end" : "bg-slate-200 justify-start"}`}>
                                        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>

                                {/* Disclaimer */}
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 leading-snug">Your safety is our priority. All posts are moderated. Please do not share personally identifying information like full names or phone numbers.</p>
                                </div>

                                <button type="submit" disabled={submitting}
                                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
                                    {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Sharing...</> : <><Send className="w-4 h-4" /> Share with Community</>}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Filter */}
            <motion.div variants={item} className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterCat("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterCat === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    All Stories
                </button>
                {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setFilterCat(cat.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterCat === cat.value ? `bg-${cat.color}-500 text-white` : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {cat.label}
                    </button>
                ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Stories Shared", value: posts.length },
                    { label: "This Week", value: posts.filter(p => Date.now() - new Date(p.createdAt) < 7 * 86400000).length },
                    { label: "Total Support", value: posts.reduce((a, p) => a + (p.likes || 0), 0) + "♥" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                        <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Feed */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader className="w-8 h-8 text-rose-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">No stories yet in this category.</p>
                    <p className="text-sm text-slate-500 mt-1">Be the first to share your experience.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(post => {
                        const col = categoryColor[post.category] || "slate";
                        const likedByMe = user && (post.likedBy || []).includes(user._id);
                        const isExpanded = expandedPost === post._id;

                        return (
                            <motion.div key={post._id} id={post._id} variants={item}
                                className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow">

                                {/* Card header */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-${col}-100 text-${col}-700`}>
                                                    {post.category?.replace("-", " ").toUpperCase()}
                                                </span>
                                                {post.location && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        <MapPin className="w-2.5 h-2.5" /> {post.location}
                                                    </span>
                                                )}
                                                {post.mediaType === "image" && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        <ImageIcon className="w-2.5 h-2.5" /> Photo
                                                    </span>
                                                )}
                                                {post.mediaType === "audio" && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                                                        <Volume2 className="w-2.5 h-2.5" /> Audio
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{post.title}</h3>
                                        </div>
                                    </div>

                                    {/* Media attachment */}
                                    <PostMedia mediaUrl={post.mediaUrl} mediaType={post.mediaType} mediaName={post.mediaName} />

                                    {/* Snippet / expanded */}
                                    <div className="mt-3">
                                        <p className={`text-sm text-slate-700 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                                            {post.story}
                                        </p>
                                        {post.story.length > 180 && (
                                            <button onClick={() => setExpandedPost(isExpanded ? null : post._id)}
                                                className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1 hover:underline">
                                                {isExpanded ? "Show less" : "Read full story"}
                                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                {post.authorName?.[0] || "A"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-800">{post.authorName}</p>
                                                <p className="text-[10px] text-slate-400">{timeAgo(post.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <ShareButton post={post} />
                                            <button onClick={() => likePost(post._id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${likedByMe ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500"}`}>
                                                <Heart className={`w-3.5 h-3.5 ${likedByMe ? "fill-rose-500 text-rose-500" : ""}`} />
                                                {post.likes || 0} {post.likes === 1 ? "support" : "supports"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Solidarity banner */}
                                {(post.category === "assault" || post.category === "harassment") && (
                                    <div className="border-t border-rose-100 bg-rose-50 px-5 py-2.5 flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        <p className="text-xs text-rose-700 font-medium">This community stands with you. You are not alone. 💜</p>
                                    </div>
                                )}

                            </motion.div>
                        );
                    })}
                </div>
            )}

        </motion.div>
    );
};

export default CommunityPage;
