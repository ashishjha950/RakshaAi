import { motion } from "framer-motion";
import { useState } from "react";

const SOSButton = () => {
  const [activated, setActivated] = useState(false);

  const handleSOS = () => {
    setActivated(true);
    setTimeout(() => setActivated(false), 3000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full bg-rose-500/15 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-pulse-ring" style={{ animationDelay: "1s" }} />
        
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSOS}
          className={`relative z-10 w-28 h-28 rounded-full font-display font-bold text-lg tracking-wider text-white shadow-lg shadow-rose-500/30 transition-all duration-300 ${
            activated ? "bg-emerald-500" : "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700"
          }`}
        >
          {activated ? "SENT!" : "SOS"}
        </motion.button>
      </div>
      <p className="text-xs text-slate-500 font-medium">
        {activated ? "Alerts sent to your circle" : "Tap & hold for emergency"}
      </p>
    </div>
  );
};

export default SOSButton;
