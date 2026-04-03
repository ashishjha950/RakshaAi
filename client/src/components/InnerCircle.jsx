import { motion } from "framer-motion";
import { Users, Phone, MessageCircle, Plus } from "lucide-react";

const contacts = [
  { name: "Mom", initials: "M", color: "bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700" },
  { name: "Sara", initials: "S", color: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  { name: "Priya", initials: "P", color: "bg-gradient-to-br from-violet-500 to-pink-600" },
];

const InnerCircle = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mx-5 bg-white rounded-2xl p-4 shadow-md border border-slate-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-rose-500" />
          <h3 className="font-display font-semibold text-sm text-slate-900">Inner Circle</h3>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {contacts.length} trusted
        </span>
      </div>
      <div className="flex items-center gap-3">
        {contacts.map((contact, i) => (
          <motion.div
            key={contact.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-12 h-12 rounded-full ${contact.color} flex items-center justify-center text-white font-display font-semibold text-sm`}>
              {contact.initials}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{contact.name}</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors">
                <Phone className="w-3 h-3 text-slate-500" />
              </button>
              <button className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors">
                <MessageCircle className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </motion.div>
        ))}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-rose-500 transition-colors">
            <Plus className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Add</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default InnerCircle;
