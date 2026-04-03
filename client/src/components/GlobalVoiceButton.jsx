import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Copy, CheckCircle, Send, GripHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Global Floating Voice Button ────────────────────────────────
// A draggable FAB that lives in every page. Speak → see transcript
// → copy to clipboard OR quick-post to the Community page.
const GlobalVoiceButton = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimText, setInterimText] = useState("");
    const [copied, setCopied] = useState(false);

    // Draggable position state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = true;
        recognition.continuous = true;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => { setIsListening(false); setInterimText(""); };
        recognition.onerror = () => { setIsListening(false); setInterimText(""); };

        recognition.onresult = (e) => {
            let interim = "";
            let finalText = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
                else interim += e.results[i][0].transcript;
            }
            setInterimText(interim);
            if (finalText) setTranscript(prev => (prev + finalText).trim() + " ");
        };

        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
        setInterimText("");
    }, []);

    const toggleListening = () => {
        if (isListening) stopListening();
        else startListening();
    };

    const handleCopy = async () => {
        if (!transcript.trim()) return;
        await navigator.clipboard.writeText(transcript.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePostToCommunity = () => {
        if (!transcript.trim()) return;
        stopListening();
        setIsOpen(false);
        navigate(`/community?voiceStory=${encodeURIComponent(transcript.trim())}`);
        setTranscript("");
    };

    const clearTranscript = () => {
        setTranscript("");
        setInterimText("");
    };

    // ── Drag logic ──────────────────────────────────────────────
    const onMouseDown = (e) => {
        setDragging(true);
        dragStart.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y };
    };

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e) => {
            setPosition({
                x: dragStart.current.px + e.clientX - dragStart.current.mx,
                y: dragStart.current.py + e.clientY - dragStart.current.my,
            });
        };
        const onUp = () => setDragging(false);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }, [dragging]);

    const displayText = transcript + interimText;

    return (
        <div
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">

            {/* ── Transcript Overlay Panel ─────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                        {/* Panel Header — draggable */}
                        <div
                            onMouseDown={onMouseDown}
                            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-700 cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-2">
                                <GripHorizontal className="w-4 h-4 text-white/70" />
                                <span className="text-white text-sm font-bold">Voice Input</span>
                                {isListening && (
                                    <span className="flex items-center gap-1 text-white/80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                                        Recording
                                    </span>
                                )}
                            </div>
                            <button onClick={() => { stopListening(); setIsOpen(false); }}
                                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>

                        {/* Transcript box */}
                        <div className="px-4 pt-3 pb-2">
                            <div className="min-h-[80px] max-h-40 overflow-y-auto bg-slate-50 rounded-xl p-3 text-sm text-slate-800 leading-relaxed border border-slate-100">
                                {displayText ? (
                                    <>
                                        <span>{transcript}</span>
                                        {interimText && <span className="text-slate-400 italic">{interimText}</span>}
                                    </>
                                ) : (
                                    <span className="text-slate-400 italic">
                                        {isListening ? "Listening… speak now" : "Press the mic button to start speaking"}
                                    </span>
                                )}
                            </div>
                            {displayText && (
                                <button onClick={clearTranscript}
                                    className="text-[10px] text-slate-400 hover:text-rose-500 mt-1.5 flex items-center gap-1 ml-auto transition-colors">
                                    <X className="w-2.5 h-2.5" /> Clear
                                </button>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 px-4 pb-4">
                            <button onClick={handleCopy} disabled={!transcript.trim()}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${copied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40"}`}>
                                {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Text</>}
                            </button>
                            <button onClick={handlePostToCommunity} disabled={!transcript.trim()}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-md transition-all disabled:opacity-40">
                                <Send className="w-3.5 h-3.5" /> Post to Community
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main FAB ──────────────────────────────────────── */}
            <div className="flex items-center gap-2">
                {/* Mic toggle button */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { if (!isOpen) setIsOpen(true); toggleListening(); }}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isListening
                        ? "bg-rose-500 shadow-rose-400/50 ring-4 ring-rose-200"
                        : "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 shadow-purple-400/30"}`}>
                    {isListening
                        ? <MicOff className="w-6 h-6 text-white" />
                        : <Mic className="w-6 h-6 text-white" />}
                    {isListening && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                </motion.button>
            </div>

            {/* Tooltip label when closed */}
            {!isOpen && !isListening && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100">
                    Voice Input
                </motion.div>
            )}
        </div>
    );
};

export default GlobalVoiceButton;
