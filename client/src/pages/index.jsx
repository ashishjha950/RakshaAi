import { motion } from "framer-motion";
import {
  Shield, Navigation, AlertTriangle, Users, Map, Camera, EyeOff,
  TrendingUp, Clock, CheckCircle, ArrowUpRight, Activity
} from "lucide-react";
import { Link } from "react-router-dom";

const statCards = [
  { label: "Active Journeys", value: "0", icon: Navigation, change: "Start one", color: "text-emerald-500" },
  { label: "Inner Circle", value: "3", icon: Users, change: "contacts ready", color: "text-rose-500" },
  { label: "Alerts Sent", value: "0", icon: AlertTriangle, change: "All safe", color: "text-amber-500" },
  { label: "Evidence Files", value: "0", icon: Camera, change: "No captures yet", color: "text-slate-400" },
];

const quickActions = [
  { to: "/safe-journey", icon: Navigation, label: "Start Safe Journey", desc: "Track your route in real-time", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { to: "/sos", icon: AlertTriangle, label: "Configure SOS", desc: "Set up emergency triggers", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
  { to: "/inner-circle", icon: Users, label: "Manage Circle", desc: "Add trusted contacts", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { to: "/heatmap", icon: Map, label: "View Heatmap", desc: "Check area safety", gradient: "bg-gradient-to-br from-violet-500 to-pink-600" },
  { to: "/evidence", icon: Camera, label: "Evidence Capture", desc: "Silent recording tools", gradient: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
  { to: "/disguise", icon: EyeOff, label: "Disguise Mode", desc: "Hide app appearance", gradient: "bg-gradient-to-br from-violet-500 to-pink-600" },
];

const recentActivity = [
  { text: "Safety check completed", time: "Just now", icon: CheckCircle, color: "text-emerald-500" },
  { text: "Inner circle updated", time: "2h ago", icon: Users, color: "text-rose-500" },
  { text: "App configured", time: "Today", icon: Shield, color: "text-slate-400" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const Index = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Your safety systems are active.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <Activity className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{stat.change}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-display font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.gradient} flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:shadow-rose-500/30 transition-shadow`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-sm text-slate-900">{action.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                <ArrowUpRight className="w-4 h-4 text-slate-300 mt-2 group-hover:text-rose-500 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-slate-900">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <act.icon className={`w-4 h-4 ${act.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{act.text}</p>
                  <p className="text-xs text-slate-500">{act.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Safety Score */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm text-slate-900">Safety Score</h3>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-emerald-500">85</span>
              <span className="text-sm text-slate-500 mb-1">/100</span>
            </div>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-slate-500 mt-2">Complete your profile to improve score</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Index;
