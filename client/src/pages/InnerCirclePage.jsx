import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Phone, MessageCircle, MapPin, Shield, Trash2,
  CheckCircle, UserPlus, Eye
} from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const InnerCirclePage = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      fetchContacts(parsed._id);
    }
  }, []);

  const fetchContacts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/contacts/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  const addContact = async () => {
    if (!newName || (!newEmail && !newPhone) || !user) return;

    try {
      const response = await fetch("http://localhost:3000/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: newName,
          email: newEmail,
          phone: newPhone,
          relation: newRelation || "Contact"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewRelation("");
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to add contact", err);
    }
  };

  // Note: Remove contact logic is not implemented in the backend yet. Ignoring for visual demo.
  const removeContact = (id) => {
    setContacts(contacts.filter((c) => c._id !== id));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Inner Circle
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your trusted contacts who receive alerts and can monitor you.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-rose-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Contact
        </button>
      </motion.div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-2xl p-5 border border-rose-500/30 shadow-lg shadow-rose-500/10"
        >
          <h3 className="font-display font-semibold text-sm text-slate-900 mb-4">
            Add Trusted Contact
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full Name"
              className="bg-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />

            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (For SOS alert)"
              type="email"
              className="bg-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />

            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone Number"
              className="bg-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />

            <input
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              placeholder="Relation"
              className="bg-slate-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500"
            />

          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-slate-500"
            >
              Cancel
            </button>

            <button
              onClick={addContact}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl px-5 py-2 text-sm font-semibold"
            >
              Add Contact
            </button>
          </div>

        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <motion.div variants={item} className="lg:col-span-2 space-y-3">

          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md flex items-center gap-4 group"
            >

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
                {contact.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">

                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {contact.name}
                  </h3>
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>

                <p className="text-xs text-slate-500">
                  {contact.relation} {contact.phone && `· ${contact.phone}`} {contact.email && `· ${contact.email}`}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    Sync Active
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5" /> Receives Alerts
                  </span>
                </div>

              </div>

              <button
                onClick={() => removeContact(contact._id)}
                className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">You haven't added any emergency contacts yet.</p>
            </div>
          )}

        </motion.div>

      </div>

    </motion.div>
  );
};

export default InnerCirclePage;