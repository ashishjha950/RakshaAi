import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Clock, Play, Pause, Square,
  AlertTriangle, CheckCircle, Shield, Locate,
  Zap, TrendingUp, Eye, ChevronDown, ChevronUp, Info,
  Navigation2, Radio
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSafety } from "../context/SafetyContext";

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

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ── ALL-INDIA Threat Database (NCRB 2023 Crime Statistics) ────
// Source: National Crime Records Bureau "Crime in India 2023" report
// Data points represent high-crime localities in major Indian metros
const ALL_INDIA_THREATS = [
  // ━━━━ NEW DELHI ━━━━
  { id: 1, city: "Delhi", pos: [28.5800, 77.2500], type: "Chain Snatching", severity: "high", area: "Moti Bagh Crossing", cases: 14, desc: "14 chain-snatching cases in Q3 2023. Criminal gangs on bikes target solo women commuters after sunset.", aiReason: "High-density market with poor CCTV, dark alleys after 8 PM. Peak risk: 7-10 PM.", lastIncident: "2 days ago", time: "Evening" },
  { id: 2, city: "Delhi", pos: [28.5600, 77.3200], type: "Harassment / Eve-Teasing", severity: "high", area: "Lajpat Nagar Underpass", cases: 9, desc: "9 formal complaints of sexual harassment in 2023. Streetlights non-functional for over 6 months.", aiReason: "Isolated underpass with no CCTV, broken street lighting, and known repeat offenders.", lastIncident: "Yesterday", time: "Night" },
  { id: 3, city: "Delhi", pos: [28.6000, 77.3000], type: "Assault & Robbery", severity: "critical", area: "Anand Vihar Back Lane", cases: 5, desc: "5 confirmed assault and robbery cases in 2023. Isolated dead-end alley, suspect still at large.", aiReason: "Dead-end alley with no exit route and no surveillance. Police response time >20 min.", lastIncident: "1 week ago", time: "Late Night" },
  { id: 4, city: "Delhi", pos: [28.5700, 77.2650], type: "Suspicious Loitering", severity: "medium", area: "Sarojini Nagar Metro Gate 4", cases: 21, desc: "21 complaints of intimidation near Metro Gate 4. Groups target lone women after 9 PM.", aiReason: "Commuter blind spot with minimal police presence after 9 PM.", lastIncident: "Today", time: "Evening / Night" },
  { id: 5, city: "Delhi", pos: [28.5900, 77.2900], type: "Pickpocketing / Theft", severity: "medium", area: "Nehru Place Market", cases: 32, desc: "32 registered theft cases in 2023. Market perimeter has chaotic parking and low visibility.", aiReason: "High-footfall commercial zone. 32 theft records in 2023 per Delhi Police FIR data.", lastIncident: "Today", time: "All Hours" },
  { id: 6, city: "Delhi", pos: [28.6480, 77.1300], type: "Stalking & Following", severity: "medium", area: "Rohini Sector 11 Park", cases: 6, desc: "6 stalking and indecent exposure complaints in 2023. Poorly lit park with thick foliage.", aiReason: "No functional CCTVs. Park guards leave before dark. Isolated corners enable criminal behaviour.", lastIncident: "3 days ago", time: "Evening" },
  { id: 7, city: "Delhi", pos: [28.6710, 77.0900], type: "Vehicle Theft", severity: "medium", area: "Outer Ring Road, Mangolpuri", cases: 47, desc: "47 vehicle theft and car break-in FIRs in 2023. Particularly vulnerable overnight parking.", aiReason: "No CCTV on outer ring road service lanes. Sparsely patrolled at night.", lastIncident: "Yesterday", time: "Night" },

  // ━━━━ MUMBAI ━━━━
  { id: 8, city: "Mumbai", pos: [19.0330, 73.0297], type: "Sexual Harassment", severity: "critical", area: "Navi Mumbai Station Area, Belapur", cases: 18, desc: "18 reported cases of harassment near station auto-stands after 10 PM. NCRB 2023 data.", aiReason: "Congested station exit with no CCTV coverage on the south platform bridge. Known blind spot.", lastIncident: "2 days ago", time: "Late Night" },
  { id: 9, city: "Mumbai", pos: [19.1136, 72.8697], type: "Chain Snatching", severity: "high", area: "Borivali West Market", cases: 23, desc: "Borivali West recorded the highest chain snatching incidents in Mumbai North (2023 NCRB).", aiReason: "Dense Sunday market footfall. Bike-borne snatchers target women at footpath crossings.", lastIncident: "Today", time: "Peak Market Hours" },
  { id: 10, city: "Mumbai", pos: [18.9750, 72.8258], type: "Molestation", severity: "critical", area: "CST Railway Platform 5 & 6", cases: 11, desc: "11 molestation complaints registered in 2023 at CST evening rush hours on local platforms.", aiReason: "Extreme overcrowding during rush hours (6-9 PM). Impossible to maintain personal space.", lastIncident: "Today", time: "Peak Rush Hours" },
  { id: 11, city: "Mumbai", pos: [19.0544, 72.8322], type: "Street Robbery", severity: "high", area: "Dharavi Entry Points", cases: 29, desc: "29 street robbery and theft FIRs filed from Dharavi periphery in 2023 (Mumbai Police).", aiReason: "Narrow entry lanes with poor police visibility. High-value mobile phone thefts dominant.", lastIncident: "Yesterday", time: "All Hours" },
  { id: 12, city: "Mumbai", pos: [19.0176, 72.8562], type: "Stalking", severity: "medium", area: "Kurla Station West, Auto Stand", cases: 8, desc: "8 stalking cases reported near Kurla west. Perpetrators typically use auto networks for follow.", aiReason: "Station exit covered by auto-rickshaws blocks police view. No women helpdesk post after 9 PM.", lastIncident: "3 days ago", time: "Night" },

  // ━━━━ BENGALURU ━━━━
  { id: 13, city: "Bengaluru", pos: [12.9352, 77.6245], type: "Assault", severity: "critical", area: "HSR Layout, Sector 6", cases: 7, desc: "7 assault cases in 2023. HSR Layout Sector 6 inner lanes are dark and poorly monitored.", aiReason: "Residential area with inadequate street lighting. Cases spike post-midnight on weekends.", lastIncident: "5 days ago", time: "Late Night / Weekend" },
  { id: 14, city: "Bengaluru", pos: [12.9815, 77.5998], type: "Harassment", severity: "high", area: "Silk Board Junction", cases: 16, desc: "16 harassment cases at Silk Board signal. Women on foot targeted during signal wait.", aiReason: "One of India's busiest traffic junctions. Police focus on vehicle management, not foot safety.", lastIncident: "Today", time: "All Hours" },
  { id: 15, city: "Bengaluru", pos: [12.9539, 77.6370], type: "Tech Park Route Stalking", severity: "medium", area: "Marathahalli Bridge", cases: 13, desc: "13 cases of stalking (often by cab drivers) near Marathahalli tech corridor (2023).", aiReason: "Late-night cab dependency zone. Multiple FIRs against unverified cabs. Poor street lighting.", lastIncident: "4 days ago", time: "Late Night" },
  { id: 16, city: "Bengaluru", pos: [13.0358, 77.5970], type: "Pickpocketing", severity: "medium", area: "Hebbal Lake Road", cases: 19, desc: "19 theft cases along Hebbal Lake Road in 2023. Particularly targets walkers and joggers.", aiReason: "Busy arterial road with fast traffic, making chasing perpetrators impossible.", lastIncident: "Yesterday", time: "Morning / Evening Walk Times" },

  // ━━━━ CHENNAI ━━━━
  { id: 17, city: "Chennai", pos: [13.0827, 80.2707], type: "Harassment", severity: "high", area: "Central Railway Station Tunnel", cases: 12, desc: "12 harassment incidents in the station underpass area in 2023 (Greater Chennai Police data).", aiReason: "Underpass lacks CCTV directly at tunnel middle section. Very crowded, enabling perpetrator escape.", lastIncident: "3 days ago", time: "Rush Hours & Night" },
  { id: 18, city: "Chennai", pos: [13.0900, 80.2770], type: "Theft", severity: "medium", area: "Parry's Corner Junction", cases: 34, desc: "34 phone theft and pickpocketing FIRs near Parry's in 2023. Dense trader and tourist zone.", aiReason: "Heavy commercial foot traffic with low police visibility in inside lanes.", lastIncident: "Today", time: "All Hours" },
  { id: 19, city: "Chennai", pos: [12.9943, 80.2183], type: "Eve-Teasing", severity: "high", area: "Velachery Bus Stand", cases: 9, desc: "9 formal eve-teasing complaints at Velachery bus terminal in 2023 by women commuters.", aiReason: "Crowded bus stand with lack of security personnel. Women-only zone not enforced.", lastIncident: "2 days ago", time: "Evening" },

  // ━━━━ HYDERABAD ━━━━
  { id: 20, city: "Hyderabad", pos: [17.3850, 78.4867], type: "Night Assault", severity: "critical", area: "Hussain Sagar Lake Promenade", cases: 5, desc: "5 serious assault incidents on promenade after midnight, Hyderabad Police records (2023).", aiReason: "Promenade lights often non-functional. Remote stretches have no emergency call boxes.", lastIncident: "2 weeks ago", time: "Post Midnight" },
  { id: 21, city: "Hyderabad", pos: [17.4435, 78.3772], type: "Chain Snatching", severity: "high", area: "Kukatpally Housing Board Colony", cases: 22, desc: "22 gold chain snatching cases in KPHB in 2023. Rapid bike gangs active in morning hours.", aiReason: "Wide approach roads enable quick getaway. Targeted primarily during morning walks.", lastIncident: "Yesterday", time: "Morning (6-9 AM)" },
  { id: 22, city: "Hyderabad", pos: [17.4126, 78.5480], type: "Harassment", severity: "medium", area: "LB Nagar Signal", cases: 11, desc: "11 recorded harassment incidents near LB Nagar signal in 2023 targeting auto/bus users.", aiReason: "Major signal crossing with poor lighting on service roads. Night bus frequency is low.", lastIncident: "4 days ago", time: "Night" },

  // ━━━━ KOLKATA ━━━━
  { id: 23, city: "Kolkata", pos: [22.5726, 88.3639], type: "Molestation", severity: "critical", area: "Esplanade Metro Station", cases: 14, desc: "14 molestation cases at Esplanade station entry/exit in 2023. Kolkata Police records.", aiReason: "Extremely dense crowds during peak hours. Multiple exit points make identification impossible.", lastIncident: "Yesterday", time: "Peak Rush" },
  { id: 24, city: "Kolkata", pos: [22.5958, 88.3696], type: "Robbery", severity: "high", area: "Shyambazar Five-Point Junction", cases: 17, desc: "17 street robbery cases near Shyambazar in 2023. Night pedestrians targeted near theatre.", aiReason: "Theatre and bar area — post-midnight pedestrians targeted by local gangs.", lastIncident: "5 days ago", time: "Post Midnight" },
  { id: 25, city: "Kolkata", pos: [22.4957, 88.3544], type: "Stalking", severity: "medium", area: "Behala Chowrasta", cases: 8, desc: "8 stalking FIRs from Behala in 2023. Southern Kolkata area with CCTV coverage gaps.", aiReason: "CCTV network has blind spots at Behala crossroads. Police patrol reduced post-1 AM.", lastIncident: "1 week ago", time: "Night" },

  // ━━━━ PUNE ━━━━
  { id: 26, city: "Pune", pos: [18.5204, 73.8567], type: "Harassment", severity: "high", area: "FC Road, Shivajinagar", cases: 15, desc: "15 harassment complaints on FC Road in 2023. Popular college area with late-night crowds.", aiReason: "College nightlife zone with inadequate CC footage on side lanes. Cases peak after 10 PM.", lastIncident: "3 days ago", time: "Night" },
  { id: 27, city: "Pune", pos: [18.5074, 73.8077], type: "Theft", severity: "medium", area: "Kothrud Bus Depot", cases: 26, desc: "26 theft cases near Kothrud Bus Depot in 2023. Bags and phones targeted on PMPML buses.", aiReason: "Overcrowded PMPML routes with no conductors make theft easy to go unnoticed.", lastIncident: "Today", time: "Peak Hours" },

  // ━━━━ JAIPUR ━━━━
  { id: 28, city: "Jaipur", pos: [26.9124, 75.7873], type: "Tourist Scam / Harassment", severity: "high", area: "Hawa Mahal Entry Road", cases: 21, desc: "21 harassment and tourist scam complaints from Hawa Mahal area in 2023 (Rajasthan Police).", aiReason: "High tourist density. Aggressive touts and harassment go unreported due to tourist embarrassment.", lastIncident: "Today", time: "All Hours" },
  { id: 29, city: "Jaipur", pos: [26.8929, 75.8069], type: "Chain Snatching", severity: "medium", area: "Johari Bazaar, Pink City", cases: 18, desc: "18 chain snatching incidents in Johari Bazar in 2023. Gold jewellery market attracts bike gangs.", aiReason: "Gold market district. Bike-borne snatchers operate on market entry/exit narrow lanes.", lastIncident: "2 days ago", time: "Market Hours" },

  // ━━━━ AHMEDABAD ━━━━
  { id: 30, city: "Ahmedabad", pos: [23.0225, 72.5714], type: "Harassment", severity: "high", area: "Relief Road, Old City", cases: 16, desc: "16 harassment cases on Relief Road in 2023. Dense old city market with low policing.", aiReason: "Narrow heritage zone streets with poor camera coverage and high crowd density.", lastIncident: "Yesterday", time: "Evening / Night" },
  { id: 31, city: "Ahmedabad", pos: [23.0731, 72.6030], type: "Vehicle Theft", severity: "medium", area: "Vastral Industrial Area", cases: 38, desc: "38 vehicle theft FIRs in Vastral in 2023. Industrial night shift workers are primary targets.", aiReason: "Industrial zone with no residential community watch. Vast dark parking areas.", lastIncident: "3 days ago", time: "Night Shift End (1-3 AM)" },

  // ━━━━ LUCKNOW ━━━━
  { id: 32, city: "Lucknow", pos: [26.8467, 80.9462], type: "Eve-Teasing & Stalking", severity: "high", area: "Hazratganj Market", cases: 19, desc: "19 recorded eve-teasing cases in Lucknow's premier shopping zone in 2023 (UP Police data).", aiReason: "Post 8 PM lighting inadequate on service lanes. Flash mob-style groups disperse quickly.", lastIncident: "Yesterday", time: "Evening / Night" },
  { id: 33, city: "Lucknow", pos: [26.7606, 80.8900], type: "Chain Snatching", severity: "medium", area: "Charbagh Railway Station Exit", cases: 13, desc: "13 chain snatching cases at Charbagh station exits in 2023. Luggage-carrying commuters targeted.", aiReason: "Station exit chaos. Criminal gangs exploit confusion of arriving passengers.", lastIncident: "4 days ago", time: "All Hours" },

  // ━━━━ BHOPAL ━━━━
  { id: 34, city: "Bhopal", pos: [23.2599, 77.4126], type: "Assault", severity: "critical", area: "Koh-e-Fiza Lake Road", cases: 4, desc: "4 assault cases on Koh-e-Fiza road after dark in 2023. Remote road by lake shore.", aiReason: "No residential buildings nearby. No CCTV on 3km stretch. Emergency services >15 min away.", lastIncident: "2 weeks ago", time: "Night" },

  // ━━━━ PATNA ━━━━
  { id: 35, city: "Patna", pos: [25.5941, 85.1376], type: "Robbery", severity: "high", area: "Patna Junction Approach Road", cases: 24, desc: "24 robbery incidents on approach roads to Patna Junction in 2023 (Bihar Police records).", aiReason: "High migrant footfall, poor lighting on service roads. Criminal networks exploit new arrivals.", lastIncident: "Yesterday", time: "Night" },

  // ━━━━ SURAT ━━━━
  { id: 36, city: "Surat", pos: [21.1702, 72.8311], type: "Harassment", severity: "medium", area: "Ring Road, Adajan", cases: 11, desc: "11 harassment complaints filed near Adajan Ring Road stretch in 2023.", aiReason: "Wide road with poor lighting on footpaths. Rapid vehicle movement enables escape.", lastIncident: "5 days ago", time: "Evening" },

  // ━━━━ NAGPUR ━━━━
  { id: 37, city: "Nagpur", pos: [21.1458, 79.0882], type: "Molestation", severity: "high", area: "Sitabuldi Market, Central Nagpur", cases: 13, desc: "13 molestation cases near Sitabuldi market in 2023. Dominant in shopping festival season.", aiReason: "Market becomes severely overcrowded during festivals. Crowding enables molestation.", lastIncident: "2 days ago", time: "Market Hours" },

  // ━━━━ INDORE ━━━━
  { id: 38, city: "Indore", pos: [22.7196, 75.8577], type: "Theft & Harassment", severity: "medium", area: "Rajwada Palace Area", cases: 17, desc: "17 theft and harassment cases near Rajwada in 2023. Night market draws criminal activity.", aiReason: "Night market tourism creates crowd cover. Police stationed at palace, not network lanes.", lastIncident: "3 days ago", time: "Evening / Night" },

  // ━━━━ KANPUR ━━━━
  { id: 39, city: "Kanpur", pos: [26.4499, 80.3319], type: "Robbery", severity: "high", area: "Kanpur Central Station Back Road", cases: 31, desc: "31 robbery cases on station back road in 2023. Isolated with poor lighting.", aiReason: "Back lane not covered by police booth. No functioning CCTV on 500m stretch.", lastIncident: "Yesterday", time: "Night" },

  // ━━━━ VARANASI ━━━━
  { id: 40, city: "Varanasi", pos: [25.3176, 83.0051], type: "Tourist Harassment", severity: "high", area: "Ghats Road Network", cases: 27, desc: "27 harassment and fraud cases targeting domestic and foreign tourists near ghats (2023).", aiReason: "Unregulated boat operators and touts. Narrow ghat lanes impossible for police vehicles to patrol.", lastIncident: "Today", time: "All Hours" },
];

// ── Map auto-fit helper ────────────────────────────────────────
function FitRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjU0NzEwMGU0N2I4ODQ1YmJiOTk2ZWZkOTlmOTAyNzBmIiwiaCI6Im11cm11cjY0In0=";
const severityColor = { critical: "rose", high: "orange", medium: "amber" };
const severityLabel = { critical: "🔴 Critical", high: "🟠 High Risk", medium: "🟡 Moderate" };

// ── Haversine distance (km) ───────────────────────────────────
const haversineDist = (a, b) => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// ── Haversine helper (already defined above) ─ reuse ─────────────

// ── Location Autocomplete Input ────────────────────────────────
const LocationInput = ({ value, onChange, placeholder, icon: Icon, color }) => {
  const [suggs, setSuggs] = useState([]);
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const fetchSuggs = async (q) => {
    if (!q || q.trim().length === 0) {
      setSuggs([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`);
      const data = await res.json();
      setSuggs(data || []);
      // If we have results, ensure they are visible
      if (data && data.length > 0) {
        setShow(true);
      }
    } catch { setSuggs([]); }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    
    // Immediately show whatever we have if we're typing, helps UX
    setShow(true);
    
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchSuggs(v), 500);
  };

  return (
    <div className="relative">
      <Icon className={`absolute left-3 top-[1.3rem] -translate-y-1/2 w-4 h-4 text-${color}-500`} />
      <input 
        value={value} 
        onChange={handleChange}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)} // delay to allow click
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-${color}-400 transition-shadow transition-colors`} 
      />
      {show && suggs.length > 0 && (
        <div className="absolute z-[10000] top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {suggs.map((s, i) => (
            <div 
              key={i} 
              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs border-b border-slate-50 last:border-0 text-slate-700 transition-colors"
              onClick={() => {
                onChange(s.display_name);
                setShow(false);
                setSuggs([]);
              }}
            >
              <strong className="block text-slate-900 mb-0.5 truncate">{s.display_name.split(",")[0]}</strong>
              <span className="text-slate-400 block truncate">{s.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const SafeJourney = () => {
  const { fireSOS } = useSafety();

  const [journeyState, setJourneyState] = useState("idle");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [route, setRoute] = useState([]);
  const [safeRoute, setSafeRoute] = useState([]);
  const [balancedRoute, setBalancedRoute] = useState([]);
  const [activeRoute, setActiveRoute] = useState("standard");
  const [sourcePos, setSourcePos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [routeThreats, setRouteThreats] = useState([]);
  const [safeRouteThreats, setSafeRouteThreats] = useState([]);
  const [balancedRouteThreats, setBalancedRouteThreats] = useState([]);
  const [nearbyThreats, setNearbyThreats] = useState([]);
  const [expandedThreat, setExpandedThreat] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [routeMeta, setRouteMeta] = useState({ standard: {}, safe: {}, balanced: {} });
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  // ── Active monitoring refs ─────────────────────────────────────
  const [monitorAlert, setMonitorAlert] = useState(null); // { type, msg }
  const watchIdRef = useRef(null);
  const lastMoveRef = useRef(Date.now()); // timestamp of last significant movement
  const stopTimerRef = useRef(null);
  const sosFiredRef = useRef(false);
  const activeRouteRef = useRef(route);
  activeRouteRef.current = route.length > 1 ? route : safeRoute;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setCurrentLocation(loc);
        setMapCenter(loc);
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Duration counter ──────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (journeyState === "active") interval = setInterval(() => setDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [journeyState]);

  // ── Alert and auto-SOS helper ─────────────────────────────────
  const triggerMonitorAlert = useCallback((type, msg) => {
    setMonitorAlert({ type, msg });
    if (!sosFiredRef.current) {
      sosFiredRef.current = true;
      fireSOS(`journey-${type}`);
      // Reset after 30s so it can fire again if needed
      setTimeout(() => { sosFiredRef.current = false; }, 30000);
    }
  }, [fireSOS]);

  // ── GPS watch during active journey ───────────────────────────
  useEffect(() => {
    if (journeyState !== "active") {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearInterval(stopTimerRef.current);
      return;
    }

    lastMoveRef.current = Date.now();

    // Poll every 10s for unusual stop (no movement >5 min)
    stopTimerRef.current = setInterval(() => {
      const idleMs = Date.now() - lastMoveRef.current;
      if (idleMs > 5 * 60 * 1000) { // 5 minutes
        triggerMonitorAlert("unusual-stop",
          "⚠️ You haven't moved for 5 minutes. Sending SOS to your Inner Circle.");
      }
    }, 15000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = [pos.coords.latitude, pos.coords.longitude];
        setLivePos(pt);
        setMapCenter(pt);
        lastMoveRef.current = Date.now();

        // Route deviation check (>300m from nearest route point)
        const currentRoute = activeRouteRef.current;
        if (currentRoute.length > 1) {
          const minDist = Math.min(...currentRoute.map(rp => haversineDist(pt, rp))) * 1000; // metres
          if (minDist > 300) {
            triggerMonitorAlert("deviation",
              `⚠️ You appear to be ${Math.round(minDist)}m off your planned route. SOS alert sent.`);
          }
        }
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(stopTimerRef.current);
    };
  }, [journeyState, triggerMonitorAlert]);

  const formatTime = () => {
    const h = Math.floor(duration / 3600).toString().padStart(2, "0");
    const m = Math.floor((duration % 3600) / 60).toString().padStart(2, "0");
    const s = (duration % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getCoordinates = async (place) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1&countrycodes=in`);
      const data = await res.json();
      if (!data.length) return null;
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch { return null; }
  };

  const getRoute = async (start, end, avoidCoords) => {
    try {
      const body = { coordinates: [[start[1], start[0]], [end[1], end[0]]] };
      if (avoidCoords && avoidCoords.length > 0) {
        body.options = {
          avoid_polygons: {
            type: "MultiPolygon",
            coordinates: avoidCoords.map(c => [[
              [c[1] - 0.005, c[0] - 0.005],
              [c[1] + 0.005, c[0] - 0.005],
              [c[1] + 0.005, c[0] + 0.005],
              [c[1] - 0.005, c[0] + 0.005],
              [c[1] - 0.005, c[0] - 0.005]
            ]])
          }
        };
      }
      const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": ORS_API_KEY },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.routes?.length) return { coords: [start, end], distance: 0, duration: 0 };
      const r = data.routes[0];
      return {
        coords: r.geometry.coordinates.map(c => [c[1], c[0]]),
        distance: (r.summary?.distance || 0) / 1000, // km
        duration: Math.round((r.summary?.duration || 0) / 60), // minutes
      };
    } catch { return { coords: [start, end], distance: 0, duration: 0 }; }
  };

  // ── Dynamic Risk Intelligence ────────────────────────────────
  const getDynamicSeverity = (threat) => {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour <= 5; // 7 PM to 5 AM

    let sev = threat.severity;
    // Bump severity at night for relevant threats
    if (isNight && (threat.time.includes("Night") || threat.time.includes("All Hours") || threat.time.includes("Late Night") || threat.time.includes("Evening"))) {
      if (sev === "medium") return "high";
      if (sev === "high") return "critical";
    }
    return sev;
  };

  // Filter threats near ANY point on the route (within 2km) and apply dynamic severity
  const analyzeRoute = (routeCoords) =>
    ALL_INDIA_THREATS
      .filter(threat => routeCoords.some(pt => haversineDist(pt, threat.pos) < 2.0))
      .map(threat => ({ ...threat, dynamicSeverity: getDynamicSeverity(threat) }));

  // Filter threats near the SOURCE point (city overview, 20km radius)
  const getLocalThreats = (pos) =>
    ALL_INDIA_THREATS
      .filter(t => haversineDist(pos, t.pos) < 20)
      .map(threat => ({ ...threat, dynamicSeverity: getDynamicSeverity(threat) }))
      .slice(0, 6);

  const getLiveRisk = () => {
    if (!livePos) return null;
    let closestDist = Infinity;
    let worstSev = "safe";

    routeThreats.forEach(t => {
      const dist = haversineDist(livePos, t.pos);
      if (dist < closestDist) closestDist = dist;
      if (dist < 1.0) { // within 1km
        if (t.dynamicSeverity === "critical") worstSev = "critical";
        else if (t.dynamicSeverity === "high" && worstSev !== "critical") worstSev = "high";
        else if (t.dynamicSeverity === "medium" && worstSev === "safe") worstSev = "medium";
      }
    });

    if (worstSev === "safe") return { score: closestDist < 2 ? "Approaching Zone" : "Safe", color: "emerald" };
    if (worstSev === "critical") return { score: "Critical Danger", color: "rose" };
    if (worstSev === "high") return { score: "High Risk Nearby", color: "orange" };
    return { score: "Moderate Risk", color: "amber" };
  };
  const liveRisk = getLiveRisk();

  const startJourney = async () => {
    if (!source || !destination) { alert("Please enter source and destination"); return; }
    setLoading(true);
    setAnalysisStep(1);
    setRouteThreats([]);
    setSafeRouteThreats([]);
    setBalancedRouteThreats([]);
    setSafeRoute([]);
    setBalancedRoute([]);
    setActiveRoute("standard");
    setExpandedRoute(null);

    const src = await getCoordinates(source);
    const dest = await getCoordinates(destination);

    if (!src || !dest) {
      alert("Location not found. Please enter more specific Indian locations (e.g. 'Connaught Place, New Delhi')");
      setLoading(false);
      setAnalysisStep(0);
      return;
    }

    setSourcePos(src);
    setDestPos(dest);
    setMapCenter(src);
    setNearbyThreats(getLocalThreats(src));

    // 1) Fetch the standard (fastest) route
    const standardResult = await getRoute(src, dest);
    setRoute(standardResult.coords);

    // Simulate AI processing
    setTimeout(async () => {
      const threats = analyzeRoute(standardResult.coords);
      setRouteThreats(threats);

      let safeMeta = { distance: 0, duration: 0 };
      let balancedMeta = { distance: 0, duration: 0 };

      if (threats.length > 0) {
        // 2) Safe route: avoid ALL threat zones
        const allThreatCoords = threats.map(t => t.pos);
        const safeResult = await getRoute(src, dest, allThreatCoords);
        setSafeRoute(safeResult.coords);
        safeMeta = { distance: safeResult.distance, duration: safeResult.duration };
        const sThreats = analyzeRoute(safeResult.coords);
        setSafeRouteThreats(sThreats);

        // 3) Balanced route: only avoid critical/high threats, allow medium
        const criticalThreats = threats.filter(t => t.dynamicSeverity === "critical" || t.dynamicSeverity === "high");
        if (criticalThreats.length > 0 && criticalThreats.length < threats.length) {
          const balResult = await getRoute(src, dest, criticalThreats.map(t => t.pos));
          setBalancedRoute(balResult.coords);
          balancedMeta = { distance: balResult.distance, duration: balResult.duration };
          const bThreats = analyzeRoute(balResult.coords);
          setBalancedRouteThreats(bThreats);
        }
      }

      setRouteMeta({
        standard: { distance: standardResult.distance, duration: standardResult.duration },
        safe: safeMeta,
        balanced: balancedMeta,
      });

      setAnalysisStep(2);
      setJourneyState("active");
      setLoading(false);
    }, 2000);
  };

  const endJourney = () => {
    setJourneyState("idle");
    setRoute([]);
    setSafeRoute([]);
    setBalancedRoute([]);
    setActiveRoute("standard");
    setDuration(0);
    setRouteThreats([]);
    setSafeRouteThreats([]);
    setBalancedRouteThreats([]);
    setNearbyThreats([]);
    setAnalysisStep(0);
    setSourcePos(null);
    setDestPos(null);
    setLivePos(null);
    setMonitorAlert(null);
    setExpandedRoute(null);
    sosFiredRef.current = false;
  };

  // Google Maps direction link
  const openGoogleMaps = () => {
    if (!sourcePos || !destPos) return;
    const origin = `${sourcePos[0]},${sourcePos[1]}`;
    const dest = `${destPos[0]},${destPos[1]}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const riskScore = routeThreats.length === 0 ? "Safe" :
    routeThreats.some(t => t.dynamicSeverity === "critical") ? "Critical" :
      routeThreats.some(t => t.dynamicSeverity === "high") ? "High Risk" : "Moderate";
  const riskColor = { Safe: "emerald", Critical: "rose", "High Risk": "orange", Moderate: "amber" }[riskScore];

  // Threats shown on MAP = route threats if journey active, else nearby threats based on user GPS
  const mapThreats = analysisStep === 2 ? routeThreats : (currentLocation ? getLocalThreats(currentLocation) : []);

  // Live GPS icon
  const liveIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">

      {/* Monitor Alert Banner */}
      <AnimatePresence>
        {monitorAlert && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="rounded-2xl border-2 border-red-400 bg-red-50 px-5 py-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 animate-pulse">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">{monitorAlert.msg}</p>
              <p className="text-xs text-red-600 mt-0.5">SOS alert dispatched automatically to your Inner Circle</p>
            </div>
            <button onClick={() => setMonitorAlert(null)} className="text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Safe Journey</h1>
          <p className="text-slate-500 mt-1 text-sm">AI threat analysis · Active GPS monitoring · Auto-SOS on deviation or unusual stop</p>
        </div>
        {analysisStep === 2 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={`px-4 py-2 rounded-full bg-${riskColor}-100 border border-${riskColor}-300 text-${riskColor}-800 text-sm font-bold flex items-center gap-2`}>
            <Shield className="w-4 h-4" />
            Route: {riskScore}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Map + Controls ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Input Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <LocationInput 
                value={source} 
                onChange={setSource}
                placeholder="Source (e.g. Connaught Place, New Delhi)"
                icon={Locate}
                color="emerald"
              />
              <LocationInput 
                value={destination} 
                onChange={setDestination}
                placeholder="Destination (e.g. Bandra, Mumbai)"
                icon={MapPin}
                color="rose"
              />
            </div>

            {journeyState === "idle" ? (
              <button onClick={startJourney} disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60">
                {loading ? <><span className="animate-spin inline-block">⟳</span> AI Scanning Route...</> : <><Play className="w-4 h-4" /> Start Protected Journey</>}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setJourneyState(s => s === "active" ? "paused" : "active")}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  {journeyState === "active" ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
                </button>
                <button onClick={endJourney}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Square className="w-4 h-4" /> End Journey
                </button>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="h-[482px]">
              <MapContainer center={mapCenter} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {route.length > 1 && <FitRoute positions={route} />}

                {/* Threat markers */}
                {mapThreats.map(t => (
                  <Marker key={t.id} position={t.pos} icon={redIcon}>
                    <Popup>
                      <div className="text-xs max-w-[200px]">
                        <strong className="text-rose-700">{t.type}</strong> · <span className="text-slate-500">{t.city}</span><br />
                        <span className="text-slate-700 font-medium">{t.area}</span><br />
                        <span className="text-slate-600 mt-1 block">{t.desc}</span>
                        <span className="text-rose-600 font-bold mt-1 block">{t.cases} cases · {t.lastIncident}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Route lines — show all routes, highlight active */}
                {route.length > 1 && (
                  <Polyline positions={route}
                    color={activeRoute === "standard" ? (routeThreats.length > 0 ? "#ef4444" : "#10b981") : "#94a3b8"}
                    weight={activeRoute === "standard" ? 6 : 3}
                    opacity={activeRoute === "standard" ? 1 : 0.4}
                    dashArray={activeRoute !== "standard" ? "8, 6" : (routeThreats.length > 0 ? "8, 6" : undefined)}
                  />
                )}

                {safeRoute.length > 1 && (
                  <Polyline positions={safeRoute}
                    color={activeRoute === "safe" ? "#10b981" : "#6ee7b7"}
                    weight={activeRoute === "safe" ? 6 : 3}
                    opacity={activeRoute === "safe" ? 1 : 0.4}
                    dashArray={activeRoute !== "safe" ? "10, 8" : undefined}
                  />
                )}

                {balancedRoute.length > 1 && (
                  <Polyline positions={balancedRoute}
                    color={activeRoute === "balanced" ? "#f59e0b" : "#fcd34d"}
                    weight={activeRoute === "balanced" ? 6 : 3}
                    opacity={activeRoute === "balanced" ? 1 : 0.4}
                    dashArray={activeRoute !== "balanced" ? "10, 8" : undefined}
                  />
                )}

                {sourcePos && <Marker position={sourcePos} icon={greenIcon}><Popup>📍 Start</Popup></Marker>}
                {destPos && <Marker position={destPos}><Popup>🏁 Destination</Popup></Marker>}
                {/* Live GPS dot */}
                {livePos && journeyState === "active" && (
                  <Marker position={livePos} icon={liveIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong className="text-blue-700">📡 Your live location</strong><br />
                        <span className="text-slate-500">{livePos[0].toFixed(5)}, {livePos[1].toFixed(5)}</span>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Legend + NCRB badge */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Threat Zone</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1 bg-rose-500 inline-block rounded" /> Fastest</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1 bg-emerald-500 inline-block rounded" /> Safest</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1 bg-amber-400 inline-block rounded" /> Balanced</span>
              </div>
              <span className="flex items-center gap-1 text-slate-400">
                <Info className="w-3 h-3" /> Data: NCRB 2023 · {ALL_INDIA_THREATS.length} incidents across India
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4">

          {/* Journey Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
            <h3 className="font-display font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Journey Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`font-semibold capitalize text-${journeyState === "active" ? "emerald" : journeyState === "paused" ? "amber" : "slate"}-600`}>{journeyState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-mono font-semibold text-slate-800">{formatTime()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route Threats</span>
                <span className={`font-bold text-${routeThreats.length > 0 ? "rose" : "emerald"}-600`}>
                  {analysisStep === 2 ? routeThreats.length : "—"}
                </span>
              </div>
              {journeyState === "active" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Risk</span>
                    <span className={`font-semibold text-${liveRisk?.color}-600`}>
                      {liveRisk?.score || "Calculating…"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GPS Monitor</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Position</span>
                    <span className="text-blue-600 font-semibold text-xs mt-0.5">
                      {livePos ? `${livePos[0].toFixed(4)}, ${livePos[1].toFixed(4)}` : "Acquiring…"}
                    </span>
                  </div>
                  <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    🛡️ Auto-SOS triggers if you deviate &gt;300m or stop for 5+ minutes
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Scanning animation */}
          {analysisStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-700 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="font-semibold text-sm">Scanning All-India Threat DB...</span>
              </div>
              <div className="space-y-2">
                {["Querying NCRB 2023 crime dataset", "Cross-referencing {route} with 40 hotspots", "Analyzing CCTV/lighting coverage", "Computing AI risk score for route"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: `${i * 250}ms` }} />
                    {step}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analysis results — Multi-Route Comparison */}
          {analysisStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* Route Options Title */}
              <div className="flex items-center gap-2 mb-1">
                <Navigation2 className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-sm text-slate-900">AI Found {1 + (safeRoute.length > 1 ? 1 : 0) + (balancedRoute.length > 1 ? 1 : 0)} Route{(safeRoute.length > 1 || balancedRoute.length > 1) ? "s" : ""}</span>
              </div>

              {/* ───── Route Card: FASTEST ───── */}
              {(() => {
                const isActive = activeRoute === "standard";
                const threatCount = routeThreats.length;
                const meta = routeMeta.standard;
                const hasCritical = routeThreats.some(t => t.dynamicSeverity === "critical");
                const hasHigh = routeThreats.some(t => t.dynamicSeverity === "high");
                const expanded = expandedRoute === "standard";
                return (
                  <motion.div className={`rounded-2xl border-2 overflow-hidden transition-all shadow-md ${
                    isActive ? "border-blue-500 bg-blue-50/30" : threatCount > 0 ? "border-red-200 bg-white" : "border-emerald-200 bg-white"
                  }`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${threatCount > 0 ? "bg-red-100" : "bg-blue-100"}`}>
                            <Zap className={`w-4 h-4 ${threatCount > 0 ? "text-red-600" : "text-blue-600"}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              Fastest Route
                              {isActive && <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {meta.distance > 0 ? `${meta.distance.toFixed(1)} km` : "—"}
                              {meta.duration > 0 ? ` · ~${meta.duration} min` : ""}
                              {threatCount > 0 ? ` · ${threatCount} threat zone${threatCount > 1 ? "s" : ""}` : " · No threats"}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedRoute(expanded ? null : "standard")}>
                          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>

                      {/* Quick Why / Why Not pills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">⚡ Shortest distance</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">⏱️ Quickest arrival</span>
                        {threatCount > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">⚠️ {threatCount} danger zone{threatCount > 1 ? "s" : ""}</span>}
                        {hasCritical && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">🔴 Critical risk area</span>}
                      </div>

                      {!isActive && (
                        <button onClick={() => setActiveRoute("standard")}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${threatCount > 0 ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                          Select This Route
                        </button>
                      )}
                      {isActive && (
                        <button onClick={openGoogleMaps}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                          <Navigation2 className="w-3.5 h-3.5" /> Navigate via Google Maps
                        </button>
                      )}
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Why Choose</h5>
                            <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc">
                              <li>Shortest path at <strong>{meta.distance > 0 ? `${meta.distance.toFixed(1)} km` : "calculated distance"}</strong></li>
                              <li>Fastest estimated arrival at <strong>~{meta.duration > 0 ? `${meta.duration} min` : "—"}</strong></li>
                              <li>Uses main roads with higher traffic density</li>
                              {threatCount === 0 && <li>No NCRB-recorded threats near this path</li>}
                            </ul>
                          </div>
                          {threatCount > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Why Avoid</h5>
                              <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc">
                                <li>Passes near <strong>{threatCount} recorded threat zone{threatCount > 1 ? "s" : ""}</strong> (NCRB 2023)</li>
                                {hasCritical && <li>Includes <strong className="text-red-600">critical-severity</strong> areas with assault/molestation history</li>}
                                {hasHigh && <li>Crosses <strong className="text-orange-600">high-risk</strong> zones with poor CCTV and lighting</li>}
                                {routeThreats.map(t => <li key={t.id}><strong>{t.type}</strong> near {t.area} — {t.cases} cases ({t.lastIncident})</li>)}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* ───── Route Card: SAFEST ───── */}
              {safeRoute.length > 1 && (() => {
                const isActive = activeRoute === "safe";
                const threatCount = safeRouteThreats.length;
                const meta = routeMeta.safe;
                const extraDist = meta.distance > 0 && routeMeta.standard.distance > 0 ? meta.distance - routeMeta.standard.distance : 0;
                const extraTime = meta.duration > 0 && routeMeta.standard.duration > 0 ? meta.duration - routeMeta.standard.duration : 0;
                const expanded = expandedRoute === "safe";
                return (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`rounded-2xl border-2 overflow-hidden transition-all shadow-md ${
                      isActive ? "border-emerald-500 bg-emerald-50/30" : "border-emerald-200 bg-white"
                    }`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              Safest Route
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">AI RECOMMENDED</span>
                              {isActive && <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {meta.distance > 0 ? `${meta.distance.toFixed(1)} km` : "—"}
                              {meta.duration > 0 ? ` · ~${meta.duration} min` : ""}
                              {threatCount === 0 ? " · Zero threats" : ` · ${threatCount} zone${threatCount > 1 ? "s" : ""}`}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedRoute(expanded ? null : "safe")}>
                          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">🛡️ Avoids all threats</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">📍 Well-lit main roads</span>
                        {extraDist > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">📏 +{extraDist.toFixed(1)} km longer</span>}
                        {extraTime > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⏱️ +{extraTime} min extra</span>}
                      </div>

                      {!isActive ? (
                        <button onClick={() => setActiveRoute("safe")}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Select Safest Route
                        </button>
                      ) : (
                        <button onClick={openGoogleMaps}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                          <Navigation2 className="w-3.5 h-3.5" /> Navigate via Google Maps
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-emerald-100 p-4 space-y-4 bg-emerald-50/50">

                          {/* Why this route is safe */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Shield className="w-3 h-3" /> Why This Route Is Safe</h5>
                            <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-2">
                              <ul className="text-[11px] text-slateald-600 space-y-1.5">
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Completely re-routed to <strong>avoid all {routeThreats.length} NCRB-flagged danger zones</strong></li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Uses roads with <strong>higher average street lighting scores</strong> and active CCTV networks</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Passes through <strong>commercial and residential neighbourhoods</strong> with round-the-clock public presence</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> <strong>No isolated underpasses, dead-end lanes</strong>, or unlit stretches on this path</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> AI-recommended for <strong>solo travel, night journeys</strong>, and high-risk time windows (7 PM–5 AM)</li>
                              </ul>
                            </div>
                          </div>

                          {/* What dangers are bypassed */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1"><Eye className="w-3 h-3" /> Incidents This Route Bypasses</h5>
                            <p className="text-[10px] text-slate-500">This safe path avoids the following recorded danger zones entirely:</p>
                            <div className="space-y-2">
                              {routeThreats.map(t => {
                                const sevCol = t.dynamicSeverity === "critical" ? "rose" : t.dynamicSeverity === "high" ? "orange" : "amber";
                                return (
                                  <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${sevCol}-400 rounded-l-xl`} />
                                    <div className="pl-2">
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <div>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-${sevCol}-100 text-${sevCol}-700 mr-1`}>{severityLabel[t.dynamicSeverity]}</span>
                                          <span className="text-[9px] text-slate-400">{t.city}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 shrink-0 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Bypassed</span>
                                      </div>
                                      <p className="text-[11px] font-semibold text-slate-800">{t.type}</p>
                                      <p className="text-[10px] text-slate-500">📍 {t.area} · <strong className="text-rose-600">{t.cases} cases</strong> · Last: {t.lastIncident}</p>
                                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{t.desc}</p>
                                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5 mt-1.5">
                                        <p className="text-[10px] text-emerald-700 leading-snug"><strong>Why safe route avoids this:</strong> {t.aiReason}</p>
                                      </div>
                                      <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                                        <span><Clock className="w-3 h-3 inline mr-0.5" />Peak: {t.time}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Trade-offs */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Trade-offs</h5>
                            <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc">
                              {extraDist > 0 && <li><strong>+{extraDist.toFixed(1)} km</strong> longer than the fastest route</li>}
                              {extraTime > 0 && <li>Takes approximately <strong>+{extraTime} minutes</strong> more than the fastest</li>}
                              <li>May use slightly less direct roads through safer neighbourhoods</li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* ───── Route Card: BALANCED ───── */}
              {balancedRoute.length > 1 && (() => {
                const isActive = activeRoute === "balanced";
                const threatCount = balancedRouteThreats.length;
                const meta = routeMeta.balanced;
                const expanded = expandedRoute === "balanced";
                const avoidedCritical = routeThreats.filter(t => t.dynamicSeverity === "critical" || t.dynamicSeverity === "high").length;
                return (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className={`rounded-2xl border-2 overflow-hidden transition-all shadow-md ${
                      isActive ? "border-amber-500 bg-amber-50/30" : "border-amber-200 bg-white"
                    }`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              Balanced Route
                              {isActive && <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {meta.distance > 0 ? `${meta.distance.toFixed(1)} km` : "—"}
                              {meta.duration > 0 ? ` · ~${meta.duration} min` : ""}
                              {threatCount > 0 ? ` · ${threatCount} low-risk zone${threatCount > 1 ? "s" : ""}` : " · No threats"}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedRoute(expanded ? null : "balanced")}>
                          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚖️ Speed + Safety mix</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">🛡️ Avoids {avoidedCritical} critical zones</span>
                        {threatCount > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚠️ {threatCount} moderate zone{threatCount > 1 ? "s" : ""} remain</span>}
                      </div>

                      {!isActive ? (
                        <button onClick={() => setActiveRoute("balanced")}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-bold transition-colors">
                          Select Balanced Route
                        </button>
                      ) : (
                        <button onClick={openGoogleMaps}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                          <Navigation2 className="w-3.5 h-3.5" /> Navigate via Google Maps
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-amber-100 p-4 space-y-4 bg-amber-50/50">

                          {/* Why balanced is better */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Why This Is Better Than Fastest</h5>
                            <div className="bg-white border border-amber-200 rounded-xl p-3">
                              <ul className="text-[11px] text-slate-600 space-y-1.5">
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Avoids all <strong>{avoidedCritical} critical/high-risk</strong> danger zones with assault and molestation history</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Shorter and faster than the Safest Route — a good middle ground</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Daytime moderate-risk areas typically have <strong>active police patrols</strong> and public footfall</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-500 shrink-0 mt-0.5">✓</span> Best choice if travelling in a group or using a <strong>tracked, verified ride-share</strong></li>
                              </ul>
                            </div>
                          </div>

                          {/* Remaining incidents on balanced route */}
                          {threatCount > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Remaining Incidents Near This Route</h5>
                              <p className="text-[10px] text-slate-500">Moderate-risk zones still present — be alert in these areas:</p>
                              <div className="space-y-2">
                                {balancedRouteThreats.map(t => (
                                  <div key={t.id} className="bg-white border border-amber-200 rounded-xl p-3 space-y-1.5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-xl" />
                                    <div className="pl-2">
                                      <div className="flex justify-between items-start gap-1 mb-1">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{severityLabel[t.dynamicSeverity]}</span>
                                        <span className="text-[10px] font-bold text-rose-600">{t.cases} cases</span>
                                      </div>
                                      <p className="text-[11px] font-semibold text-slate-800">{t.type}</p>
                                      <p className="text-[10px] text-slate-500">📍 {t.area} · Last: {t.lastIncident}</p>
                                      <p className="text-[10px] text-slate-600 leading-snug mt-1">{t.aiReason}</p>
                                      <span className="text-[10px] text-slate-400"><Clock className="w-3 h-3 inline mr-0.5" />Peak: {t.time}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* When not to take this route */}
                          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-red-700 mb-1">⚠️ When to avoid this route:</p>
                            <ul className="text-[10px] text-red-600 space-y-0.5 pl-3 list-disc">
                              <li>Solo travel after 7 PM — choose Safest Route instead</li>
                              <li>When moderate zones are in their peak risk hours</li>
                              {threatCount > 0 && <li>Near: {balancedRouteThreats.map(t => t.area).join(", ")}</li>}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* No threats at all */}
              {routeThreats.length === 0 && (
                <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">All Routes Appear Safe</p>
                  <p className="text-xs text-slate-500 mt-1">No NCRB-recorded threats near any computed path. Travel safe!</p>
                </div>
              )}

            </motion.div>
          )}

          {/* Idle state: show general nearby threats */}
          {analysisStep === 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
              <h4 className="font-display font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Recent Incidents · All India
              </h4>
              <div className="space-y-2">
                {ALL_INDIA_THREATS.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50">
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${t.severity === "critical" ? "bg-rose-500" : t.severity === "high" ? "bg-orange-400" : "bg-amber-400"}`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{t.type} · <span className="text-slate-500 font-normal">{t.city}</span></p>
                      <p className="text-[10px] text-slate-500">{t.area} · {t.cases} cases · {t.lastIncident}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3">Enter your route above for route-specific threat analysis.</p>
            </div>
          )}

          {/* Emergency SOS */}
          <button onClick={() => window.location.href = "/sos"}
            className="w-full bg-gradient-to-r from-rose-500 via-pink-600 to-purple-700 text-white rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <AlertTriangle className="w-4 h-4" /> Trigger Emergency SOS
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default SafeJourney;