import { motion } from "framer-motion";
import { Navigation, Clock, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";

const SafeJourneyCard = () => {
  const [journeyActive, setJourneyActive] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mx-5 bg-white rounded-2xl p-4 shadow-md border border-slate-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-4 h-4 text-emerald-500" />
        <h3 className="font-display font-semibold text-sm text-slate-900">Safe Journey</h3>
      </div>

      {!journeyActive ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Where are you going?"
              className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 w-full outline-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setJourneyActive(true)}
            className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl py-2.5 text-sm font-display font-semibold flex items-center justify-center gap-2"
          >
            Start Safe Journey
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-500/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-500">Journey in progress</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">12 min</span>
            </div>
          </div>
          <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-rose-500 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">Live tracking active</p>
            </div>
          </div>
          <button
            onClick={() => setJourneyActive(false)}
            className="w-full bg-slate-100 text-slate-500 rounded-xl py-2.5 text-sm font-display font-medium"
          >
            End Journey
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SafeJourneyCard;
