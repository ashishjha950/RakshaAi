import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, Mic, Video, FileText, Download, Trash2,
  Lock, Shield, Square, Image as ImageIcon,
  AlertTriangle, CheckCircle, Eye, EyeOff, Mail,
  KeyRound, WifiOff, Wifi, X, Upload, CloudUpload
} from "lucide-react";

import { useSafety } from "../context/SafetyContext";

const API = "http://localhost:3000/api";
const SOS_KEYWORDS = ["sos", "help", "danger", "bachao", "save me", "attack", "rape", "sexual", "harassment", "emergency"];
const LS_KEY = "raksha_evidence_cloud"; // localStorage key for Cloudinary URLs

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const nowLabel = () =>
  new Date().toLocaleString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

const formatSec = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── Upload a blob to Cloudinary via our backend ────────────────────
const uploadToCloudinary = async (blob, mimeType, isSos = false) => {
  const form = new FormData();
  const ext = mimeType.includes("audio") ? "webm"
    : mimeType.includes("video") ? "webm"
      : "jpg";
  form.append("file", new File([blob], `evidence_${Date.now()}.${ext}`, { type: mimeType }));
  form.append("isSos", String(isSos));

  const res = await fetch(`${API}/evidence/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json(); // { url, publicId, resourceType, bytes }
};

// ─── EvidencePage ──────────────────────────────────────────────────
const EvidencePage = () => {
  const { vaultPin, setVaultPin } = useSafety();

  // Load from localStorage — only keep entries with real Cloudinary URLs (publicId) or notes
  // Blob URLs (blob:http://...) don't survive page refresh, so we drop them
  const [files, setFiles] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      return saved.filter(f =>
        f.type === "note" ||         // notes have no URL, always safe to load
        (f.publicId && f.url && !f.url.startsWith("blob:")) // Cloudinary entries only
      );
    } catch { return []; }
  });

  const [uploadingId, setUploadingId] = useState(null); // track which file is uploading

  // Recording
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // SOS detection
  const [sosActive, setSosActive] = useState(false);
  const [sosAlert, setSosAlert] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [detectedWord, setDetectedWord] = useState("");

  // Vault
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Refs
  const audioRecRef = useRef(null);
  const videoRecRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const timerRef = useRef(null);
  const sosRecRef = useRef(null);
  const sosChunks = useRef([]);
  const sosRecActive = useRef(false);
  const recRef = useRef(null); // SpeechRecognition
  const emailSentRef = useRef(false);
  const sosActiveRef = useRef(false);
  const userRef = useRef({});

  useEffect(() => {
    try { userRef.current = JSON.parse(localStorage.getItem("user") || "{}"); } catch { /**/ }
  }, []);

  // Persist to localStorage whenever files change
  const saveFiles = (list) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch { /**/ }
  };

  const addFile = useCallback((entry) => {
    setFiles(prev => { const n = [entry, ...prev]; saveFiles(n); return n; });
  }, []);

  const updateFile = useCallback((id, patch) => {
    setFiles(prev => { const n = prev.map(f => f.id === id ? { ...f, ...patch } : f); saveFiles(n); return n; });
  }, []);

  const deleteFile = (id) => {
    setFiles(prev => { const n = prev.filter(f => f.id !== id); saveFiles(n); return n; });
  };

  // ── Timer ─────────────────────────────────────────────────────────
  const startTimer = () => { setTimer(0); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); };
  const stopTimer = () => { clearInterval(timerRef.current); setTimer(0); };

  // ── SOS Email ──────────────────────────────────────────────────────
  const sendSOSEmail = useCallback(async () => {
    if (emailSentRef.current) return;
    emailSentRef.current = true;
    setEmailStatus("sending");
    try {
      let coords = null;
      try {
        const p = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        coords = { lat: p.coords.latitude, lng: p.coords.longitude };
      } catch { /**/ }

      const res = await fetch(`${API}/contacts/sos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userRef.current?._id || "", coordinates: coords }),
      });
      if (res.ok) {
        setEmailStatus("sent");
        setSosAlert(a => a ? { ...a, emailSent: true } : a);
      } else {
        setEmailStatus("error"); emailSentRef.current = false;
      }
    } catch { setEmailStatus("error"); emailSentRef.current = false; }
  }, []);

  // Stop SOS recording 3s after email confirmed sent
  useEffect(() => {
    if (emailStatus === "sent") {
      setTimeout(() => { if (sosRecRef.current?.state === "recording") sosRecRef.current.stop(); }, 3000);
    }
  }, [emailStatus]);

  // ── SOS Auto Recording (upload to Cloudinary on stop) ─────────────
  const startSosRecording = useCallback(async (keyword) => {
    if (sosRecActive.current) return;
    sosRecActive.current = true;
    sosChunks.current = [];

    const tempId = `sos_${Date.now()}`;
    addFile({
      id: tempId, type: "audio", isSos: true,
      name: `🚨 SOS — "${keyword}" — ${nowLabel()}`,
      date: nowLabel(), size: "recording…", encrypted: true,
      url: null, uploading: true,
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      sosRecRef.current = rec;
      rec.ondataavailable = e => { if (e.data.size > 0) sosChunks.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        sosRecActive.current = false;
        if (sosChunks.current.length === 0) return;
        const blob = new Blob(sosChunks.current, { type: "audio/webm" });
        try {
          const result = await uploadToCloudinary(blob, "audio/webm", true);
          updateFile(tempId, {
            url: result.url, publicId: result.publicId,
            size: `${(result.bytes / 1024).toFixed(1)} KB`, uploading: false,
          });
        } catch { updateFile(tempId, { uploading: false, url: URL.createObjectURL(blob) }); }
      };
      rec.start(500);
    } catch { sosRecActive.current = false; }
  }, [addFile, updateFile]);

  // ── SOS Background Listener ────────────────────────────────────────
  useEffect(() => {
    sosActiveRef.current = sosActive;
    if (!sosActive) { recRef.current?.stop(); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSosActive(false); return; }

    emailSentRef.current = false;
    setEmailStatus(null);

    const create = () => {
      const r = new SR();
      r.lang = "en-IN"; r.continuous = true; r.interimResults = true;
      recRef.current = r;

      r.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript.toLowerCase() + " ";
        const kw = SOS_KEYWORDS.find(k => text.includes(k));
        if (kw && !sosRecActive.current && !emailSentRef.current) {
          setDetectedWord(kw);
          setSosAlert({ keyword: kw, time: nowLabel(), emailSent: false });
          startSosRecording(kw);
          sendSOSEmail();
        }
      };
      r.onend = () => { if (sosActiveRef.current) setTimeout(() => { try { create().start(); } catch { /**/ } }, 300); };
      r.onerror = (e) => { if (e.error !== "not-allowed" && sosActiveRef.current) setTimeout(() => { try { create().start(); } catch { /**/ } }, 1000); };
      return r;
    };

    try { create().start(); } catch { /**/ }
    return () => { recRef.current?.stop(); };
  }, [sosActive, startSosRecording, sendSOSEmail]);

  // ── AUDIO Recording ───────────────────────────────────────────────
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];
      const tempId = `audio_${Date.now()}`;

      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        // Show immediately with object URL while uploading
        addFile({
          id: tempId, type: "audio",
          name: `Audio Recording — ${nowLabel()}`,
          date: nowLabel(), size: `${(blob.size / 1024).toFixed(1)} KB`,
          encrypted: true, url: URL.createObjectURL(blob), uploading: true,
        });
        setUploadingId(tempId);
        try {
          const result = await uploadToCloudinary(blob, "audio/webm");
          updateFile(tempId, { url: result.url, publicId: result.publicId, uploading: false });
        } catch { updateFile(tempId, { uploading: false }); }
        setUploadingId(null);
      };
      audioRecRef.current = rec;
      rec.start(200);
      setAudioRecording(true); startTimer();
    } catch { alert("Microphone access denied."); }
  };
  const stopAudio = () => { audioRecRef.current?.stop(); setAudioRecording(false); stopTimer(); };

  // ── VIDEO Recording ───────────────────────────────────────────────
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) { videoPreviewRef.current.srcObject = stream; videoPreviewRef.current.play(); }
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks = [];
      const tempId = `video_${Date.now()}`;

      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        const blob = new Blob(chunks, { type: "video/webm" });
        addFile({
          id: tempId, type: "video",
          name: `Video Recording — ${nowLabel()}`,
          date: nowLabel(), size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
          encrypted: true, url: URL.createObjectURL(blob), uploading: true,
        });
        setUploadingId(tempId);
        try {
          const result = await uploadToCloudinary(blob, "video/webm");
          updateFile(tempId, { url: result.url, publicId: result.publicId, uploading: false });
        } catch { updateFile(tempId, { uploading: false }); }
        setUploadingId(null);
      };
      videoRecRef.current = rec;
      rec.start(200);
      setVideoRecording(true); startTimer();
    } catch { alert("Camera/microphone access denied."); }
  };
  const stopVideo = () => { videoRecRef.current?.stop(); setVideoRecording(false); stopTimer(); };

  // ── Silent Photo ──────────────────────────────────────────────────
  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream; await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
      canvas.getContext("2d").drawImage(video, 0, 0);
      stream.getTracks().forEach(t => t.stop());
      canvas.toBlob(async (blob) => {
        const tempId = `photo_${Date.now()}`;
        addFile({
          id: tempId, type: "photo",
          name: `Silent Photo — ${nowLabel()}`,
          date: nowLabel(), size: `${(blob.size / 1024).toFixed(1)} KB`,
          encrypted: true, url: URL.createObjectURL(blob), uploading: true,
        });
        setUploadingId(tempId);
        try {
          const result = await uploadToCloudinary(blob, "image/jpeg");
          updateFile(tempId, { url: result.url, publicId: result.publicId, uploading: false });
        } catch { updateFile(tempId, { uploading: false }); }
        setUploadingId(null);
      }, "image/jpeg", 0.92);
    } catch { alert("Camera access denied."); }
  };

  // ── Note ──────────────────────────────────────────────────────────
  const saveNote = () => {
    if (!noteText.trim()) return;
    addFile({
      id: Date.now().toString(), type: "note",
      name: `Incident Note — ${nowLabel()}`,
      date: nowLabel(), size: `${noteText.length} chars`,
      encrypted: true, noteContent: noteText,
    });
    setNoteText(""); setShowNote(false);
  };

  // ── PIN Vault ─────────────────────────────────────────────────────
  const handlePinKey = (k) => {
    const next = pin + k;
    if (next.length > 4) return;
    setPin(next); setPinError(false);
    if (next.length === 4) {
      if (!vaultPin) {
        setVaultPin(next);
        setVaultUnlocked(true);
        setPin("");
      } else if (next === vaultPin) {
        setVaultUnlocked(true);
        setPin("");
      } else {
        setPinError(true);
        setTimeout(() => { setPin(""); setPinError(false); }, 700);
      }
    }
  };

  const downloadFile = (file) => {
    if (!file.url) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = `evidence_${Date.now()}.${file.type === "audio" ? "webm" : file.type === "video" ? "webm" : "jpg"}`;
    a.target = "_blank"; a.click();
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-slate-900">Evidence Capture</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Recordings auto-upload to <strong>Cloudinary</strong> — survive page refresh. Vault unlocked with your secure PIN.
        </p>
      </motion.div>

      {/* Upload progress banner */}
      <AnimatePresence>
        {uploadingId && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 text-blue-800 text-sm font-medium">
            <CloudUpload className="w-5 h-5 text-blue-500 animate-bounce shrink-0" />
            Uploading evidence to Cloudinary… File is already saved locally while uploading.
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Alert Banner */}
      <AnimatePresence>
        {sosAlert && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">🚨 SOS Keyword: "<span className="uppercase">{sosAlert.keyword}</span>"</p>
              <p className="text-xs text-red-600 mt-0.5">{sosAlert.time} — Recording + Cloudinary upload started</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {emailStatus === "sending" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                    <Mail className="w-3 h-3" /> Sending SOS email…
                  </span>
                )}
                {emailStatus === "sent" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> ✅ Email sent! Recording stops in 3s
                  </span>
                )}
                {emailStatus === "error" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    <X className="w-3 h-3" /> Email failed — add contacts in Inner Circle
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setSosAlert(null)}><X className="w-4 h-4 text-red-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-5">

          {/* Capture Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Silent Photo", icon: Camera, action: takePhoto },
              { label: "Audio Record", icon: audioRecording ? Square : Mic, action: audioRecording ? stopAudio : startAudio, active: audioRecording },
              { label: "Video Record", icon: videoRecording ? Square : Video, action: videoRecording ? stopVideo : startVideo, active: videoRecording },
              { label: "Write Note", icon: FileText, action: () => setShowNote(true) },
            ].map(ctrl => (
              <button key={ctrl.label} onClick={ctrl.action}
                className={`bg-white rounded-2xl p-5 border shadow-md text-center transition-all active:scale-95
                  ${ctrl.active ? "border-red-500 shadow-red-200" : "border-slate-200 hover:shadow-lg"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3
                  ${ctrl.active ? "bg-red-100" : "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700"}`}>
                  <ctrl.icon className={`w-5 h-5 ${ctrl.active ? "text-red-500" : "text-white"}`} />
                </div>
                <h4 className="font-semibold text-sm text-slate-900">{ctrl.label}</h4>
                <p className={`text-[10px] mt-0.5 font-medium ${ctrl.active ? "text-red-500 animate-pulse" : "text-slate-500"}`}>
                  {ctrl.active ? `● REC ${formatSec(timer)}` : ctrl.label === "Silent Photo" ? "No shutter sound" : ctrl.label === "Write Note" ? "Text evidence" : "Tap to start"}
                </p>
              </button>
            ))}
          </div>

          {/* Live Video Preview */}
          <AnimatePresence>
            {videoRecording && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="relative rounded-2xl overflow-hidden border-2 border-red-400 bg-black shadow-lg shadow-red-500/20">
                  <video ref={videoPreviewRef} muted className="w-full max-h-64 object-cover" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">● REC {formatSec(timer)}</span>
                  </div>
                  <button onClick={stopVideo} className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <Square className="w-3 h-3" /> Stop
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Vault ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {vaultUnlocked ? <Eye className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-rose-500" />}
                <h3 className="font-semibold text-sm text-slate-900">
                  Evidence Vault — {vaultUnlocked ? "Unlocked ✓" : "Locked 🔒"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{files.length} file{files.length !== 1 ? "s" : ""}</span>
                {vaultUnlocked && (
                  <button onClick={() => setVaultUnlocked(false)} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Lock
                  </button>
                )}
              </div>
            </div>

            {/* PIN Pad */}
            {!vaultUnlocked && (
              <div className="p-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">
                    {!vaultPin ? "Create a 4-digit Vault PIN" : "Enter PIN to view evidence"}
                  </p>
                </div>
                <motion.div className="flex gap-3" animate={pinError ? { x: [-6, 6, -4, 4, 0] } : {}}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? (pinError ? "bg-red-400 border-red-400" : "bg-rose-500 border-rose-500") : "border-slate-300"}`} />
                  ))}
                </motion.div>
                <div className="grid grid-cols-3 gap-2 w-52">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
                    k === "" ? <div key={i} /> :
                      <button key={i}
                        onClick={() => k === "⌫" ? setPin(p => p.slice(0, -1)) : handlePinKey(String(k))}
                        className="w-full aspect-square rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 font-bold text-slate-800 text-xl transition-all active:scale-90 flex items-center justify-center">
                        {k}
                      </button>
                  ))}
                </div>
                {pinError && <p className="text-xs text-red-500 font-medium animate-pulse">Wrong PIN.</p>}
              </div>
            )}

            {/* Files */}
            {vaultUnlocked && (
              <div className="divide-y divide-slate-100">
                {files.length === 0 && (
                  <div className="p-10 text-center text-slate-400 text-sm">No evidence yet. Use buttons above to capture.</div>
                )}
                {files.map(file => (
                  <div key={file.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${file.isSos ? "bg-red-100" : "bg-rose-50"}`}>
                        {file.type === "audio" && <Mic className={`w-5 h-5 ${file.isSos ? "text-red-600" : "text-rose-600"}`} />}
                        {file.type === "video" && <Video className="w-5 h-5 text-rose-600" />}
                        {file.type === "photo" && <ImageIcon className="w-5 h-5 text-rose-600" />}
                        {file.type === "note" && <FileText className="w-5 h-5 text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{file.name}</h4>
                          {file.isSos && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold shrink-0">SOS</span>}
                          {file.uploading
                            ? <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                              <Upload className="w-2.5 h-2.5" /> Uploading…
                            </span>
                            : file.publicId
                              ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <CheckCircle className="w-2.5 h-2.5" /> Cloudinary
                              </span>
                              : <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">Local</span>
                          }
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Lock className="w-2.5 h-2.5" /> Encrypted
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{file.date} · {file.size}</p>

                        {file.type === "audio" && file.url && <audio controls className="mt-2 w-full h-8" src={file.url} />}
                        {file.type === "video" && file.url && <video controls className="mt-2 w-full max-h-48 rounded-xl bg-black" src={file.url} />}
                        {file.type === "photo" && file.url && (
                          <img src={file.url} alt="evidence"
                            className="mt-2 w-full max-h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewFile(file)} />
                        )}
                        {file.type === "note" && (
                          <p className="mt-2 text-xs text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100 whitespace-pre-wrap">{file.noteContent}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {file.type !== "note" && (
                          <button onClick={() => downloadFile(file)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        )}
                        <button onClick={() => deleteFile(file.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </motion.div>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <motion.div variants={item} className="space-y-4">

          {/* SOS Toggle */}
          <div className={`rounded-2xl p-5 border shadow-md transition-colors ${sosActive ? "bg-red-50 border-red-300" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {sosActive ? <Wifi className="w-4 h-4 text-red-500 animate-pulse" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
                <h3 className="font-semibold text-sm text-slate-900">SOS Voice Watch</h3>
              </div>
              <button onClick={() => {
                emailSentRef.current = false;
                setSosAlert(null); setEmailStatus(null); setDetectedWord("");
                setSosActive(a => !a);
              }} className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${sosActive ? "bg-red-500 justify-end" : "bg-slate-200 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <p className={`text-xs leading-relaxed ${sosActive ? "text-red-600 font-medium" : "text-slate-500"}`}>
              {sosActive ? "🎤 Listening. Keyword → auto-record + SOS email + Cloudinary upload." : `Enable to listen for: ${SOS_KEYWORDS.slice(0, 4).join(", ")}…`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {SOS_KEYWORDS.map(kw => (
                <span key={kw} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${detectedWord === kw ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600"}`}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-slate-900">How Evidence is Stored</h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                "Plays back immediately (local)",
                "Auto-uploads to Cloudinary ☁️",
                "Survives page refresh after upload",
                "Vault locked with your secure PIN",
                "SOS recordings labelled & uploaded",
                "Download any file anytime",
              ].map(f => (
                <div key={f} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </div>


        </motion.div>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {showNote && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="w-4 h-4 text-rose-500" /> Incident Note</h3>
                <button onClick={() => setShowNote(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Describe what happened — time, place, what was said or done..."
                rows={7} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowNote(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">Cancel</button>
                <button onClick={saveNote} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold">Save Note</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Preview */}
      <AnimatePresence>
        {previewFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewFile(null)}>
            <motion.img src={previewFile.url} alt="preview"
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()} />
            <button onClick={() => setPreviewFile(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default EvidencePage;