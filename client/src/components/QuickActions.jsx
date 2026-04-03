import { motion } from "framer-motion";
import { 
  Smartphone, Mic, Vibrate, Volume2, 
  EyeOff, Keyboard, Fingerprint, AlertTriangle,
  Map, Radio, Camera, FileText
} from "lucide-react";
import FeatureCard from "./FeatureCard";

const externalFeatures = [
  { icon: Smartphone, title: "One-Tap SOS", description: "Instant emergency alert to all contacts", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
  { icon: Vibrate, title: "Shake Detection", description: "Shake phone rapidly to trigger SOS", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { icon: Mic, title: "Voice Keyword", description: "Say a secret word to activate alert", gradient: "bg-gradient-to-br from-violet-500 to-pink-600" },
  { icon: Radio, title: "Community Alert", description: "Notify nearby verified responders", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { icon: Map, title: "Safety Heatmap", description: "View risk zones from community data", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { icon: Camera, title: "Evidence Capture", description: "Silent photo & audio recording", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
];

const internalFeatures = [
  { icon: EyeOff, title: "Disguise Mode", description: "App appears as wellness/notes app", gradient: "bg-gradient-to-br from-violet-500 to-pink-600" },
  { icon: Volume2, title: "Volume Trigger", description: "Secret button pattern activates SOS", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
  { icon: Keyboard, title: "Secret Keyword", description: "Type a hidden phrase to alert circle", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { icon: Fingerprint, title: "Silent Distress", description: "No visible alert on your phone", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { icon: AlertTriangle, title: "Guided Response", description: "Helpers get step-by-step guidance", gradient: "bg-gradient-to-br from-violet-500 to-pink-600" },
  { icon: FileText, title: "Secure Evidence", description: "Encrypted log of incidents", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
];

const QuickActions = ({ mode }) => {
  const features = mode === "external" ? externalFeatures : internalFeatures;

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-5"
    >
      <h3 className="font-display font-semibold text-sm text-slate-900 mb-3">
        {mode === "external" ? "Safety Tools" : "Discreet Tools"}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={0.1 * i} />
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;