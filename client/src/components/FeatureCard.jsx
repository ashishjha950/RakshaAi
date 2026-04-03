import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient = "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 cursor-pointer group"
    >
      <div
        className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-shadow duration-300`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      <h3 className="font-display font-semibold text-sm text-slate-900 mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-500 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;