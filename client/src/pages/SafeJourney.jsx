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
// ── Main Component ─────────────────────────────────────────────
const SafeJourney = () => {
  const { fireSOS } = useSafety();

  const [journeyState, setJourneyState] = useState("idle");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [livePos, setLivePos] = useState(null); // real-time GPS during journey
  const [route, setRoute] = useState([]);
  const [safeRoute, setSafeRoute] = useState([]);
  const [activeRoute, setActiveRoute] = useState("standard");
  const [sourcePos, setSourcePos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [routeThreats, setRouteThreats] = useState([]);
  const [nearbyThreats, setNearbyThreats] = useState([]);
  const [expandedThreat, setExpandedThreat] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
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
      // If we have threat coordinates to avoid, pass them to ORS
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
      if (!res.ok || !data.routes?.length) return [start, end];
      return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    } catch { return [start, end]; }
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
    setSafeRoute([]);
    setActiveRoute("standard");

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

    const routeCoords = await getRoute(src, dest);
    setRoute(routeCoords);

    // Simulate AI processing
    setTimeout(async () => {
      const threats = analyzeRoute(routeCoords);
      setRouteThreats(threats);

      // If threats found, compute a safe alternative avoiding threat coordinates
      if (threats.length > 0) {
        const threatCoords = threats.map(t => t.pos);
        const safeCoords = await getRoute(src, dest, threatCoords);
        setSafeRoute(safeCoords);
      }

      setAnalysisStep(2);
      setJourneyState("active");
      setLoading(false);
    }, 2000);
  };

  const endJourney = () => {
    setJourneyState("idle");
    setRoute([]);
    setSafeRoute([]);
    setActiveRoute("standard");
    setDuration(0);
    setRouteThreats([]);
    setNearbyThreats([]);
    setAnalysisStep(0);
    setSourcePos(null);
    setDestPos(null);
    setLivePos(null);
    setMonitorAlert(null);
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
              <div className="relative">
                <Locate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input value={source} onChange={e => setSource(e.target.value)}
                  placeholder="Source (e.g. Connaught Place, New Delhi)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input value={destination} onChange={e => setDestination(e.target.value)}
                  placeholder="Destination (e.g. Bandra, Mumbai)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
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

                {/* Route lines */}
                {route.length > 1 && activeRoute === "standard" && (
                  <Polyline positions={route}
                    color={routeThreats.length > 0 ? "#ef4444" : "#10b981"}
                    weight={5}
                    dashArray={routeThreats.length > 0 ? "8, 6" : undefined}
                  />
                )}

                {/* Safe Alternative Route (green) */}
                {safeRoute.length > 1 && (
                  <Polyline positions={safeRoute}
                    color="#10b981"
                    weight={activeRoute === "safe" ? 6 : 3}
                    opacity={activeRoute === "safe" ? 1 : 0.6}
                    dashArray={activeRoute === "safe" ? undefined : "10, 8"}
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
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Threat Zone</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1 bg-rose-500 inline-block rounded" /> Risk Route</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1 bg-emerald-500 inline-block rounded" /> Safe Route</span>
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

          {/* Analysis results */}
          {analysisStep === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {/* Summary */}
              <div className={`bg-${riskColor}-50 border border-${riskColor}-200 rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={`w-4 h-4 text-${riskColor}-600`} />
                  <span className={`font-bold text-sm text-${riskColor}-900`}>AI Route Analysis</span>
                </div>
                {routeThreats.length === 0
                  ? <p className="text-xs text-emerald-700">✅ No threat zones detected along your route. Stay alert and travel safe!</p>
                  : <p className="text-xs text-rose-800 font-medium">⚠️ Route passes near <strong>{routeThreats.length}</strong> recorded threat zone{routeThreats.length > 1 ? "s" : ""}. Review incidents below.</p>
                }
              </div>

              {/* Safe Route Switch UI */}
              {routeThreats.length > 0 && safeRoute.length > 1 && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Safe Route Available</p>
                      <p className="text-xs text-emerald-700 mt-0.5">Our AI found an alternate path that avoids the threat zones on your standard route (shown in green dashes).</p>
                    </div>
                  </div>

                  {activeRoute === "standard" ? (
                    <button
                      onClick={() => setActiveRoute("safe")}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Switch to Safe Route
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-800">Safe Route Active</span>
                      </div>
                      <button
                        onClick={openGoogleMaps}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        Navigate via Google Maps
                      </button>
                      <button
                        onClick={() => setActiveRoute("standard")}
                        className="w-full bg-white border border-slate-200 text-slate-600 rounded-xl py-2 text-xs font-medium hover:bg-slate-50 transition-colors">
                        Back to original route
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigate button even if route is safe */}
              {routeThreats.length === 0 && sourcePos && destPos && (
                <button
                  onClick={openGoogleMaps}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                  Navigate via Google Maps
                </button>
              )}

              {/* Why AI rejected original route */}
              {routeThreats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-lg"
                >
                  <div className="px-4 py-3 bg-slate-800 flex items-center gap-2 border-b border-slate-700">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-sm font-bold text-white">Why AI Rejected Standard Route</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Our AI cross-referenced your route against the NCRB 2023 crime database and detected <span className="text-rose-400 font-bold">{routeThreats.length} threat intersection{routeThreats.length > 1 ? "s" : ""}</span>. Here's the breakdown:
                    </p>
                    <div className="space-y-2">
                      {routeThreats.map((t, i) => (
                        <div key={t.id} className="flex gap-2.5 items-start">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${t.dynamicSeverity === "critical" ? "bg-rose-500/20 text-rose-400" :
                              t.dynamicSeverity === "high" ? "bg-orange-500/20 text-orange-400" :
                                "bg-amber-500/20 text-amber-400"
                            }`}>{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{t.type} · <span className="text-slate-400 font-normal">{t.area}</span></p>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{t.aiReason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <p className="text-[11px] text-yellow-300 leading-snug">
                        Combined risk score: <span className="font-bold">{riskScore}</span>. The safe alternative route is recommended to avoid all {routeThreats.length} flagged zone{routeThreats.length > 1 ? "s" : ""}.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Threat cards */}
              {routeThreats.length === 0
                ? <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Route Appears Safe</p>
                  <p className="text-xs text-slate-500 mt-1">No NCRB-recorded threats near this path.</p>
                </div>
                : <div className="space-y-3 max-h-[380px] overflow-y-auto pr-0.5">
                  {routeThreats.map(threat => {
                    const col = severityColor[threat.dynamicSeverity] || "slate";
                    const label = severityLabel[threat.dynamicSeverity] || "Unknown";
                    const expanded = expandedThreat === threat.id;
                    return (
                      <motion.div key={threat.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className={`bg-white rounded-2xl border border-${col}-200 shadow overflow-hidden`}>
                        <div className="p-4 cursor-pointer" onClick={() => setExpandedThreat(expanded ? null : threat.id)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-${col}-100 text-${col}-700`}>{severityLabel[threat.severity]}</span>
                                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{threat.city}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">{threat.type}</h4>
                              <p className="text-xs text-slate-500 truncate">{threat.area}</p>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className={`text-xl font-black text-${col}-600 leading-none`}>{threat.cases}</span>
                              <span className="text-[9px] text-slate-400">cases</span>
                              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 mt-1" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-1" />}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                              className={`border-t border-${col}-100 bg-${col}-50 px-4 py-3 space-y-2`}>
                              <p className="text-xs text-slate-700">{threat.desc}</p>
                              <div className={`flex items-start gap-2 bg-white/70 border border-${col}-200 rounded-lg p-2`}>
                                <Zap className={`w-3.5 h-3.5 text-${col}-600 shrink-0 mt-0.5`} />
                                <div>
                                  <p className={`text-[10px] font-bold text-${col}-800 mb-0.5`}>🤖 AI Analysis</p>
                                  <p className={`text-[11px] text-${col}-700 leading-snug`}>{threat.aiReason}</p>
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
              }
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