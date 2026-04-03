import { motion } from "framer-motion";
import { Shield, CheckCircle, MapPin } from "lucide-react";

const StatusBanner = ({ mode }) => {
  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mx-5 rounded-2xl p-4 ${
        mode === "external"
          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
          : "bg-gradient-to-br from-violet-500 to-pink-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {mode === "external" ? (
            <MapPin className="w-5 h-5 text-white" />
          ) : (
            <Shield className="w-5 h-5 text-white" />
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-display font-semibold text-white text-sm">
            {mode === "external"
              ? "External Safety Mode"
              : "Internal Safety Mode"}
          </h2>

          <p className="text-white/80 text-xs mt-0.5">
            {mode === "external"
              ? "Public protection active — journey tracking enabled"
              : "Domestic protection active — discreet mode ready"}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
          <CheckCircle className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-medium text-white">Active</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusBanner;