import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

// ─── SOS keywords, same set used across the whole app ────────────────
export const SOS_KEYWORDS = [
  "sos", "help", "danger", "bachao", "save me", "attack",
  "emergency", "rape", "harassment", "chodo", "maroge","mat karo","help me"
];

const API = "http://localhost:3000/api";

// ─── Context ─────────────────────────────────────────────────────────
const SafetyContext = createContext(null);

export const useSafety = () => {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error("useSafety must be used inside SafetyProvider");
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────
// SafetyProvider — wraps the whole app (mounted in AppLayout)
// Manages:
//  • safetyMode: "sahayak" | "guardian"
//  • globalSosWatch: whether app-wide voice listener is active
//  • sosTriggered: flash state when SOS fires
//  • fakeCallActive: Fake Call overlay state
// ─────────────────────────────────────────────────────────────────────
export const SafetyProvider = ({ children }) => {
  // ── Mode ───────────────────────────────────────────────────────────
  const [safetyMode, setSafetyModeState] = useState(
    () => localStorage.getItem("raksha_mode") || "sahayak"
  );

  const setSafetyMode = (mode) => {
    setSafetyModeState(mode);
    localStorage.setItem("raksha_mode", mode);
  };

  // ── Global SOS Watch ───────────────────────────────────────────────
  const [globalSosWatch, setGlobalSosWatchState] = useState(
    () => localStorage.getItem("raksha_sos_watch") === "true"
  );
  const [sosTriggered, setSosTriggered] = useState(null); // { keyword, time }
  const [sosPending, setSosPending] = useState(null); // { keyword, timeLeft }
  const [detectedKeyword, setDetectedKeyword] = useState("");

  const recRef = useRef(null);
  const emailSentRef = useRef(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const volumePollRef = useRef(null);
  const sosTimerRef = useRef(null);
  const globalSosWatchRef = useRef(globalSosWatch);
  globalSosWatchRef.current = globalSosWatch;

  const setGlobalSosWatch = (val) => {
    setGlobalSosWatchState(val);
    localStorage.setItem("raksha_sos_watch", String(val));
  };

  // ── Send SOS email via backend ─────────────────────────────────────
  const cancelSOS = useCallback(() => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    sosTimerRef.current = null;
    setSosPending(null);
    emailSentRef.current = false;
  }, []);

  const executeSOS = useCallback(async (keyword) => {
    const now = new Date().toLocaleString("en-IN", {
      hour12: true, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short"
    });
    setSosTriggered({ keyword, time: now });
    setDetectedKeyword(keyword);

    try {
      let coords = null;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }));
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch { /**/ }

      const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
      const res = await fetch(`${API}/contacts/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id || "", coordinates: coords }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.nearbyHelpersAlerted > 0) {
          setSosTriggered(prev => prev ? { ...prev, helpers: data.nearbyHelpersAlerted } : null);
        }
      } else {
        emailSentRef.current = false;
      }
    } catch { emailSentRef.current = false; }

    // Auto-clear flash after 12s and reset so SOS can fire again
    setTimeout(() => {
      setSosTriggered(null);
      setDetectedKeyword("");
      emailSentRef.current = false;
    }, 12000);
  }, []);

  const fireSOS = useCallback((keyword) => {
    if (emailSentRef.current) return;
    emailSentRef.current = true; // prevent multiple triggers concurrently

    let timeLeft = 3;
    setSosPending({ keyword, timeLeft });
    
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    sosTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft > 0) {
        setSosPending({ keyword, timeLeft });
      } else {
        clearInterval(sosTimerRef.current);
        sosTimerRef.current = null;
        setSosPending(null);
        executeSOS(keyword);
      }
    }, 1000);
  }, [executeSOS]);

  // ── Voice keyword detection ────────────────────────────────────────
  useEffect(() => {
    if (!globalSosWatch) {
      recRef.current?.stop();
      recRef.current = null;
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    emailSentRef.current = false;

    const create = () => {
      const r = new SR();
      r.lang = "en-IN";
      r.continuous = true;
      r.interimResults = true;
      recRef.current = r;

      r.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++)
          text += e.results[i][0].transcript.toLowerCase() + " ";
        const kw = SOS_KEYWORDS.find(k => text.includes(k));
        if (kw && !emailSentRef.current) fireSOS(kw);
      };

      r.onend = () => {
        if (globalSosWatchRef.current)
          setTimeout(() => { try { create().start(); } catch { /**/ } }, 400);
      };
      r.onerror = (e) => {
        if (e.error === "not-allowed") return;
        if (globalSosWatchRef.current)
          setTimeout(() => { try { create().start(); } catch { /**/ } }, 1200);
      };
      return r;
    };

    try { create().start(); } catch { /**/ }
    return () => { recRef.current?.stop(); recRef.current = null; };
  }, [globalSosWatch, fireSOS]);

  // ── Volume / Screaming spike detection (Web Audio API) ────────────
  const startVolumeWatch = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let spikeSamples = 0;

      volumePollRef.current = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 160) { // sustained screaming threshold
          spikeSamples++;
          if (spikeSamples >= 4 && !emailSentRef.current) {
            fireSOS("volume-spike");
            spikeSamples = 0;
          }
        } else {
          spikeSamples = 0;
        }
      }, 150);
    } catch { /**/ }
  }, [fireSOS]);

  const stopVolumeWatch = useCallback(() => {
    clearInterval(volumePollRef.current);
    analyserRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  useEffect(() => {
    if (globalSosWatch) startVolumeWatch();
    else stopVolumeWatch();
    return () => stopVolumeWatch();
  }, [globalSosWatch, startVolumeWatch, stopVolumeWatch]);

  // ── Fake Call ──────────────────────────────────────────────────────
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallContact, setFakeCallContact] = useState("Mom 💛");

  const startFakeCall = (contactName = "Mom 💛") => {
    setFakeCallContact(contactName);
    setFakeCallActive(true);
  };
  const endFakeCall = () => setFakeCallActive(false);

  return (
    <SafetyContext.Provider value={{
      safetyMode, setSafetyMode,
      globalSosWatch, setGlobalSosWatch,
      sosTriggered, detectedKeyword, sosPending, cancelSOS,
      fakeCallActive, fakeCallContact, startFakeCall, endFakeCall,
      fireSOS,
    }}>
      {children}
    </SafetyContext.Provider>
  );
};
