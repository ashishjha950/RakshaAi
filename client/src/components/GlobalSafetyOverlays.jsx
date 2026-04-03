import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Phone, PhoneOff, Mic, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSafety } from "../context/SafetyContext";

// ─────────────────────────────────────────────────────────────────────
// GlobalSOSBanner — floats at the top whenever SOS is triggered
// ─────────────────────────────────────────────────────────────────────
export const GlobalSOSBanner = () => {
  const { sosTriggered, detectedKeyword } = useSafety();

  return (
    <AnimatePresence>
      {sosTriggered && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center gap-3
                     bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-3 shadow-lg"
        >
          <span className="w-3 h-3 bg-white rounded-full animate-ping shrink-0" />
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm flex-1">
            🚨 SOS TRIGGERED
            {detectedKeyword && detectedKeyword !== "volume-spike" &&
              ` — keyword: "${detectedKeyword.toUpperCase()}"`}
            {detectedKeyword === "volume-spike" && " — distress audio detected"}
          </span>
          <span className="text-xs text-white/70 shrink-0">{sosTriggered.time}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full shrink-0">
            Alerting Inner Circle…
            {sosTriggered.helpers > 0 && ` (+ ${sosTriggered.helpers} helpers nearby)`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────
// FakeCallOverlay — simulates a live phone call to deter threats
// ─────────────────────────────────────────────────────────────────────
const FAKE_LINES = [
  "Haan haan, main sun rahi hoon…",
  "Theek hai, main aapko track kar rahi hoon.",
  "Okay, aap safe ho? Mujhe batao.",
  "Main police ko call kar rahi hoon agar zaroorat ho.",
  "Okay okay, main aapke paas aa rahi hoon.",
  "Aapki location share karo abhi.",
];

export const FakeCallOverlay = () => {
  const { fakeCallActive, fakeCallContact, endFakeCall } = useSafety();
  const [callDuration, setCallDuration] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(null);
  const lineTimerRef = useRef(null);
  const callTimerRef = useRef(null);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Speak a line using Speech Synthesis
  const speakLine = (idx) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(FAKE_LINES[idx % FAKE_LINES.length]);
    utter.lang = "hi-IN";
    utter.rate = 0.9;
    utter.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi"));
    if (hindiVoice) utter.voice = hindiVoice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    synthRef.current = utter;
  };

  useEffect(() => {
    if (!fakeCallActive) {
      clearInterval(callTimerRef.current);
      clearInterval(lineTimerRef.current);
      window.speechSynthesis?.cancel();
      setCallDuration(0);
      setCurrentLine(0);
      return;
    }

    // Start call timer
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

    // Speak first line after 1s, then every 7s cycle through lines
    const firstTimeout = setTimeout(() => {
      speakLine(0);
      lineTimerRef.current = setInterval(() => {
        setCurrentLine(i => {
          const next = (i + 1) % FAKE_LINES.length;
          speakLine(next);
          return next;
        });
      }, 7000);
    }, 1000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(callTimerRef.current);
      clearInterval(lineTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [fakeCallActive]);

  return (
    <AnimatePresence>
      {fakeCallActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            className="relative w-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700 text-white text-center"
          >
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-3xl ring-4 ring-emerald-500/30 animate-pulse" />

            {/* Avatar */}
            <div className="relative mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <span className="text-4xl select-none">
                {fakeCallContact.includes("Mom") ? "👩" :
                  fakeCallContact.includes("Dad") ? "👨" :
                    fakeCallContact.includes("Police") ? "👮" : "👤"}
              </span>
              {speaking && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold mb-1">{fakeCallContact}</h2>
            <p className="text-emerald-400 text-sm font-semibold mb-1">Active Call • {fmtTime(callDuration)}</p>

            {/* Scrolling speech bubble */}
            <div className="bg-slate-700/50 rounded-2xl px-4 py-3 mb-6 min-h-[52px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentLine}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-slate-200 italic leading-relaxed"
                >
                  {speaking ? `"${FAKE_LINES[currentLine]}"` : "…"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Mic wave animation */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
                  animate={{ height: speaking ? [8, 28, 8] : [6, 10, 6] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
              <Mic className="w-3.5 h-3.5 text-emerald-400 ml-2" />
            </div>

            {/* End Call */}
            <button
              onClick={endFakeCall}
              className="w-16 h-16 mx-auto bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 transition-all active:scale-90"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
            <p className="text-xs text-slate-500 mt-3">Tap to end call</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
