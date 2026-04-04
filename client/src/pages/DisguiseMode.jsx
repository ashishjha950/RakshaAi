import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Activity, Droplets, Moon, Flame } from "lucide-react";
import { useSafety } from "../context/SafetyContext";

// ─────────────────────────────────────────────────────────────────
// DisguiseMode — Shows a real Calculator or Wellness app skin.
// SOS keyword voice detection runs silently in background.
// Type 1234 on calculator (or tap moods 1→2→3→4 in wellness) to unlock.
// Recordings saved to Evidence vault via localStorage.
// ─────────────────────────────────────────────────────────────────

const API = "http://localhost:3000/api";
const SOS_KEYWORDS = ["sos", "help", "danger", "bachao", "save me", "attack", "emergency", "rape", "harassment"];

// ── Helpers ────────────────────────────────────────────────────────
const nowLabel = () =>
  new Date().toLocaleString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

const saveSOSToVault = (blob, keyword) => {
  // Save to Evidence vault via localStorage metadata list
  // Use a special flag; the actual blob URL is only valid for current session
  const url = URL.createObjectURL(blob);
  try {
    const existing = JSON.parse(localStorage.getItem("raksha_notes") || "[]");
    // We store in raksha_notes (text notes persist); audio blobs go to sessionStorage key
    const sessionKey = `sos_blob_${Date.now()}`;
    sessionStorage.setItem(sessionKey, "1"); // flag only; blob URL is kept in memory via vault below
    // Push to evidence page's in-memory flag so it can pick it up on next visit
    const evEntry = {
      id: Date.now().toString(),
      type: "video",
      name: `🚨 Disguise-SOS — "${keyword}" — ${nowLabel()}`,
      date: nowLabel(),
      size: `${(blob.size / 1024).toFixed(1)} KB`,
      encrypted: true,
      isSos: true,
      sosBlob: true,
      // Store a data URL only if blob is small enough (<1MB)
      url: blob.size < 1024 * 1024 ? url : "",
      mimeType: "video/webm",
    };
    const all = JSON.parse(localStorage.getItem("raksha_evidence_meta") || "[]");
    all.unshift(evEntry);
    localStorage.setItem("raksha_evidence_meta", JSON.stringify(all.slice(0, 50)));
  } catch { /**/ }
};

// ── Calculator Skin ────────────────────────────────────────────────
const CalcSkin = ({ onUnlock, vaultPin }) => {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const pinRef = useRef(""); // track last 4 digits silently

  const press = (key) => {
    // Hidden PIN check
    if (/^\d$/.test(key)) {
      pinRef.current = (pinRef.current + key).slice(-4);
      if (pinRef.current === vaultPin) { onUnlock(); return; }
    }

    if (key === "AC") { setDisplay("0"); setExpr(""); return; }
    if (key === "⌫") { setDisplay(d => d.length > 1 ? d.slice(0, -1) : "0"); return; }
    if (key === "=") {
      try {
        const safe = expr + display;
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict";return(' + safe + ")")();
        setDisplay(String(parseFloat(result.toFixed(10))));
        setExpr("");
      } catch { setDisplay("Error"); setExpr(""); }
      return;
    }
    if (["+", "-", "×", "÷", "%"].includes(key)) {
      const op = key === "×" ? "*" : key === "÷" ? "/" : key;
      setExpr(expr + display + op);
      setDisplay("0");
      return;
    }
    if (key === ".") { if (!display.includes(".")) setDisplay(d => d + "."); return; }
    if (key === "+/-") { setDisplay(d => d.startsWith("-") ? d.slice(1) : "-" + d); return; }
    setDisplay(d => d === "0" ? key : d + key);
  };

  const rows = [
    ["AC", "+/-", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "⌫", "="],
  ];
  const isOp = k => ["÷", "×", "-", "+", "="].includes(k);
  const isFn = k => ["AC", "+/-", "%"].includes(k);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-end">
      {/* Display */}
      <div className="px-6 pb-4 pt-16 text-right">
        <div className="text-slate-500 text-sm truncate min-h-[24px]">{expr}</div>
        <div className="text-white font-light mt-1 truncate"
          style={{ fontSize: display.length > 10 ? "2.2rem" : "3.8rem", lineHeight: 1.1 }}>
          {display}
        </div>
      </div>
      {/* Buttons */}
      <div className="px-4 pb-10 space-y-3">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-4 gap-3">
            {row.map(key => (
              <button key={key} onClick={() => press(key)}
                className={`h-16 rounded-full font-semibold text-xl active:opacity-60 transition-opacity select-none
                                    ${isOp(key) ? "bg-orange-500 text-white" :
                    isFn(key) ? "bg-neutral-600 text-white" :
                      "bg-neutral-800 text-white"}`}>
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-neutral-900 text-[10px] pb-2 select-none">Calculator v2.1</p>
    </div>
  );
};

// ── Wellness Skin ──────────────────────────────────────────────────
const WellnessSkin = ({ onUnlock, vaultPin }) => {
  const [mood, setMood] = useState(null);
  const pinRef = useRef("");

  const tapMood = (val) => {
    setMood(val);
    pinRef.current = (pinRef.current + String(val)).slice(-4);
    if (pinRef.current === vaultPin) { onUnlock(); return; }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-y-auto">
      <div className="max-w-sm mx-auto px-4 pt-12 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm">Good evening 🌙</p>
            <h1 className="text-2xl font-bold mt-1">Wellness Tracker</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
        </div>
        {/* Ring */}
        <div className="bg-slate-800/60 rounded-3xl p-6 mb-6 flex items-center gap-6 border border-slate-700/40">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ec4899" strokeWidth="3"
                strokeDasharray="68.4 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">68%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Daily Goal</p>
            <p className="text-xl font-bold mt-1">Great Progress!</p>
            <p className="text-slate-400 text-xs mt-1">Keep it up 💪</p>
          </div>
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Activity, label: "Steps", val: "6,842", unit: "/ 10k goal", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Droplets, label: "Water", val: "5 cups", unit: "/ 8 cups", color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { icon: Moon, label: "Sleep", val: "7.2h", unit: "last night", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Flame, label: "Calories", val: "1,840", unit: "kcal today", color: "text-orange-400", bg: "bg-orange-500/10" },
          ].map(m => (
            <div key={m.label} className={`${m.bg} rounded-2xl p-4 border border-slate-700/30`}>
              <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
              <p className={`text-xl font-bold ${m.color}`}>{m.val}</p>
              <p className="text-slate-400 text-xs mt-0.5">{m.unit}</p>
              <p className="text-slate-300 text-xs font-medium mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        {/* Mood — secret PIN input */}
        <div className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700/40">
          <p className="text-sm text-slate-400 mb-3">How are you feeling today?</p>
          <div className="flex justify-between">
            {["😢", "😐", "🙂", "😊", "😄"].map((e, i) => (
              <button key={i} onClick={() => tapMood(i + 1)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all active:scale-90 ${mood === i + 1 ? "bg-pink-500/30 ring-2 ring-pink-400" : "bg-slate-700/60"}`}>
                {e}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-700 text-center mt-4">WellnessTracker v3.0 · Data stays private</p>
        </div>
      </div>
    </div>
  );
};

// ── Main DisguiseMode ──────────────────────────────────────────────
const DisguiseMode = () => {
  const navigate = useNavigate();
  const { vaultPin } = useSafety();
  const [skin, setSkin] = useState(() => localStorage.getItem("disguise_skin") || "calculator");
  const [disguiseActive, setDisguiseActive] = useState(false);

  // SOS background refs — all mutable, never cause re-renders
  const sosRecRef = useRef(null);
  const sosChunks = useRef([]);
  const sosRecActive = useRef(false);
  const emailSentRef = useRef(false);
  const recognitionRef = useRef(null);
  const disguiseActiveRef = useRef(false); // ✅ ref mirror to avoid stale closures in onend

  // Save SOS audio blob to Evidence vault
  const handleSosRecordingDone = useCallback((blob, keyword) => {
    sosRecActive.current = false;
    if (!blob || blob.size === 0) return;
    saveSOSToVault(blob, keyword);
  }, []);

  // Start silent video and audio recording
  const startSosRecording = useCallback(async (keyword) => {
    if (sosRecActive.current) return;
    sosRecActive.current = true;
    sosChunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      sosRecRef.current = rec;
      rec.ondataavailable = e => { if (e.data.size > 0) sosChunks.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(sosChunks.current, { type: "video/webm" });
        handleSosRecordingDone(blob, keyword);
      };
      rec.start(500);
    } catch {
      sosRecActive.current = false;
    }
  }, [handleSosRecordingDone]);

  // Send SOS email via backend
  const sendSOSEmail = useCallback(async (keyword) => {
    if (emailSentRef.current) return;
    emailSentRef.current = true;
    try {
      let coords = null;
      try {
        const p = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }));
        coords = { lat: p.coords.latitude, lng: p.coords.longitude };
      } catch { /**/ }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${API}/contacts/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "", coordinates: coords }),
      });

      if (!res.ok) {
        emailSentRef.current = false; // allow retry
      }
    } catch {
      emailSentRef.current = false;
    }
  }, []);

  // ✅ Fixed SOS listener — uses ref in onend to avoid stale closure
  useEffect(() => {
    disguiseActiveRef.current = disguiseActive;

    if (!disguiseActive) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    emailSentRef.current = false;

    const createAndStart = () => {
      const rec = new SR();
      rec.lang = "en-IN";
      rec.continuous = true;
      rec.interimResults = true;
      recognitionRef.current = rec;

      rec.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++)
          text += e.results[i][0].transcript.toLowerCase() + " ";

        const kw = SOS_KEYWORDS.find(k => text.includes(k));
        if (kw && !sosRecActive.current && !emailSentRef.current) {
          startSosRecording(kw);
          sendSOSEmail(kw);
        }
      };

      // ✅ Read from ref — NEVER from state — so restart always works
      rec.onend = () => {
        if (disguiseActiveRef.current) {
          setTimeout(() => { try { createAndStart(); } catch { /**/ } }, 300);
        }
      };

      rec.onerror = (e) => {
        if (e.error === "not-allowed") return; // mic denied — don't restart
        if (disguiseActiveRef.current) {
          setTimeout(() => { try { createAndStart(); } catch { /**/ } }, 1000);
        }
      };

      try { rec.start(); } catch { /**/ }
      return rec;
    };

    createAndStart();

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [disguiseActive, startSosRecording, sendSOSEmail]);

  // Unlock → navigate to Evidence page
  const handleUnlock = useCallback(() => {
    recognitionRef.current?.stop();
    if (sosRecRef.current?.state === "recording") sosRecRef.current.stop();
    setDisguiseActive(false);
    navigate("/evidence");
  }, [navigate]);

  // Activate chosen skin
  const activateDisguise = (chosenSkin) => {
    localStorage.setItem("disguise_skin", chosenSkin);
    setSkin(chosenSkin);
    setDisguiseActive(true);
  };

  // ── Active disguise (full-screen) ──────────────────────────────
  if (disguiseActive) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {skin === "calculator"
          ? <CalcSkin onUnlock={handleUnlock} vaultPin={vaultPin} />
          : <WellnessSkin onUnlock={handleUnlock} vaultPin={vaultPin} />
        }
      </div>
    );
  }

  // ── Require Vault PIN ──────────────────────────────────────────
  if (!vaultPin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8 text-center pt-20">
        <div className="bg-red-50 text-red-600 rounded-3xl p-8 max-w-md mx-auto border border-red-200">
          <h2 className="text-xl font-bold mb-3">PIN Not Set</h2>
          <p className="text-sm mb-6">You must create a secure 4-digit Vault PIN on the Evidence page before using Disguise Mode.</p>
          <Link to="/evidence" className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors inline-block">
            Setup my PIN
          </Link>
        </div>
      </motion.div>
    );
  }

  // ── Disguise settings chooser ──────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Disguise Mode</h1>
        <p className="text-slate-500 mt-1 text-sm">
          App looks like a normal utility. SOS voice detection runs in background.
          <strong> Type your secure PIN</strong> on the disguise screen to return.
        </p>
      </div>

      {/* Skin cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Calculator preview */}
        <button onClick={() => activateDisguise("calculator")}
          className={`bg-black rounded-3xl p-5 text-left border-2 transition-all group ${skin === "calculator" ? "border-orange-500" : "border-transparent hover:border-orange-400"}`}>
          <div className="text-white text-4xl font-light mb-3 select-none">0</div>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {["AC", "+/-", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "⌫", "="].map((k, i) => (
              <div key={i} className={`h-5 rounded-full text-[7px] flex items-center justify-center font-bold select-none
                                ${["÷", "×", "-", "+", "="].includes(k) ? "bg-orange-500 text-white" : ["AC", "+/-", "%"].includes(k) ? "bg-neutral-600 text-white" : "bg-neutral-800 text-white"}`}>
                {k}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm font-semibold group-hover:text-orange-400 transition-colors">Calculator</p>
          <p className="text-slate-600 text-xs mt-0.5">iOS-style dark calculator</p>
        </button>

        {/* Wellness preview */}
        <button onClick={() => activateDisguise("wellness")}
          className={`bg-slate-950 rounded-3xl p-5 text-left border-2 transition-all group ${skin === "wellness" ? "border-pink-500" : "border-transparent hover:border-pink-400"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="text-white font-bold text-sm">Wellness Tracker</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {[["🚶 Steps", "6,842 / 10k"], ["💧 Water", "5 / 8 cups"], ["🌙 Sleep", "7.2h"]].map(([l, v]) => (
              <div key={l} className="bg-slate-800 rounded-xl px-3 py-1.5 flex justify-between">
                <span className="text-slate-300 text-xs">{l}</span>
                <span className="text-white text-xs font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm font-semibold group-hover:text-pink-400 transition-colors">Wellness Tracker</p>
          <p className="text-slate-600 text-xs mt-0.5">Tap moods 1→2→3→4 to unlock</p>
        </button>
      </div>

      {/* Info */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
        <div className="space-y-2 text-xs text-slate-400">
          {[
            "🎤  Background voice detection: " + SOS_KEYWORDS.slice(0, 4).join(", ") + "…",
            "📧  Keyword heard → SOS email sent to Inner Circle contacts immediately",
            "🔴  Audio recording starts and runs until email is confirmed",
            "🔑  Calculator: type your secure PIN to return · Wellness: tap moods 1→2→3→4",
            "📁  SOS recordings saved to Evidence vault (unlock with your secure PIN)",
          ].map((t, i) => <p key={i} className="leading-snug">{t}</p>)}
        </div>
      </div>
    </motion.div>
  );
};

export default DisguiseMode;
