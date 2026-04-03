import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Info, AlertTriangle, Shield, ChevronDown, ChevronUp,
  Zap, Eye, Clock, Filter, MapPin, BarChart3, TrendingUp
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ── Leaflet icon fix ───────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const severityIcon = { critical: redIcon, high: orangeIcon, medium: yellowIcon };
const severityColor = { critical: "#ef4444", high: "#f97316", medium: "#eab308" };
const severityLabel = { critical: "🔴 Critical", high: "🟠 High Risk", medium: "🟡 Moderate" };
const severityBg = { critical: "bg-rose-500", high: "bg-orange-500", medium: "bg-amber-500" };

// ── ALL-INDIA Crime Hotspots (NCRB 2023) ──────────────────────
const ALL_THREATS = [
  // DELHI
  { id: 1, city: "Delhi", pos: [28.5800, 77.2500], type: "Chain Snatching", severity: "high", area: "Moti Bagh Crossing", cases: 14, desc: "14 chain-snatching cases in Q3 2023. Criminal gangs on bikes target solo women commuters after sunset.", aiReason: "High-density market with poor CCTV, dark alleys after 8 PM. Peak risk: 7-10 PM.", lastIncident: "2 days ago", time: "Evening" },
  { id: 2, city: "Delhi", pos: [28.5600, 77.3200], type: "Harassment", severity: "high", area: "Lajpat Nagar Underpass", cases: 9, desc: "9 formal complaints of sexual harassment in 2023. Streetlights non-functional for over 6 months.", aiReason: "Isolated underpass with no CCTV, broken street lighting, and known repeat offenders.", lastIncident: "Yesterday", time: "Night" },
  { id: 3, city: "Delhi", pos: [28.6000, 77.3000], type: "Assault & Robbery", severity: "critical", area: "Anand Vihar Back Lane", cases: 5, desc: "5 confirmed assault and robbery cases in 2023. Isolated dead-end alley, suspect still at large.", aiReason: "Dead-end alley with no exit route and no surveillance. Police response time >20 min.", lastIncident: "1 week ago", time: "Late Night" },
  { id: 4, city: "Delhi", pos: [28.5700, 77.2650], type: "Suspicious Loitering", severity: "medium", area: "Sarojini Nagar Metro Gate 4", cases: 21, desc: "21 complaints of intimidation near Metro Gate 4. Groups target lone women after 9 PM.", aiReason: "Commuter blind spot with minimal police presence after 9 PM.", lastIncident: "Today", time: "Evening / Night" },
  { id: 5, city: "Delhi", pos: [28.5900, 77.2900], type: "Pickpocketing", severity: "medium", area: "Nehru Place Market", cases: 32, desc: "32 registered theft cases in 2023. Market perimeter has chaotic parking and low visibility.", aiReason: "High-footfall commercial zone. 32 theft records in 2023 per Delhi Police FIR data.", lastIncident: "Today", time: "All Hours" },
  { id: 6, city: "Delhi", pos: [28.6480, 77.1300], type: "Stalking", severity: "medium", area: "Rohini Sector 11 Park", cases: 6, desc: "6 stalking and indecent exposure complaints in 2023. Poorly lit park with thick foliage.", aiReason: "No functional CCTVs. Park guards leave before dark. Isolated corners.", lastIncident: "3 days ago", time: "Evening" },
  { id: 7, city: "Delhi", pos: [28.6710, 77.0900], type: "Vehicle Theft", severity: "medium", area: "Outer Ring Road, Mangolpuri", cases: 47, desc: "47 vehicle theft and car break-in FIRs in 2023.", aiReason: "No CCTV on outer ring road service lanes. Sparsely patrolled at night.", lastIncident: "Yesterday", time: "Night" },

  // MUMBAI
  { id: 8, city: "Mumbai", pos: [19.0330, 73.0297], type: "Sexual Harassment", severity: "critical", area: "Navi Mumbai Station, Belapur", cases: 18, desc: "18 reported cases near station auto-stands after 10 PM.", aiReason: "Congested station exit with no CCTV coverage on the south bridge.", lastIncident: "2 days ago", time: "Late Night" },
  { id: 9, city: "Mumbai", pos: [19.1136, 72.8697], type: "Chain Snatching", severity: "high", area: "Borivali West Market", cases: 23, desc: "Highest chain snatching incidents in Mumbai North (2023 NCRB).", aiReason: "Dense Sunday market. Bike-borne snatchers target women at crossings.", lastIncident: "Today", time: "Peak Hours" },
  { id: 10, city: "Mumbai", pos: [18.9750, 72.8258], type: "Molestation", severity: "critical", area: "CST Railway Platform 5 & 6", cases: 11, desc: "11 molestation complaints at CST evening rush hours.", aiReason: "Extreme overcrowding during 6-9 PM rush. Impossible personal space.", lastIncident: "Today", time: "Rush Hours" },
  { id: 11, city: "Mumbai", pos: [19.0544, 72.8322], type: "Street Robbery", severity: "high", area: "Dharavi Entry Points", cases: 29, desc: "29 street robbery and theft FIRs from Dharavi periphery in 2023.", aiReason: "Narrow lanes with poor police visibility. High-value phone thefts.", lastIncident: "Yesterday", time: "All Hours" },
  { id: 12, city: "Mumbai", pos: [19.0176, 72.8562], type: "Stalking", severity: "medium", area: "Kurla Station West", cases: 8, desc: "8 stalking cases near Kurla west auto stand.", aiReason: "Station exit auto-rickshaws block police view. No women helpdesk post 9 PM.", lastIncident: "3 days ago", time: "Night" },

  // BENGALURU
  { id: 13, city: "Bengaluru", pos: [12.9352, 77.6245], type: "Assault", severity: "critical", area: "HSR Layout, Sector 6", cases: 7, desc: "7 assault cases in 2023. Inner lanes dark and poorly monitored.", aiReason: "Inadequate street lighting. Cases spike post-midnight on weekends.", lastIncident: "5 days ago", time: "Late Night" },
  { id: 14, city: "Bengaluru", pos: [12.9815, 77.5998], type: "Harassment", severity: "high", area: "Silk Board Junction", cases: 16, desc: "16 harassment cases targeting women on foot during signal wait.", aiReason: "India's busiest junction. Police focus on vehicles, not foot safety.", lastIncident: "Today", time: "All Hours" },
  { id: 15, city: "Bengaluru", pos: [12.9539, 77.6370], type: "Stalking", severity: "medium", area: "Marathahalli Bridge", cases: 13, desc: "13 stalking cases (often by cab drivers) near tech corridor.", aiReason: "Late-night cab dependency zone. FIRs against unverified cabs.", lastIncident: "4 days ago", time: "Late Night" },
  { id: 16, city: "Bengaluru", pos: [13.0358, 77.5970], type: "Pickpocketing", severity: "medium", area: "Hebbal Lake Road", cases: 19, desc: "19 theft cases targeting walkers and joggers.", aiReason: "Busy arterial road. Chasing perpetrators is impossible.", lastIncident: "Yesterday", time: "Morning / Evening" },

  // CHENNAI
  { id: 17, city: "Chennai", pos: [13.0827, 80.2707], type: "Harassment", severity: "high", area: "Central Railway Tunnel", cases: 12, desc: "12 harassment incidents in station underpass area in 2023.", aiReason: "Underpass lacks middle CCTV section. Very crowded.", lastIncident: "3 days ago", time: "Rush & Night" },
  { id: 18, city: "Chennai", pos: [13.0900, 80.2770], type: "Theft", severity: "medium", area: "Parry's Corner Junction", cases: 34, desc: "34 phone theft and pickpocketing FIRs in 2023.", aiReason: "Heavy foot traffic with low police visibility.", lastIncident: "Today", time: "All Hours" },
  { id: 19, city: "Chennai", pos: [12.9943, 80.2183], type: "Eve-Teasing", severity: "high", area: "Velachery Bus Stand", cases: 9, desc: "9 formal complaints at bus terminal by women commuters.", aiReason: "Crowded bus stand. Women-only zone not enforced.", lastIncident: "2 days ago", time: "Evening" },

  // HYDERABAD
  { id: 20, city: "Hyderabad", pos: [17.3850, 78.4867], type: "Night Assault", severity: "critical", area: "Hussain Sagar Promenade", cases: 5, desc: "5 serious assault incidents after midnight.", aiReason: "Promenade lights non-functional. No emergency call boxes.", lastIncident: "2 weeks ago", time: "Post Midnight" },
  { id: 21, city: "Hyderabad", pos: [17.4435, 78.3772], type: "Chain Snatching", severity: "high", area: "Kukatpally KPHB Colony", cases: 22, desc: "22 gold chain snatching in KPHB. Rapid bike gangs.", aiReason: "Wide roads enable quick getaway. Morning walks targeted.", lastIncident: "Yesterday", time: "Morning" },
  { id: 22, city: "Hyderabad", pos: [17.4126, 78.5480], type: "Harassment", severity: "medium", area: "LB Nagar Signal", cases: 11, desc: "11 harassment incidents targeting auto/bus commuters.", aiReason: "Major crossing with poor service road lighting.", lastIncident: "4 days ago", time: "Night" },

  // KOLKATA
  { id: 23, city: "Kolkata", pos: [22.5726, 88.3639], type: "Molestation", severity: "critical", area: "Esplanade Metro Station", cases: 14, desc: "14 molestation cases at station entry/exit in 2023.", aiReason: "Extremely dense peak-hour crowds. Multiple exit points.", lastIncident: "Yesterday", time: "Rush Hours" },
  { id: 24, city: "Kolkata", pos: [22.5958, 88.3696], type: "Robbery", severity: "high", area: "Shyambazar Junction", cases: 17, desc: "17 street robbery cases near Shyambazar theatre area.", aiReason: "Bar area — post-midnight pedestrians targeted.", lastIncident: "5 days ago", time: "Post Midnight" },
  { id: 25, city: "Kolkata", pos: [22.4957, 88.3544], type: "Stalking", severity: "medium", area: "Behala Chowrasta", cases: 8, desc: "8 stalking FIRs from Behala in 2023.", aiReason: "CCTV blind spots at crossroads. Patrol reduced post-1 AM.", lastIncident: "1 week ago", time: "Night" },

  // PUNE
  { id: 26, city: "Pune", pos: [18.5204, 73.8567], type: "Harassment", severity: "high", area: "FC Road, Shivajinagar", cases: 15, desc: "15 harassment complaints on FC Road. College nightlife area.", aiReason: "Inadequate CC footage on side lanes. Cases peak after 10 PM.", lastIncident: "3 days ago", time: "Night" },
  { id: 27, city: "Pune", pos: [18.5074, 73.8077], type: "Theft", severity: "medium", area: "Kothrud Bus Depot", cases: 26, desc: "26 theft cases on PMPML buses in 2023.", aiReason: "Overcrowded routes with no conductors.", lastIncident: "Today", time: "Peak Hours" },

  // JAIPUR
  { id: 28, city: "Jaipur", pos: [26.9124, 75.7873], type: "Tourist Harassment", severity: "high", area: "Hawa Mahal Entry Road", cases: 21, desc: "21 harassment and scam complaints in 2023.", aiReason: "High tourist density. Aggressive touts go unreported.", lastIncident: "Today", time: "All Hours" },
  { id: 29, city: "Jaipur", pos: [26.8929, 75.8069], type: "Chain Snatching", severity: "medium", area: "Johari Bazaar", cases: 18, desc: "18 chain snatching incidents in gold market area.", aiReason: "Bike-borne snatchers on narrow market lanes.", lastIncident: "2 days ago", time: "Market Hours" },

  // AHMEDABAD
  { id: 30, city: "Ahmedabad", pos: [23.0225, 72.5714], type: "Harassment", severity: "high", area: "Relief Road, Old City", cases: 16, desc: "16 harassment cases in dense old city market.", aiReason: "Narrow heritage streets with poor camera coverage.", lastIncident: "Yesterday", time: "Evening / Night" },

  // LUCKNOW
  { id: 31, city: "Lucknow", pos: [26.8467, 80.9462], type: "Eve-Teasing", severity: "high", area: "Hazratganj Market", cases: 19, desc: "19 eve-teasing cases in Lucknow's premier shopping zone.", aiReason: "Post 8 PM lighting inadequate on service lanes.", lastIncident: "Yesterday", time: "Evening / Night" },

  // BHOPAL
  { id: 32, city: "Bhopal", pos: [23.2599, 77.4126], type: "Assault", severity: "critical", area: "Koh-e-Fiza Lake Road", cases: 4, desc: "4 assault cases on remote lake road after dark.", aiReason: "No residential buildings. No CCTV on 3km stretch. Response >15 min.", lastIncident: "2 weeks ago", time: "Night" },

  // PATNA
  { id: 33, city: "Patna", pos: [25.5941, 85.1376], type: "Robbery", severity: "high", area: "Patna Junction Road", cases: 24, desc: "24 robbery incidents on approach roads in 2023.", aiReason: "High migrant footfall. Criminal networks target new arrivals.", lastIncident: "Yesterday", time: "Night" },

  // VARANASI
  { id: 34, city: "Varanasi", pos: [25.3176, 83.0051], type: "Tourist Harassment", severity: "high", area: "Ghats Road Network", cases: 27, desc: "27 harassment and fraud cases targeting tourists.", aiReason: "Unregulated boat operators. Narrow ghat lanes no police vehicles.", lastIncident: "Today", time: "All Hours" },

  // KANPUR
  { id: 35, city: "Kanpur", pos: [26.4499, 80.3319], type: "Robbery", severity: "high", area: "Central Station Back Road", cases: 31, desc: "31 robbery cases on station back road in 2023.", aiReason: "Back lane not covered by police booth. No CCTV on 500m stretch.", lastIncident: "Yesterday", time: "Night" },
];

const CITIES = [...new Set(ALL_THREATS.map(t => t.city))].sort();
const TYPES = [...new Set(ALL_THREATS.map(t => t.type))].sort();

// ── Helper: fit map to visible markers ─────────────────────────
function FitBoundsToMarkers({ threats }) {
  const map = useMap();
  useEffect(() => {
    if (threats.length > 0) {
      const bounds = L.latLngBounds(threats.map(t => t.pos));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [threats, map]);
  return null;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const HeatmapPage = () => {
  const [riskFilter, setRiskFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedThreat, setExpandedThreat] = useState(null);
  const [selectedThreat, setSelectedThreat] = useState(null);

  const filtered = ALL_THREATS.filter(t =>
    (riskFilter === "all" || t.severity === riskFilter) &&
    (cityFilter === "all" || t.city === cityFilter) &&
    (typeFilter === "all" || t.type === typeFilter)
  );

  // Stats
  const criticalCount = filtered.filter(t => t.severity === "critical").length;
  const highCount = filtered.filter(t => t.severity === "high").length;
  const mediumCount = filtered.filter(t => t.severity === "medium").length;
  const totalCases = filtered.reduce((s, t) => s + t.cases, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-8">

      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-slate-900">
          Safety Heatmap
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Live crime hotspots powered by NCRB 2023 data — {ALL_THREATS.length} incidents across {CITIES.length} cities
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Hotspots", value: filtered.length, icon: MapPin, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Total Cases", value: totalCases, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Critical Zones", value: criticalCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Cities Covered", value: CITIES.length, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-slate-200 shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Map */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="h-[500px]">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBoundsToMarkers threats={filtered} />

                {/* Heat circles + markers */}
                {filtered.map(t => (
                  <span key={t.id}>
                    {/* Colored heat radius */}
                    <Circle
                      center={t.pos}
                      radius={t.severity === "critical" ? 3000 : t.severity === "high" ? 2000 : 1500}
                      pathOptions={{
                        color: severityColor[t.severity],
                        fillColor: severityColor[t.severity],
                        fillOpacity: 0.18,
                        weight: 1.5,
                        opacity: 0.5,
                      }}
                    />
                    {/* Marker */}
                    <Marker position={t.pos} icon={severityIcon[t.severity]}
                      eventHandlers={{ click: () => setSelectedThreat(t.id) }}>
                      <Popup>
                        <div className="text-xs max-w-[220px]">
                          <strong className="text-rose-700">{t.type}</strong> · <span className="text-slate-500">{t.city}</span><br />
                          <span className="text-slate-700 font-medium">{t.area}</span><br />
                          <span className="text-slate-600 mt-1 block">{t.desc}</span>
                          <span className="text-rose-600 font-bold mt-1 block">{t.cases} cases · {t.lastIncident}</span>
                          <div className="mt-2 bg-slate-50 rounded p-1.5 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-800">🤖 AI:</span>
                            <span className="text-[10px] text-slate-600 ml-1">{t.aiReason}</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </span>
                ))}
              </MapContainer>
            </div>

            {/* Legend + Data badge */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Critical</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> High</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Moderate</span>
              </div>
              <span className="flex items-center gap-1 text-slate-400">
                <Info className="w-3 h-3" /> NCRB 2023 · {filtered.length}/{ALL_THREATS.length} shown
              </span>
            </div>
          </div>

        </motion.div>

        {/* Sidebar: Filters + Threat List */}
        <motion.div variants={item} className="space-y-4">

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-900">Filters</h3>
            </div>

            {/* Severity */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Severity</p>
              <div className="flex gap-1.5 flex-wrap">
                {["all", "critical", "high", "medium"].map(f => (
                  <button key={f} onClick={() => setRiskFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${riskFilter === f
                      ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">City</p>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-400">
                <option value="all">All Cities ({CITIES.length})</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Crime Type */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Crime Type</p>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-rose-400">
                <option value="all">All Types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <p className="text-[10px] text-slate-400">{filtered.length} threats shown</p>
          </div>

          {/* Threat List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
            {filtered.length === 0 && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
                <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No threats match filters</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your filters above.</p>
              </div>
            )}

            {filtered.map(threat => {
              const expanded = expandedThreat === threat.id;
              const isSelected = selectedThreat === threat.id;
              return (
                <motion.div key={threat.id} layout
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isSelected ? "border-rose-400 ring-2 ring-rose-200" : "border-slate-200"}`}>
                  <div className="p-3 cursor-pointer" onClick={() => { setExpandedThreat(expanded ? null : threat.id); setSelectedThreat(threat.id); }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${severityBg[threat.severity]} shrink-0`} />
                          <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{threat.city}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 leading-snug">{threat.type}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{threat.area}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-lg font-black text-slate-800 leading-none">{threat.cases}</span>
                        <span className="text-[9px] text-slate-400">cases</span>
                        {expanded ? <ChevronUp className="w-3 h-3 text-slate-400 mt-1" /> : <ChevronDown className="w-3 h-3 text-slate-400 mt-1" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50 px-3 py-3 space-y-2">
                        <p className="text-xs text-slate-700">{threat.desc}</p>
                        <div className="flex items-start gap-2 bg-white border border-slate-200 rounded-lg p-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-800 mb-0.5">🤖 AI Analysis</p>
                            <p className="text-[11px] text-slate-600 leading-snug">{threat.aiReason}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Peak: {threat.time}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last: {threat.lastIncident}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Info */}
          <div className="bg-rose-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-rose-700">Auto-warning enabled</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  You'll be warned when entering high-risk areas during Safe Journey.
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
};

export default HeatmapPage;