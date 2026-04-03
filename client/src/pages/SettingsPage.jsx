import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings, User, Bell, Shield, Lock, Smartphone, Globe,
  Moon, Volume2, Vibrate, Save, ChevronRight, LogOut
} from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const SettingsPage = () => {
  const navigate = useNavigate();
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [shakeDetect, setShakeDetect] = useState(true);
  const [voiceActivation, setVoiceActivation] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [silentMode, setSilentMode] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const Toggle = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${enabled ? "bg-emerald-500 justify-end" : "bg-slate-100 justify-start"
        }`}
    >
      <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-display font-semibold text-sm text-slate-900">
          {title}
        </h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, desc, children }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Configure your safety preferences and account settings.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LEFT SIDE */}

        <motion.div variants={item} className="space-y-4">

          <Section title="Profile">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center text-white font-display font-bold text-xl">
                U
              </div>
              <div>
                <p className="font-display font-semibold text-slate-900">User</p>
                <p className="text-xs text-slate-500">user@example.com</p>
                <button className="text-xs text-rose-500 font-medium mt-1">
                  Edit Profile
                </button>
              </div>
            </div>
          </Section>

          <Section title="SOS Configuration">

            <SettingRow
              icon={Vibrate}
              label="Shake Detection"
              desc="Trigger SOS by shaking phone"
            >
              <Toggle
                enabled={shakeDetect}
                onToggle={() => setShakeDetect(!shakeDetect)}
              />
            </SettingRow>

            <SettingRow
              icon={Volume2}
              label="Voice Activation"
              desc="Use keyword to trigger SOS"
            >
              <Toggle
                enabled={voiceActivation}
                onToggle={() => setVoiceActivation(!voiceActivation)}
              />
            </SettingRow>

            <SettingRow
              icon={Bell}
              label="Auto Safety Check"
              desc="Periodic check-in prompts"
            >
              <Toggle
                enabled={autoConfirm}
                onToggle={() => setAutoConfirm(!autoConfirm)}
              />
            </SettingRow>

          </Section>

          <Section title="Emergency Services">
            <div className="space-y-3">
              {[
                { label: "Women Helpline", number: "181" },
                { label: "Police", number: "100" },
                { label: "Ambulance", number: "108" },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">{svc.label}</span>
                  <span className="text-sm font-mono font-semibold text-rose-500">
                    {svc.number}
                  </span>
                </div>
              ))}
            </div>
          </Section>

        </motion.div>

        {/* RIGHT SIDE */}

        <motion.div variants={item} className="space-y-4">

          <Section title="Privacy & Security">

            <SettingRow
              icon={Globe}
              label="Location Sharing"
              desc="Share live location with circle"
            >
              <Toggle
                enabled={locationSharing}
                onToggle={() => setLocationSharing(!locationSharing)}
              />
            </SettingRow>

            <SettingRow
              icon={Lock}
              label="Silent Alert Mode"
              desc="No visible notifications on SOS"
            >
              <Toggle
                enabled={silentMode}
                onToggle={() => setSilentMode(!silentMode)}
              />
            </SettingRow>

            <SettingRow
              icon={Shield}
              label="Data Encryption"
              desc="End-to-end encryption for evidence"
            >
              <span className="text-xs text-emerald-500 font-semibold">
                Always On
              </span>
            </SettingRow>

          </Section>

          <Section title="Notifications">
            {[
              "Safety check reminders",
              "Journey alerts",
              "Community alerts",
              "Inner Circle updates",
            ].map((n) => (
              <div key={n} className="flex items-center justify-between">
                <span className="text-sm text-slate-900">{n}</span>
                <Toggle enabled={true} onToggle={() => { }} />
              </div>
            ))}
          </Section>

          <Section title="About SHEild">
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-slate-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Platform</span>
                <span className="text-slate-900">Web Application</span>
              </div>
            </div>
          </Section>

          {/* Logout */}
          <div className="bg-white rounded-2xl border border-red-200 shadow-md overflow-hidden">
            <div className="p-4 border-b border-red-100">
              <h3 className="font-display font-semibold text-sm text-red-600 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Account
              </h3>
            </div>
            <div className="p-4">
              {!logoutConfirm ? (
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 text-center">Are you sure you want to logout?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogoutConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-md"
                    >
                      Yes, Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;