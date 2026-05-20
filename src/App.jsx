import { useState, useEffect } from "react";
import { storageGet, storageSet } from "./supabase";

// ═══ COLOR SYSTEM ════════════════════════════════════════════════════════════
const CT = {
  paper:"#f4efe2", paper2:"#ece5d2", card:"#ffffff",
  ink:"#0a0a0a", ink2:"#1a1a1a", muted:"#6b675e", faint:"#9c9789",
  rule:"rgba(10,10,10,0.10)", rule2:"rgba(10,10,10,0.20)",
  red:"#d83a2e", blue:"#1f3fb5", yellow:"#f0b829", green:"#1d7a3e",
};
const GROUP_COLORS = { A:CT.red, B:CT.blue, C:CT.green, D:CT.yellow, E:CT.red, F:CT.blue, G:CT.green, H:CT.yellow, I:CT.red, J:CT.blue, K:CT.green, L:CT.yellow };
const STAGE_COLORS = { R32:CT.red, R16:CT.blue, QF:CT.green, SF:CT.yellow, "3P":CT.muted, F:CT.ink };
const FF = { display:"'Bricolage Grotesque',system-ui,sans-serif", serif:"'Newsreader',Georgia,serif", sans:"'Geist',system-ui,sans-serif", mono:"'Geist Mono',ui-monospace,monospace" };

// ─── PIN HASHING ──────────────────────────────────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin + "wc2026salt"));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── FLAGS ────────────────────────────────────────────────────────────────────
const FLAG_CODE = {
  "Mexico":"mx","South Africa":"za","South Korea":"kr","Czechia":"cz","Canada":"ca",
  "Bosnia & Herzegovina":"ba","USA":"us","Paraguay":"py","Qatar":"qa","Switzerland":"ch",
  "Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct","Australia":"au","Türkiye":"tr",
  "Germany":"de","Curaçao":"cw","Netherlands":"nl","Japan":"jp","Ivory Coast":"ci",
  "Ecuador":"ec","Sweden":"se","Tunisia":"tn","Spain":"es","Cape Verde":"cv",
  "Belgium":"be","Egypt":"eg","Saudi Arabia":"sa","Uruguay":"uy","Iran":"ir",
  "New Zealand":"nz","France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no",
  "Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo","Portugal":"pt",
  "DR Congo":"cd","England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa",
  "Uzbekistan":"uz","Colombia":"co",
};
const TEAM_SHORT = { "Bosnia & Herzegovina":"Bosnia","South Africa":"S. Africa","South Korea":"S. Korea","Saudi Arabia":"Saudi","New Zealand":"N. Zealand","Ivory Coast":"Iv. Coast" };
const shortName = t => TEAM_SHORT[t] || t;

function Flag({ team, size = 18 }) {
  const [err, setErr] = useState(false);
  const code = FLAG_CODE[team];
  if (!code || err) return <span style={{ display:"inline-block", width:Math.round(size*1.45), height:size, background:"#d9d2c4" }}/>;
  return <img src={`https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/${code}.svg`} alt={team} onError={() => setErr(true)} style={{ width: Math.round(size*1.45), height:size, objectFit:"cover", display:"block", flexShrink:0, boxShadow:"0 0 0 0.5px rgba(0,0,0,0.18) inset" }} />;
}

// ─── TIME ─────────────────────────────────────────────────────────────────────
function etToMYT(dateStr, timeStr) {
  const isPM = timeStr.includes("p.m."), isAM = timeStr.includes("a.m.");
  const clean = timeStr.replace(/\s?(a\.m\.|p\.m\.)/, "").trim();
  let [h, m] = clean.includes(":") ? clean.split(":").map(Number) : [parseInt(clean), 0];
  if (isNaN(m)) m = 0;
  if (isPM && h !== 12) h += 12; if (isAM && h === 12) h = 0;
  const mytMin = h*60 + m + 4*60 + 8*60;
  const dayOver = Math.floor(mytMin/1440), tod = ((mytMin%1440)+1440)%1440;
  const mh = Math.floor(tod/60), mm = tod%60;
  const disp = `${mh.toString().padStart(2,"0")}:${mm.toString().padStart(2,"0")}`;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, mo-1, d+dayOver));
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return { time: disp, date: `${days[base.getUTCDay()]} · ${months[base.getUTCMonth()]} ${base.getUTCDate()}`, rawDate: dateStr };
}
function fmtMYT(isoStr) {
  if (!isoStr) return "Not set";
  try { return new Date(isoStr).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" }) + " MYT"; }
  catch { return isoStr; }
}

// ─── GROUP MATCHES ────────────────────────────────────────────────────────────
const GROUP_RAW = [
  {id:1,grp:"A",date:"2026-06-11",et:"3 p.m.",home:"Mexico",away:"South Africa",venue:"Mexico City"},
  {id:2,grp:"A",date:"2026-06-11",et:"10 p.m.",home:"South Korea",away:"Czechia",venue:"Guadalajara"},
  {id:3,grp:"B",date:"2026-06-12",et:"3 p.m.",home:"Canada",away:"Bosnia & Herzegovina",venue:"Toronto"},
  {id:4,grp:"D",date:"2026-06-12",et:"9 p.m.",home:"USA",away:"Paraguay",venue:"Los Angeles"},
  {id:5,grp:"B",date:"2026-06-13",et:"3 p.m.",home:"Qatar",away:"Switzerland",venue:"San Francisco Bay Area"},
  {id:6,grp:"C",date:"2026-06-13",et:"6 p.m.",home:"Brazil",away:"Morocco",venue:"New York / New Jersey"},
  {id:7,grp:"C",date:"2026-06-13",et:"9 p.m.",home:"Haiti",away:"Scotland",venue:"Boston"},
  {id:8,grp:"D",date:"2026-06-14",et:"12 p.m.",home:"Australia",away:"Türkiye",venue:"Vancouver"},
  {id:9,grp:"E",date:"2026-06-14",et:"1 p.m.",home:"Germany",away:"Curaçao",venue:"Houston"},
  {id:10,grp:"F",date:"2026-06-14",et:"4 p.m.",home:"Netherlands",away:"Japan",venue:"Dallas"},
  {id:11,grp:"E",date:"2026-06-14",et:"7 p.m.",home:"Ivory Coast",away:"Ecuador",venue:"Philadelphia"},
  {id:12,grp:"F",date:"2026-06-14",et:"10 p.m.",home:"Sweden",away:"Tunisia",venue:"Monterrey"},
  {id:13,grp:"H",date:"2026-06-15",et:"12 p.m.",home:"Spain",away:"Cape Verde",venue:"Atlanta"},
  {id:14,grp:"G",date:"2026-06-15",et:"3 p.m.",home:"Belgium",away:"Egypt",venue:"Seattle"},
  {id:15,grp:"H",date:"2026-06-15",et:"6 p.m.",home:"Saudi Arabia",away:"Uruguay",venue:"Miami"},
  {id:16,grp:"G",date:"2026-06-15",et:"9 p.m.",home:"Iran",away:"New Zealand",venue:"Los Angeles"},
  {id:17,grp:"I",date:"2026-06-16",et:"3 p.m.",home:"France",away:"Senegal",venue:"New York / New Jersey"},
  {id:18,grp:"I",date:"2026-06-16",et:"6 p.m.",home:"Iraq",away:"Norway",venue:"Boston"},
  {id:19,grp:"J",date:"2026-06-16",et:"9 p.m.",home:"Argentina",away:"Algeria",venue:"Kansas City"},
  {id:20,grp:"J",date:"2026-06-17",et:"12 a.m.",home:"Austria",away:"Jordan",venue:"San Francisco Bay Area"},
  {id:21,grp:"K",date:"2026-06-17",et:"1 p.m.",home:"Portugal",away:"DR Congo",venue:"Houston"},
  {id:22,grp:"L",date:"2026-06-17",et:"4 p.m.",home:"England",away:"Croatia",venue:"Dallas"},
  {id:23,grp:"L",date:"2026-06-17",et:"7 p.m.",home:"Ghana",away:"Panama",venue:"Toronto"},
  {id:24,grp:"K",date:"2026-06-17",et:"10 p.m.",home:"Uzbekistan",away:"Colombia",venue:"Mexico City"},
  {id:25,grp:"A",date:"2026-06-18",et:"12 p.m.",home:"Czechia",away:"South Africa",venue:"Atlanta"},
  {id:26,grp:"B",date:"2026-06-18",et:"3 p.m.",home:"Switzerland",away:"Bosnia & Herzegovina",venue:"Los Angeles"},
  {id:27,grp:"B",date:"2026-06-18",et:"6 p.m.",home:"Canada",away:"Qatar",venue:"Vancouver"},
  {id:28,grp:"A",date:"2026-06-18",et:"9 p.m.",home:"Mexico",away:"South Korea",venue:"Guadalajara"},
  {id:29,grp:"D",date:"2026-06-19",et:"3 p.m.",home:"USA",away:"Australia",venue:"Seattle"},
  {id:30,grp:"C",date:"2026-06-19",et:"6 p.m.",home:"Scotland",away:"Morocco",venue:"Boston"},
  {id:31,grp:"C",date:"2026-06-19",et:"8:30 p.m.",home:"Brazil",away:"Haiti",venue:"Philadelphia"},
  {id:32,grp:"D",date:"2026-06-19",et:"11 p.m.",home:"Türkiye",away:"Paraguay",venue:"San Francisco Bay Area"},
  {id:33,grp:"F",date:"2026-06-20",et:"1 p.m.",home:"Netherlands",away:"Sweden",venue:"Houston"},
  {id:34,grp:"E",date:"2026-06-20",et:"4 p.m.",home:"Germany",away:"Ivory Coast",venue:"Toronto"},
  {id:35,grp:"E",date:"2026-06-20",et:"8 p.m.",home:"Ecuador",away:"Curaçao",venue:"Kansas City"},
  {id:36,grp:"F",date:"2026-06-21",et:"12 a.m.",home:"Tunisia",away:"Japan",venue:"Monterrey"},
  {id:37,grp:"H",date:"2026-06-21",et:"12 p.m.",home:"Spain",away:"Saudi Arabia",venue:"Atlanta"},
  {id:38,grp:"G",date:"2026-06-21",et:"3 p.m.",home:"Belgium",away:"Iran",venue:"Los Angeles"},
  {id:39,grp:"H",date:"2026-06-21",et:"6 p.m.",home:"Uruguay",away:"Cape Verde",venue:"Miami"},
  {id:40,grp:"G",date:"2026-06-21",et:"9 p.m.",home:"New Zealand",away:"Egypt",venue:"Vancouver"},
  {id:41,grp:"J",date:"2026-06-22",et:"1 p.m.",home:"Argentina",away:"Austria",venue:"Dallas"},
  {id:42,grp:"I",date:"2026-06-22",et:"5 p.m.",home:"France",away:"Iraq",venue:"Philadelphia"},
  {id:43,grp:"I",date:"2026-06-22",et:"8 p.m.",home:"Norway",away:"Senegal",venue:"New York / New Jersey"},
  {id:44,grp:"J",date:"2026-06-22",et:"11 p.m.",home:"Jordan",away:"Algeria",venue:"San Francisco Bay Area"},
  {id:45,grp:"K",date:"2026-06-23",et:"1 p.m.",home:"Portugal",away:"Uzbekistan",venue:"Houston"},
  {id:46,grp:"L",date:"2026-06-23",et:"4 p.m.",home:"England",away:"Ghana",venue:"Boston"},
  {id:47,grp:"L",date:"2026-06-23",et:"7 p.m.",home:"Panama",away:"Croatia",venue:"Toronto"},
  {id:48,grp:"K",date:"2026-06-23",et:"10 p.m.",home:"Colombia",away:"DR Congo",venue:"Guadalajara"},
  {id:49,grp:"B",date:"2026-06-24",et:"3 p.m.",home:"Switzerland",away:"Canada",venue:"Vancouver"},
  {id:50,grp:"B",date:"2026-06-24",et:"3 p.m.",home:"Bosnia & Herzegovina",away:"Qatar",venue:"Seattle"},
  {id:51,grp:"C",date:"2026-06-24",et:"6 p.m.",home:"Scotland",away:"Brazil",venue:"Miami"},
  {id:52,grp:"C",date:"2026-06-24",et:"6 p.m.",home:"Morocco",away:"Haiti",venue:"Atlanta"},
  {id:53,grp:"A",date:"2026-06-24",et:"9 p.m.",home:"Czechia",away:"Mexico",venue:"Mexico City"},
  {id:54,grp:"A",date:"2026-06-24",et:"9 p.m.",home:"South Africa",away:"South Korea",venue:"Monterrey"},
  {id:55,grp:"E",date:"2026-06-25",et:"4 p.m.",home:"Curaçao",away:"Ivory Coast",venue:"Philadelphia"},
  {id:56,grp:"E",date:"2026-06-25",et:"4 p.m.",home:"Ecuador",away:"Germany",venue:"New York / New Jersey"},
  {id:57,grp:"F",date:"2026-06-25",et:"7 p.m.",home:"Japan",away:"Sweden",venue:"Dallas"},
  {id:58,grp:"F",date:"2026-06-25",et:"7 p.m.",home:"Tunisia",away:"Netherlands",venue:"Kansas City"},
  {id:59,grp:"D",date:"2026-06-25",et:"10 p.m.",home:"Türkiye",away:"USA",venue:"Los Angeles"},
  {id:60,grp:"D",date:"2026-06-25",et:"10 p.m.",home:"Paraguay",away:"Australia",venue:"San Francisco Bay Area"},
  {id:61,grp:"I",date:"2026-06-26",et:"3 p.m.",home:"Norway",away:"France",venue:"Boston"},
  {id:62,grp:"I",date:"2026-06-26",et:"3 p.m.",home:"Senegal",away:"Iraq",venue:"Toronto"},
  {id:63,grp:"H",date:"2026-06-26",et:"8 p.m.",home:"Cape Verde",away:"Saudi Arabia",venue:"Houston"},
  {id:64,grp:"H",date:"2026-06-26",et:"8 p.m.",home:"Uruguay",away:"Spain",venue:"Guadalajara"},
  {id:65,grp:"G",date:"2026-06-26",et:"11 p.m.",home:"Egypt",away:"Iran",venue:"Seattle"},
  {id:66,grp:"G",date:"2026-06-26",et:"11 p.m.",home:"New Zealand",away:"Belgium",venue:"Vancouver"},
  {id:67,grp:"L",date:"2026-06-27",et:"5 p.m.",home:"Panama",away:"England",venue:"New York / New Jersey"},
  {id:68,grp:"L",date:"2026-06-27",et:"5 p.m.",home:"Croatia",away:"Ghana",venue:"Philadelphia"},
  {id:69,grp:"K",date:"2026-06-27",et:"7:30 p.m.",home:"Colombia",away:"Portugal",venue:"Miami"},
  {id:70,grp:"K",date:"2026-06-27",et:"7:30 p.m.",home:"DR Congo",away:"Uzbekistan",venue:"Atlanta"},
  {id:71,grp:"J",date:"2026-06-27",et:"10 p.m.",home:"Algeria",away:"Austria",venue:"Kansas City"},
  {id:72,grp:"J",date:"2026-06-27",et:"10 p.m.",home:"Jordan",away:"Argentina",venue:"Dallas"},
];

const KO_DEF = [
  {id:73,stage:"R32",date:"2026-06-28",et:"3 p.m.",homeSlot:{type:"runner",grp:"A"},awaySlot:{type:"runner",grp:"B"},venue:"Los Angeles"},
  {id:74,stage:"R32",date:"2026-06-29",et:"1 p.m.",homeSlot:{type:"winner",grp:"E"},awaySlot:{type:"best3rd",groups:["A","B","C","D","F"]},venue:"Boston"},
  {id:75,stage:"R32",date:"2026-06-29",et:"4:30 p.m.",homeSlot:{type:"winner",grp:"F"},awaySlot:{type:"runner",grp:"C"},venue:"Monterrey"},
  {id:76,stage:"R32",date:"2026-06-29",et:"9 p.m.",homeSlot:{type:"winner",grp:"C"},awaySlot:{type:"runner",grp:"F"},venue:"Houston"},
  {id:77,stage:"R32",date:"2026-06-30",et:"5 p.m.",homeSlot:{type:"winner",grp:"I"},awaySlot:{type:"best3rd",groups:["C","D","F","G","H"]},venue:"New York / New Jersey"},
  {id:78,stage:"R32",date:"2026-06-30",et:"1 p.m.",homeSlot:{type:"runner",grp:"E"},awaySlot:{type:"runner",grp:"I"},venue:"Dallas"},
  {id:79,stage:"R32",date:"2026-06-30",et:"9 p.m.",homeSlot:{type:"winner",grp:"A"},awaySlot:{type:"best3rd",groups:["C","E","F","H","I"]},venue:"Mexico City"},
  {id:80,stage:"R32",date:"2026-07-01",et:"12 p.m.",homeSlot:{type:"winner",grp:"L"},awaySlot:{type:"best3rd",groups:["E","H","I","J","K"]},venue:"Atlanta"},
  {id:81,stage:"R32",date:"2026-07-01",et:"8 p.m.",homeSlot:{type:"winner",grp:"D"},awaySlot:{type:"best3rd",groups:["B","E","F","I","J"]},venue:"San Francisco Bay Area"},
  {id:82,stage:"R32",date:"2026-07-01",et:"4 p.m.",homeSlot:{type:"winner",grp:"G"},awaySlot:{type:"best3rd",groups:["A","E","H","I","J"]},venue:"Seattle"},
  {id:83,stage:"R32",date:"2026-07-02",et:"7 p.m.",homeSlot:{type:"runner",grp:"K"},awaySlot:{type:"runner",grp:"L"},venue:"Toronto"},
  {id:84,stage:"R32",date:"2026-07-02",et:"3 p.m.",homeSlot:{type:"winner",grp:"H"},awaySlot:{type:"runner",grp:"J"},venue:"Los Angeles"},
  {id:85,stage:"R32",date:"2026-07-02",et:"11 p.m.",homeSlot:{type:"winner",grp:"B"},awaySlot:{type:"best3rd",groups:["E","F","G","I","J"]},venue:"Vancouver"},
  {id:86,stage:"R32",date:"2026-07-03",et:"6 p.m.",homeSlot:{type:"winner",grp:"J"},awaySlot:{type:"runner",grp:"H"},venue:"Miami"},
  {id:87,stage:"R32",date:"2026-07-03",et:"9:30 p.m.",homeSlot:{type:"winner",grp:"K"},awaySlot:{type:"best3rd",groups:["D","E","I","J","L"]},venue:"Kansas City"},
  {id:88,stage:"R32",date:"2026-07-03",et:"2 p.m.",homeSlot:{type:"runner",grp:"D"},awaySlot:{type:"runner",grp:"G"},venue:"Dallas"},
  {id:89,stage:"R16",date:"2026-07-04",et:"1 p.m.",homeSlot:{type:"winnerOf",matchId:74},awaySlot:{type:"winnerOf",matchId:77},venue:"Philadelphia"},
  {id:90,stage:"R16",date:"2026-07-04",et:"5 p.m.",homeSlot:{type:"winnerOf",matchId:73},awaySlot:{type:"winnerOf",matchId:75},venue:"Houston"},
  {id:91,stage:"R16",date:"2026-07-05",et:"4 p.m.",homeSlot:{type:"winnerOf",matchId:76},awaySlot:{type:"winnerOf",matchId:78},venue:"New York / New Jersey"},
  {id:92,stage:"R16",date:"2026-07-05",et:"8 p.m.",homeSlot:{type:"winnerOf",matchId:79},awaySlot:{type:"winnerOf",matchId:80},venue:"Mexico City"},
  {id:93,stage:"R16",date:"2026-07-06",et:"3 p.m.",homeSlot:{type:"winnerOf",matchId:83},awaySlot:{type:"winnerOf",matchId:84},venue:"Dallas"},
  {id:94,stage:"R16",date:"2026-07-06",et:"8 p.m.",homeSlot:{type:"winnerOf",matchId:81},awaySlot:{type:"winnerOf",matchId:82},venue:"Seattle"},
  {id:95,stage:"R16",date:"2026-07-07",et:"5 p.m.",homeSlot:{type:"winnerOf",matchId:86},awaySlot:{type:"winnerOf",matchId:88},venue:"Atlanta"},
  {id:96,stage:"R16",date:"2026-07-07",et:"1 p.m.",homeSlot:{type:"winnerOf",matchId:85},awaySlot:{type:"winnerOf",matchId:87},venue:"Vancouver"},
  {id:97,stage:"QF",date:"2026-07-09",et:"4 p.m.",homeSlot:{type:"winnerOf",matchId:89},awaySlot:{type:"winnerOf",matchId:90},venue:"Boston"},
  {id:98,stage:"QF",date:"2026-07-10",et:"3 p.m.",homeSlot:{type:"winnerOf",matchId:93},awaySlot:{type:"winnerOf",matchId:94},venue:"Los Angeles"},
  {id:99,stage:"QF",date:"2026-07-11",et:"5 p.m.",homeSlot:{type:"winnerOf",matchId:91},awaySlot:{type:"winnerOf",matchId:92},venue:"Miami"},
  {id:100,stage:"QF",date:"2026-07-11",et:"9 p.m.",homeSlot:{type:"winnerOf",matchId:95},awaySlot:{type:"winnerOf",matchId:96},venue:"Kansas City"},
  {id:101,stage:"SF",date:"2026-07-14",et:"3 p.m.",homeSlot:{type:"winnerOf",matchId:97},awaySlot:{type:"winnerOf",matchId:98},venue:"Dallas"},
  {id:102,stage:"SF",date:"2026-07-15",et:"3 p.m.",homeSlot:{type:"winnerOf",matchId:99},awaySlot:{type:"winnerOf",matchId:100},venue:"Atlanta"},
  {id:103,stage:"3P",date:"2026-07-18",et:"5 p.m.",homeSlot:{type:"loserOf",matchId:101},awaySlot:{type:"loserOf",matchId:102},venue:"Miami"},
  {id:104,stage:"F",date:"2026-07-19",et:"3 p.m.",homeSlot:{type:"winnerOf",matchId:101},awaySlot:{type:"winnerOf",matchId:102},venue:"New York / New Jersey"},
];

const BEST3RD_MATCHES = KO_DEF.filter(m => m.awaySlot?.type === "best3rd");
const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const GROUP_MATCHES = GROUP_RAW.map(m => ({ ...m, stage:`Group ${m.grp}`, ...etToMYT(m.date, m.et) }));
const STAGE_LABEL = { R32:"Round of 32", R16:"Round of 16", QF:"Quarterfinal", SF:"Semifinal", "3P":"Third Place", F:"Final" };

// ─── STANDINGS ───────────────────────────────────────────────────────────────
function computeStandings(preds) {
  const groups = {};
  GROUP_MATCHES.forEach(m => {
    if (!groups[m.grp]) groups[m.grp] = {};
    [m.home, m.away].forEach(t => { if (!groups[m.grp][t]) groups[m.grp][t] = { team:t, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 }; });
    const r = preds[m.id]; if (!r) return;
    const H = groups[m.grp][m.home], A = groups[m.grp][m.away];
    H.p++; A.p++;
    if (r==="home") { H.w++; H.pts+=3; A.l++; H.gf++; A.ga++; }
    else if (r==="away") { A.w++; A.pts+=3; H.l++; A.gf++; H.ga++; }
    else { H.d++; A.d++; H.pts++; A.pts++; H.gf++; A.gf++; H.ga++; A.ga++; }
  });
  const out = {};
  Object.keys(groups).forEach(g => { out[g] = Object.values(groups[g]).sort((a,b) => b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||b.w-a.w); });
  return out;
}

function resolveTeam(slot, standings, b3, koW) {
  if (!slot) return null;
  if (slot.type==="winner") return standings[slot.grp]?.[0]?.team||null;
  if (slot.type==="runner") return standings[slot.grp]?.[1]?.team||null;
  if (slot.type==="best3rd") return b3[`b3_${slot.groups.join("")}`]||null;
  if (slot.type==="winnerOf") return koW[`w_${slot.matchId}`]||null;
  if (slot.type==="loserOf") {
    const def = KO_DEF.find(x=>x.id===slot.matchId); if (!def) return null;
    const win = koW[`w_${slot.matchId}`]; if (!win) return null;
    const h = resolveTeam(def.homeSlot,standings,b3,koW);
    const a = resolveTeam(def.awaySlot,standings,b3,koW);
    return win===h?a:win===a?h:null;
  }
  return null;
}

function buildKO(standings, b3, koW) {
  return KO_DEF.map(m => ({ ...m, ...etToMYT(m.date, m.et), home: resolveTeam(m.homeSlot, standings, b3, koW), away: resolveTeam(m.awaySlot, standings, b3, koW) }));
}

// ─── STORAGE KEYS / SETTINGS ─────────────────────────────────────────────────
const USERS_KEY = "wc2026_users_v6";
const RESULTS_KEY = "wc2026_results_v6";
const SETTINGS_KEY = "wc2026_settings_v6";
const ADMIN_PW = "wc2026admin";
const DEFAULT_SETTINGS = { registrationLocked:false, groupOpen:true, groupDeadline:"2026-06-11T07:00:00Z", bracketOpen:false, bracketDeadline:"2026-06-28T15:00:00Z" };

function getPhase(settings) {
  const now = new Date();
  const groupOpen = settings.groupOpen && now < new Date(settings.groupDeadline);
  const bracketOpen = settings.bracketOpen && now < new Date(settings.bracketDeadline);
  if (bracketOpen) return "bracket";
  if (groupOpen) return "group";
  return "closed";
}

function calcScore(gPreds, koW, rGroup, rKO) {
  let correct=0, total=0;
  GROUP_MATCHES.forEach(m => { if (gPreds[m.id]&&rGroup[m.id]) { total++; if (gPreds[m.id]===rGroup[m.id]) correct++; } });
  KO_DEF.forEach(m => { if (koW[`w_${m.id}`]&&rKO[`w_${m.id}`]) { total++; if (koW[`w_${m.id}`]===rKO[`w_${m.id}`]) correct++; } });
  return { correct, total, pct: total>0?Math.round((correct/total)*100):null };
}

// ═══ UI PRIMITIVES ═══════════════════════════════════════════════════════════
const Kicker = ({ children, color, style }) => <span style={{ fontFamily:FF.mono, fontSize:10, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:color||CT.muted, ...style }}>{children}</span>;
const Num = ({ children, style }) => <span style={{ fontFamily:FF.mono, fontFeatureSettings:"'tnum' 1, 'lnum' 1", letterSpacing:"-0.01em", ...style }}>{children}</span>;
const Display = ({ children, size=48, color, style }) => <span style={{ fontFamily:FF.display, fontWeight:800, fontSize:size, lineHeight:0.92, letterSpacing:"-0.035em", color:color||CT.ink, ...style }}>{children}</span>;
const Serif = ({ children, size=20, italic=true, color, style }) => <span style={{ fontFamily:FF.serif, fontWeight:500, fontStyle:italic?"italic":"normal", fontSize:size, lineHeight:1.05, letterSpacing:"-0.01em", color:color||CT.ink, ...style }}>{children}</span>;

function Btn({ color, white, ghost, sm, full, children, onClick, style, disabled }) {
  const bg = color || CT.ink;
  const fg = white ? bg : ghost ? CT.ink : "#fff";
  const _bg = white ? "#fff" : ghost ? "transparent" : bg;
  return <button onClick={onClick} disabled={disabled} style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
    padding: sm?"7px 12px":"11px 16px", border:`1.5px solid ${bg}`, background:_bg, color:fg,
    fontFamily:FF.sans, fontWeight:700, fontSize: sm?11:12, letterSpacing:"0.02em", textTransform:"uppercase",
    cursor:disabled?"default":"pointer", borderRadius:0, opacity:disabled?0.5:1,
    width: full?"100%":"auto", ...style
  }}>{children}</button>;
}

function PickBtn({ active, correct, wrong, color, children, onClick }) {
  let bg="transparent", fg=CT.ink, br=CT.rule2;
  if (active) { bg=color||CT.ink; fg="#fff"; br=bg; }
  if (correct) { bg=CT.green; fg="#fff"; br=CT.green; }
  if (wrong) { bg="transparent"; fg=CT.red; br=CT.red; }
  return <button onClick={onClick} style={{
    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
    padding:"11px 6px", border:`1.5px solid ${br}`, background:bg, color:fg,
    fontFamily:FF.sans, fontWeight: active||correct?700:500, fontSize:13, letterSpacing:"-0.005em",
    cursor:"pointer", borderRadius:0, transition:"all .12s"
  }}>{children}</button>;
}

function Wordmark({ inverse, size=13 }) {
  const c = inverse?"#fff":CT.ink;
  return <div style={{display:"flex", alignItems:"baseline", gap:6}}>
    <span style={{fontFamily:FF.display, fontWeight:800, fontSize:size, letterSpacing:"-0.04em", color:c, lineHeight:1}}>PREDICT</span>
    <span style={{display:"inline-flex", gap:2}}>
      <span style={{width:6, height:6, background:CT.red}}/>
      <span style={{width:6, height:6, background:CT.blue}}/>
      <span style={{width:6, height:6, background:CT.green}}/>
    </span>
    <span style={{fontFamily:FF.mono, fontWeight:500, fontSize:size-3, color:c, opacity:0.6, letterSpacing:"0.04em"}}>WC’26</span>
  </div>;
}

function TeamCell({ team, reverse, size=20 }) {
  return <div style={{display:"flex", flexDirection: reverse?"row-reverse":"row", alignItems:"center", gap:8, minWidth:0}}>
    <Flag team={team} size={size}/>
    <span style={{fontFamily:FF.display, fontWeight:700, fontSize:14, color:CT.ink, letterSpacing:"-0.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{shortName(team)}</span>
  </div>;
}

const inputDark = { width:"100%", boxSizing:"border-box", background:"transparent", border:"none", borderBottom:"2px solid #555", padding:"10px 0", color:"#fff", fontFamily:FF.sans, fontSize:18, fontWeight:500, outline:"none", borderRadius:0 };
const inputLight = { width:"100%", boxSizing:"border-box", background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"10px 12px", color:CT.ink, fontFamily:FF.sans, fontSize:14, fontWeight:500, outline:"none", borderRadius:0 };

// ═══ APP ═════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("home");
  const [nameInput, setNameInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [authStep, setAuthStep] = useState("name");
  const [authError, setAuthError] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [username, setUsername] = useState("");

  const [groupPreds, setGroupPreds] = useState({});
  const [userKOW, setUserKOW] = useState({});

  const [allUsers, setAllUsers] = useState({});
  const [resultGroup, setResultGroup] = useState({});
  const [resultB3, setResultB3] = useState({});
  const [resultKOW, setResultKOW] = useState({});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [subTab, setSubTab] = useState("group");
  const [saved, setSaved] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const u = await storageGet(USERS_KEY); if (u?.value) setAllUsers(JSON.parse(u.value)); } catch {}
    try { const r = await storageGet(RESULTS_KEY); if (r?.value) { const d=JSON.parse(r.value); setResultGroup(d.group||{}); setResultB3(d.b3||{}); setResultKOW(d.ko||{}); } } catch {}
    try { const s = await storageGet(SETTINGS_KEY); if (s?.value) setSettings({...DEFAULT_SETTINGS,...JSON.parse(s.value)}); } catch {}
    setLoading(false);
  })(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""), 2800); };
  const saveUsers = async u => { await storageSet(USERS_KEY, JSON.stringify(u)); setAllUsers(u); };
  const saveResults = async (grp,b3,ko) => { await storageSet(RESULTS_KEY, JSON.stringify({group:grp,b3,ko})); setResultGroup(grp); setResultB3(b3); setResultKOW(ko); };
  const saveSettings = async s => { await storageSet(SETTINGS_KEY, JSON.stringify(s)); setSettings(s); };

  const phase = getPhase(settings);
  const realStandings = computeStandings(resultGroup);
  const realKOMatches = buildKO(realStandings, resultB3, userKOW);
  const userStandings = computeStandings(groupPreds);

  const groupDone = GROUP_MATCHES.filter(m=>groupPreds[m.id]).length;
  const koDone = KO_DEF.filter(m=>userKOW[`w_${m.id}`]).length;
  const totalDone = phase==="group" ? groupDone : phase==="bracket" ? koDone : groupDone+koDone;
  const totalTotal = phase==="group" ? 72 : phase==="bracket" ? KO_DEF.length : 72+KO_DEF.length;
  const pct = Math.round(totalDone/Math.max(totalTotal,1)*100);

  const leaderboard = Object.entries(allUsers).map(([name,data]) => {
    const score = calcScore(data.groupPreds||{}, data.userKOW||{}, resultGroup, resultKOW);
    return { name, groupDone:Object.keys(data.groupPreds||{}).length, koDone:Object.keys(data.userKOW||{}).length, ...score };
  }).sort((a,b)=>(a.pct!==null&&b.pct!==null)?b.pct-a.pct:a.pct!==null?-1:b.pct!==null?1:(b.groupDone+b.koDone)-(a.groupDone+a.koDone));

  async function handleNameSubmit() {
    const name = nameInput.trim(); if (!name) return;
    if (name.toLowerCase()==="admin") { setView("adminLogin"); return; }
    setPendingName(name);
    const existing = allUsers[name];
    if (existing) { setAuthStep("pin"); setAuthError(""); }
    else { if (settings.registrationLocked) { setAuthError("Registration is closed. Contact the admin."); return; } setAuthStep("setpin"); setAuthError(""); }
    setPinInput(""); setPinConfirm("");
  }
  async function handlePinSubmit() {
    const existing = allUsers[pendingName];
    const hashed = await hashPin(pinInput);
    if (hashed !== existing.pin) { setAuthError("Incorrect PIN. Try again."); setPinInput(""); return; }
    setUsername(pendingName); setGroupPreds(existing.groupPreds||{}); setUserKOW(existing.userKOW||{});
    setAuthStep("name"); setAuthError(""); setNameInput(""); setPinInput("");
    setSubTab(phase==="bracket"?"bracket":"group"); setView("predict");
  }
  async function handleSetPin() {
    if (pinInput.length !== 4 || !/^\d+$/.test(pinInput)) { setAuthError("PIN must be exactly 4 digits."); return; }
    if (pinInput !== pinConfirm) { setAuthError("PINs don't match. Try again."); setPinConfirm(""); return; }
    const hashed = await hashPin(pinInput);
    const newUser = { pin: hashed, groupPreds:{}, userKOW:{}, createdAt: new Date().toISOString() };
    const upd = {...allUsers, [pendingName]: newUser}; await saveUsers(upd);
    setUsername(pendingName); setGroupPreds({}); setUserKOW({});
    setAuthStep("name"); setAuthError(""); setNameInput(""); setPinInput(""); setPinConfirm("");
    setSubTab("group"); setView("predict"); showToast("Welcome — your PIN is set.");
  }
  async function handleSave() {
    const upd = {...allUsers, [username]: { ...allUsers[username], groupPreds, userKOW, savedAt: new Date().toISOString() }};
    await saveUsers(upd); setSaved(true); showToast("Predictions saved"); setTimeout(()=>setSaved(false),2000);
  }
  async function handleDeleteUser(name) {
    const upd={...allUsers}; delete upd[name]; await saveUsers(upd); setConfirmDelete(null); showToast(`${name}'s entry deleted`);
  }
  const setGroupPick = (id,val) => { if (phase==="group") setGroupPreds(p=>({...p,[id]:val})); };
  const setKOPick = (id,team) => { if (phase==="bracket") setUserKOW(p=>({...p,[`w_${id}`]:team})); };

  function handleLucky() {
    const rand = arr => arr[Math.floor(Math.random()*arr.length)];
    if (phase==="group") {
      const np={...groupPreds}; GROUP_MATCHES.forEach(m => { if (!np[m.id]) np[m.id]=rand(["home","draw","away"]); });
      setGroupPreds(np); showToast("Group picks auto-filled — review and save.");
    } else if (phase==="bracket") {
      const nk={...userKOW}; ["R32","R16","QF","SF","3P","F"].forEach(stage => {
        KO_DEF.filter(m=>m.stage===stage).forEach(m => {
          if (!nk[`w_${m.id}`]) {
            const h=resolveTeam(m.homeSlot,realStandings,resultB3,nk);
            const a=resolveTeam(m.awaySlot,realStandings,resultB3,nk);
            const opts=[h,a].filter(Boolean);
            if (opts.length>0) nk[`w_${m.id}`]=rand(opts);
          }
        });
      });
      setUserKOW(nk); showToast("Bracket auto-filled — review and save.");
    }
  }

  if (loading) return <div style={{minHeight:"100vh", background:CT.paper, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14}}>
    <div style={{display:"flex", gap:4}}>
      <span style={{width:10,height:10,background:CT.red}}/><span style={{width:10,height:10,background:CT.blue}}/>
      <span style={{width:10,height:10,background:CT.green}}/><span style={{width:10,height:10,background:CT.yellow}}/>
    </div>
    <Kicker>LOADING</Kicker>
  </div>;

  return <div style={{minHeight:"100vh", background:CT.paper, fontFamily:FF.sans, color:CT.ink}}>
    {toast && <div style={{position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:CT.ink, color:"#fff", padding:"10px 18px", fontFamily:FF.mono, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", zIndex:999}}>{toast}</div>}

    {confirmDelete && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16}}>
      <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:24, maxWidth:340, width:"100%"}}>
        <Kicker color={CT.red}>DELETE ENTRY</Kicker>
        <div style={{marginTop:6, marginBottom:14, fontFamily:FF.display, fontWeight:800, fontSize:22, letterSpacing:"-0.02em"}}>Remove {confirmDelete}?</div>
        <div style={{fontSize:13, color:CT.muted, marginBottom:18, lineHeight:1.5}}>Permanently deletes their predictions and PIN. They can re-register after.</div>
        <div style={{display:"flex", gap:8}}>
          <Btn ghost full onClick={()=>setConfirmDelete(null)}>Cancel</Btn>
          <Btn color={CT.red} full onClick={()=>handleDeleteUser(confirmDelete)}>Delete</Btn>
        </div>
      </div>
    </div>}

    <div style={{maxWidth:720, margin:"0 auto"}}>

    {view==="home" && <HomeScreen
      nameInput={nameInput} setNameInput={setNameInput}
      pinInput={pinInput} setPinInput={setPinInput} pinConfirm={pinConfirm} setPinConfirm={setPinConfirm}
      authStep={authStep} authError={authError} pendingName={pendingName}
      onNameSubmit={handleNameSubmit} onPinSubmit={handlePinSubmit} onSetPin={handleSetPin}
      onBack={()=>{setAuthStep("name");setAuthError("");setPinInput("");setPinConfirm("");}}
      settings={settings} phase={phase} count={Object.keys(allUsers).length}
      resultsIn={Object.keys(resultGroup).length} onLB={()=>setView("leaderboard")}/>}

    {view==="adminLogin" && <div style={{padding:"48px 22px"}}>
      <div style={{background:CT.ink, color:"#fff", padding:"24px 22px"}}>
        <Kicker color={CT.yellow}>ADMIN ACCESS</Kicker>
        <div style={{marginTop:6, fontFamily:FF.display, fontWeight:800, fontSize:26, color:"#fff", letterSpacing:"-0.03em"}}>Enter password.</div>
        <input type="password" style={{...inputDark, marginTop:14}} value={adminPw} onChange={e=>setAdminPw(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PW){setView("admin");setAdminErr(false);}else setAdminErr(true);}}}
          placeholder="Password" autoFocus/>
        {adminErr && <div style={{marginTop:10, padding:"6px 10px", background:CT.red, color:"#fff", fontFamily:FF.mono, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase"}}>Incorrect password</div>}
        <div style={{display:"flex", gap:8, marginTop:18, justifyContent:"space-between"}}>
          <button onClick={()=>{setView("home");setAdminPw("");setAdminErr(false);}} style={{background:"transparent", border:"none", color:"#9c9789", fontFamily:FF.sans, fontWeight:600, fontSize:13, cursor:"pointer"}}>← Back</button>
          <Btn color={CT.yellow} onClick={()=>{if(adminPw===ADMIN_PW){setView("admin");setAdminErr(false);}else setAdminErr(true);}} style={{color:CT.ink, borderColor:CT.yellow}}>Login</Btn>
        </div>
      </div>
    </div>}

    {view==="admin" && <AdminPanel resultGroup={resultGroup} resultB3={resultB3} resultKOW={resultKOW} settings={settings} allUsers={allUsers} leaderboard={leaderboard} realStandings={realStandings} onSaveResults={saveResults} onSaveSettings={saveSettings} onDeleteUser={name=>setConfirmDelete(name)} onBack={()=>setView("home")} showToast={showToast}/>}

    {view==="leaderboard" && <LeaderboardScreen leaderboard={leaderboard} resultsIn={Object.keys(resultGroup).length} onBack={()=>setView(username?"predict":"home")} count={Object.keys(allUsers).length}/>}

    {view==="predict" && <>
      <div style={{background:CT.ink, color:"#fff", position:"sticky", top:0, zIndex:8}}>
        <div style={{padding:"14px 22px 12px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <Wordmark inverse/>
          <div style={{display:"flex", gap:16, alignItems:"center"}}>
            {phase!=="closed" && <button onClick={handleLucky} style={{background:"transparent", border:"none", color:"#9c9789", fontFamily:FF.sans, fontSize:13, fontWeight:600, cursor:"pointer"}}>Random</button>}
            {phase!=="closed" && <button onClick={handleSave} style={{background:"transparent", border:"none", color:saved?CT.yellow:"#fff", fontFamily:FF.sans, fontSize:13, fontWeight:700, cursor:"pointer"}}>{saved?"✓ Saved":"Save"}</button>}
            <button onClick={()=>setView("leaderboard")} style={{background:"transparent", border:`1.5px solid #555`, color:"#fff", fontFamily:FF.sans, fontSize:11, fontWeight:600, padding:"5px 10px", cursor:"pointer", letterSpacing:"0.04em", textTransform:"uppercase"}}>Board</button>
            <button onClick={()=>{setView("home");setUsername("");setNameInput("");}} style={{background:"transparent", border:"none", color:"#9c9789", fontFamily:FF.sans, fontSize:13, fontWeight:600, cursor:"pointer"}}>Exit</button>
          </div>
        </div>
        <div style={{padding:"0 22px 12px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div>
            <Serif size={22} color="#fff">{username}</Serif>
            <div style={{marginTop:4}}><Kicker color="#9c9789">
              {phase==="group"&&`${groupDone}/72 GROUP PICKS`}
              {phase==="bracket"&&`${koDone}/${KO_DEF.length} BRACKET PICKS`}
              {phase==="closed"&&"VIEW ONLY"}
            </Kicker></div>
          </div>
          <Num style={{fontSize:18, color:CT.yellow, fontWeight:700}}>{pct}%</Num>
        </div>
        <div style={{height:4, background:"#1a1a1a"}}><div style={{height:4, background:CT.yellow, width:`${pct}%`, transition:"width .3s"}}/></div>
      </div>

      <div style={{display:"flex", background:"#fff", borderBottom:`1.5px solid ${CT.ink}`, padding:"0 22px"}}>
        {[
          {id:"group", label:"Group Stage"},
          {id:"standings", label:"Tables"},
          ...((phase==="bracket"||phase==="closed") ? [{id:"bracket", label:"Bracket"}] : []),
        ].map(it => {
          const on = subTab===it.id;
          return <button key={it.id} onClick={()=>setSubTab(it.id)} style={{
            padding:"13px 16px 11px", border:"none", background:"transparent", cursor:"pointer", position:"relative",
            fontFamily:FF.sans, fontSize:13, fontWeight:on?700:500, color:on?CT.ink:CT.muted
          }}>{it.label}{on && <div style={{position:"absolute", left:0, right:0, bottom:-1.5, height:3, background:CT.red}}/>}</button>;
        })}
      </div>

      {phase==="closed" && <div style={{margin:"16px 22px 0", padding:"10px 14px", background:CT.ink, color:"#fff"}}><Kicker color={CT.yellow}>● ALL PREDICTIONS LOCKED</Kicker></div>}
      {phase==="group" && subTab==="bracket" && <div style={{margin:"16px 22px 0", padding:"10px 14px", background:CT.blueLt||"#c9d2eb", color:CT.blue}}><Kicker color={CT.blue}>● BRACKET OPENS AFTER GROUP STAGE</Kicker></div>}

      {subTab==="group" && <GroupStageTab groupPreds={groupPreds} onPick={setGroupPick} isOpen={phase==="group"} resultGroup={resultGroup}/>}
      {subTab==="standings" && <StandingsTab standings={userStandings} groupPreds={groupPreds}/>}
      {subTab==="bracket" && (phase==="bracket"||phase==="closed") && <BracketTab koMatches={realKOMatches} userKOW={userKOW} setKOPick={setKOPick} isOpen={phase==="bracket"} resultKOW={resultKOW}/>}
    </>}

    </div>
  </div>;
}

// ═══ HOME / AUTH SCREEN ══════════════════════════════════════════════════════
function HomeScreen({ nameInput, setNameInput, pinInput, setPinInput, pinConfirm, setPinConfirm, authStep, authError, pendingName, onNameSubmit, onPinSubmit, onSetPin, onBack, settings, phase, count, resultsIn, onLB }) {
  const groupDL = fmtMYT(settings.groupDeadline);
  const bracketDL = fmtMYT(settings.bracketDeadline);
  return <>
    <div style={{background:CT.ink, padding:"14px 22px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <Wordmark inverse/><Kicker color="#9c9789">MYT · KUALA LUMPUR</Kicker>
    </div>
    <div style={{display:"flex", height:6}}>
      <div style={{flex:1, background:CT.red}}/><div style={{flex:1, background:CT.blue}}/>
      <div style={{flex:1, background:CT.green}}/><div style={{flex:1, background:CT.yellow}}/>
    </div>

    <div style={{padding:"40px 22px 32px"}}>
      <div style={{marginBottom:18}}><Kicker color={CT.red}>● THE 2026 PREDICTION CHALLENGE</Kicker></div>
      <Display size={68} style={{display:"block"}}>PREDICT</Display>
      <div style={{display:"flex", alignItems:"baseline", gap:8}}>
        <Display size={68} color={CT.blue}>THE</Display>
        <Serif size={56} color={CT.red}>cup.</Serif>
      </div>
      <div style={{marginTop:14, display:"inline-flex", alignItems:"center", gap:8, padding:"5px 10px", background:CT.ink, color:"#fff"}}>
        <span style={{width:8, height:8, background:CT.yellow, borderRadius:"50%"}}/>
        <Kicker color="#fff">3 NATIONS · 16 CITIES · 104 MATCHES</Kicker>
      </div>
      <div style={{marginTop:20, maxWidth:420}}>
        <span style={{fontFamily:FF.sans, fontSize:14, lineHeight:1.55, color:CT.ink2}}>
          Pick all 72 group fixtures, then build the full knockout bracket. Highest accuracy across 104 matches wins.
        </span>
      </div>
    </div>

    <div style={{padding:"0 22px 24px"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <PhaseBlock label="PHASE I" title="Group stage" deadline={groupDL} color={CT.red}
          state={settings.groupOpen?(new Date()<new Date(settings.groupDeadline)?"OPEN":"EXPIRED"):"CLOSED"}/>
        <PhaseBlock label="PHASE II" title="Bracket" deadline={bracketDL} color={CT.blue}
          state={settings.bracketOpen?(new Date()<new Date(settings.bracketDeadline)?"OPEN":"EXPIRED"):"LOCKED"}/>
      </div>
    </div>

    {resultsIn>0 && <div style={{margin:"0 22px 24px", padding:"10px 14px", background:CT.green, color:"#fff"}}>
      <Kicker color="#fff">● {resultsIn} GROUP RESULTS IN — LEADERBOARD LIVE</Kicker>
    </div>}

    <div style={{padding:"0 22px 24px"}}>
      <div style={{background:CT.ink, color:"#fff", padding:"22px 22px 24px"}}>
        <Kicker color={CT.yellow}>SIGN IN</Kicker>
        <div style={{marginTop:8, marginBottom:14}}>
          {authStep==="name" && <Display size={26} color="#fff">Get in the game.</Display>}
          {authStep==="pin" && <Display size={26} color="#fff">Welcome back, <Serif size={26} color={CT.yellow}>{pendingName}.</Serif></Display>}
          {authStep==="setpin" && <Display size={26} color="#fff">Set a PIN, <Serif size={26} color={CT.yellow}>{pendingName}.</Serif></Display>}
        </div>

        {authStep==="name" && <>
          <input style={inputDark} value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onNameSubmit()} placeholder='Your name — or "admin"' autoFocus/>
          {authError && <div style={{marginTop:10, padding:"6px 10px", background:CT.red, color:"#fff", fontFamily:FF.mono, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase"}}>{authError}</div>}
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <Kicker color="#9c9789">NEW? SET A PIN NEXT</Kicker>
            <Btn color={CT.yellow} onClick={onNameSubmit} style={{color:CT.ink, borderColor:CT.yellow}}>Continue →</Btn>
          </div>
        </>}

        {authStep==="pin" && <>
          <input type="password" inputMode="numeric" maxLength={4} value={pinInput} onChange={e=>setPinInput(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&onPinSubmit()} placeholder="4-digit PIN" autoFocus
            style={{...inputDark, letterSpacing:"0.5em", fontFamily:FF.mono, fontSize:20}}/>
          {authError && <div style={{marginTop:10, padding:"6px 10px", background:CT.red, color:"#fff", fontFamily:FF.mono, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase"}}>{authError}</div>}
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <button onClick={onBack} style={{background:"transparent", border:"none", color:"#9c9789", fontFamily:FF.sans, fontSize:13, fontWeight:600, cursor:"pointer"}}>← Back</button>
            <Btn color={CT.yellow} onClick={onPinSubmit} style={{color:CT.ink, borderColor:CT.yellow}}>Sign in →</Btn>
          </div>
        </>}

        {authStep==="setpin" && <>
          <input type="password" inputMode="numeric" maxLength={4} value={pinInput} onChange={e=>setPinInput(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="New PIN" autoFocus
            style={{...inputDark, letterSpacing:"0.5em", fontFamily:FF.mono, fontSize:20, marginBottom:10}}/>
          <input type="password" inputMode="numeric" maxLength={4} value={pinConfirm} onChange={e=>setPinConfirm(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&onSetPin()} placeholder="Confirm"
            style={{...inputDark, letterSpacing:"0.5em", fontFamily:FF.mono, fontSize:20}}/>
          {authError && <div style={{marginTop:10, padding:"6px 10px", background:CT.red, color:"#fff", fontFamily:FF.mono, fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase"}}>{authError}</div>}
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <button onClick={onBack} style={{background:"transparent", border:"none", color:"#9c9789", fontFamily:FF.sans, fontSize:13, fontWeight:600, cursor:"pointer"}}>← Back</button>
            <Btn color={CT.yellow} onClick={onSetPin} style={{color:CT.ink, borderColor:CT.yellow}}>Set PIN & play →</Btn>
          </div>
        </>}
      </div>
    </div>

    <div style={{padding:"6px 22px 24px"}}>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:0, border:`1.5px solid ${CT.ink}`}}>
        {[["104","MATCHES",CT.red],["48","NATIONS",CT.blue],["16","CITIES",CT.green],[String(count||0).padStart(2,"0"),"PLAYERS",CT.yellow]].map(([v,l,c],i)=>(
          <div key={l} style={{padding:"16px 8px 14px", textAlign:"center", borderRight:i<3?`1.5px solid ${CT.ink}`:"none", background:"#fff"}}>
            <div style={{height:3, background:c, margin:"-16px -8px 12px"}}/>
            <Display size={32}>{v}</Display>
            <div style={{marginTop:8}}><Kicker>{l}</Kicker></div>
          </div>
        ))}
      </div>
    </div>

    <div style={{padding:"0 22px 24px"}}>
      <button onClick={onLB} style={{...inputLight, padding:"12px 16px", cursor:"pointer", textAlign:"left", fontWeight:700, textTransform:"uppercase", fontSize:11, letterSpacing:"0.04em", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span>View Leaderboard</span><span>→</span>
      </button>
    </div>

    <div style={{padding:"24px 22px 56px"}}>
      <div style={{marginBottom:14, display:"flex", alignItems:"baseline", gap:10}}>
        <Kicker>HOW IT PLAYS</Kicker><div style={{flex:1, height:1.5, background:CT.ink}}/>
      </div>
      {[
        ["01",CT.red,"Pick all 72 group stage matches — home win, draw, or away win."],
        ["02",CT.blue,"Once the group stage closes, build a complete knockout bracket through the final."],
        ["03",CT.green,"Each phase locks at its deadline. Picks can't be changed after kickoff."],
        ["04",CT.yellow,"Name + PIN keeps your sheet your own. No emails, no accounts."],
        ["05",CT.red,"Highest accuracy across 104 fixtures wins."],
      ].map(([n,c,b])=>(
        <div key={n} style={{display:"grid", gridTemplateColumns:"44px 1fr", padding:"14px 0", borderTop:`1px solid ${CT.rule}`, alignItems:"baseline"}}>
          <Num style={{fontSize:14, fontWeight:700, color:c}}>{n}</Num>
          <div style={{fontFamily:FF.sans, fontSize:14, lineHeight:1.5, color:CT.ink}}>{b}</div>
        </div>
      ))}
    </div>
  </>;
}

function PhaseBlock({ label, title, deadline, state, color }) {
  const isOpen = state === "OPEN";
  return <div style={{background: isOpen?color:CT.paper2, color: isOpen?"#fff":CT.ink, padding:"14px 14px 12px", border:`1.5px solid ${isOpen?color:CT.ink}`, opacity:isOpen?1:0.85}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
      <Kicker color={isOpen?"#fff":CT.muted}>{label}</Kicker>
      <span style={{fontFamily:FF.mono, fontSize:9, fontWeight:700, letterSpacing:"0.16em", padding:"2px 5px", background:isOpen?"#fff":CT.ink, color:isOpen?color:"#fff"}}>{state}</span>
    </div>
    <div style={{fontFamily:FF.display, fontWeight:800, fontSize:22, letterSpacing:"-0.03em", lineHeight:1}}>{title}</div>
    <div style={{marginTop:14, paddingTop:10, borderTop:`1px solid ${isOpen?"rgba(255,255,255,0.3)":CT.rule}`}}>
      <Num style={{fontSize:10, fontWeight:600, color:isOpen?"#fff":CT.muted, opacity:isOpen?0.85:1, letterSpacing:"0.02em"}}>{deadline}</Num>
    </div>
  </div>;
}

// ═══ GROUP STAGE TAB ═════════════════════════════════════════════════════════
function GroupStageTab({ groupPreds, onPick, isOpen, resultGroup }) {
  const [activeGrp, setActiveGrp] = useState("A");
  const matches = GROUP_MATCHES.filter(m=>m.grp===activeGrp);
  const color = GROUP_COLORS[activeGrp];
  const byDate = [];
  matches.forEach(m=>{ const last = byDate[byDate.length-1]; if (last && last.date===m.date) last.items.push(m); else byDate.push({date:m.date, items:[m]}); });

  return <div style={{paddingBottom:36}}>
    <div style={{padding:"18px 22px 0"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
        <Kicker>GROUPS A–L</Kicker>
        <Kicker>{matches.filter(m=>groupPreds[m.id]).length}/6 PICKED</Kicker>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:3}}>
        {GROUPS.map(g=>{
          const gd = GROUP_MATCHES.filter(m=>m.grp===g&&groupPreds[m.id]).length;
          const complete = gd===6, on = activeGrp===g, c = GROUP_COLORS[g];
          return <button key={g} onClick={()=>setActiveGrp(g)} style={{aspectRatio:"1", background:on?c:"#fff", color:on?"#fff":CT.ink, border:`1.5px solid ${on?c:CT.rule2}`, cursor:"pointer", borderRadius:0, fontFamily:FF.display, fontWeight:800, fontSize:14, letterSpacing:"-0.03em", position:"relative", padding:0}}>
            {g}{complete && !on && <span style={{position:"absolute", top:1, right:2, width:5, height:5, background:c, borderRadius:"50%"}}/>}
          </button>;
        })}
      </div>
    </div>

    <div style={{margin:"22px 22px 6px", background:color, color:"#fff", padding:"22px 18px"}}>
      <Kicker color="rgba(255,255,255,0.7)">GROUP</Kicker>
      <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginTop:4}}>
        <Display size={72} color="#fff">{activeGrp}</Display>
        <div style={{textAlign:"right"}}>
          <Kicker color="rgba(255,255,255,0.7)">FIXTURES</Kicker>
          <div style={{marginTop:2}}><Num style={{fontSize:24, color:"#fff", fontWeight:700}}>{matches.filter(m=>groupPreds[m.id]).length}/6</Num></div>
        </div>
      </div>
      <div style={{marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.25)"}}>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {[...new Set(matches.flatMap(m=>[m.home,m.away]))].map(t=>(
            <div key={t} style={{display:"flex", alignItems:"center", gap:5, padding:"3px 6px", background:"rgba(255,255,255,0.15)"}}>
              <Flag team={t} size={11}/>
              <span style={{fontFamily:FF.sans, fontWeight:600, fontSize:11, color:"#fff", letterSpacing:"-0.01em"}}>{shortName(t)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{padding:"4px 22px 0"}}>
      {byDate.map(day=>(
        <div key={day.date}>
          <div style={{display:"flex", alignItems:"center", gap:10, margin:"24px 0 10px"}}>
            <Serif size={16}>{day.items[0].date}</Serif>
            <div style={{flex:1, height:1, background:CT.rule2}}/>
            <Kicker>{day.items[0].rawDate}</Kicker>
          </div>
          {day.items.map(m=><GroupCard key={m.id} match={m} pick={groupPreds[m.id]} result={resultGroup[m.id]} onPick={v=>onPick(m.id,v)} isOpen={isOpen} color={color}/>)}
        </div>
      ))}
    </div>
  </div>;
}

function GroupCard({ match, pick, result, onPick, isOpen, color }) {
  const ok = pick && result && pick===result, bad = pick && result && pick!==result;
  return <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"14px", marginBottom:10, boxShadow: pick?`4px 4px 0 ${color}`:"none", transition:"box-shadow .15s"}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <Num style={{fontSize:10, fontWeight:700, color, letterSpacing:"0.04em"}}>M{match.id.toString().padStart(2,"0")}</Num>
        <Kicker>{match.time} MYT</Kicker>
      </div>
      <Kicker>{match.venue}</Kicker>
    </div>
    <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:10, marginBottom:14}}>
      <TeamCell team={match.home}/><Serif size={13} color={CT.faint}>vs</Serif><TeamCell team={match.away} reverse/>
    </div>
    {isOpen ? <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
      <PickBtn active={pick==="home"} correct={ok&&pick==="home"} wrong={bad&&pick==="home"} color={color} onClick={()=>onPick("home")}>{shortName(match.home)}</PickBtn>
      <PickBtn active={pick==="draw"} correct={ok&&pick==="draw"} wrong={bad&&pick==="draw"} color={color} onClick={()=>onPick("draw")}>Draw</PickBtn>
      <PickBtn active={pick==="away"} correct={ok&&pick==="away"} wrong={bad&&pick==="away"} color={color} onClick={()=>onPick("away")}>{shortName(match.away)}</PickBtn>
    </div> : <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <Kicker>YOUR PICK: <span style={{color:CT.ink}}>{pick==="home"?match.home:pick==="away"?match.away:pick==="draw"?"DRAW":"—"}</span></Kicker>
      {result && pick && <span style={{fontFamily:FF.mono, fontSize:10, fontWeight:700, letterSpacing:"0.12em", padding:"2px 6px", background:ok?CT.green:CT.red, color:"#fff"}}>{ok?"CORRECT":"MISSED"}</span>}
    </div>}
  </div>;
}

// ═══ STANDINGS TAB ═══════════════════════════════════════════════════════════
function StandingsTab({ standings, groupPreds }) {
  const done = GROUP_MATCHES.filter(m=>groupPreds[m.id]).length;
  return <div style={{padding:"22px 22px 36px"}}>
    <div style={{marginBottom:6}}><Kicker>PROJECTED TABLES</Kicker></div>
    <Display size={28} style={{display:"block"}}>Your tables.</Display>
    <div style={{marginTop:10, marginBottom:24, fontFamily:FF.sans, fontSize:13, color:CT.muted, lineHeight:1.5}}>
      {done<72 ? `${72-done} matches still unpicked — standings are partial. ` : ""}<span style={{color:CT.green, fontWeight:600}}>Top two advance</span>; eight best third-placed teams join them in the Round of 32.
    </div>
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
      {GROUPS.map(g=><StandingsCard key={g} group={g} table={standings[g]} color={GROUP_COLORS[g]}/>)}
    </div>
  </div>;
}

function StandingsCard({ group, table, color }) {
  if (!table || !table.length) return null;
  return <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`}}>
    <div style={{background:color, color:"#fff", padding:"7px 10px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <span style={{fontFamily:FF.display, fontWeight:800, fontSize:13, letterSpacing:"-0.02em"}}>GROUP {group}</span>
      <Num style={{fontSize:9, fontWeight:700, letterSpacing:"0.12em", color:"#fff", opacity:0.85}}>W·D·L·PTS</Num>
    </div>
    {table.map((t,i)=>(
      <div key={t.team} style={{display:"grid", gridTemplateColumns:"14px 1fr auto", gap:6, alignItems:"center", padding:"7px 10px", borderTop:i>0?`1px solid ${CT.rule}`:"none", background:i<2?`${color}10`:"transparent"}}>
        <Num style={{fontSize:10, color:i<2?color:CT.faint, fontWeight:700}}>{i+1}</Num>
        <div style={{display:"flex", alignItems:"center", gap:6, minWidth:0}}>
          <Flag team={t.team} size={11}/>
          <span style={{fontFamily:FF.sans, fontSize:11, fontWeight:i<2?700:500, color:CT.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{shortName(t.team)}</span>
        </div>
        <Num style={{fontSize:10, color:CT.muted, fontWeight:600}}>{t.w}·{t.d}·{t.l}·<span style={{color:CT.ink, fontWeight:700}}>{t.pts}</span></Num>
      </div>
    ))}
  </div>;
}

// ═══ BRACKET TAB ═════════════════════════════════════════════════════════════
function BracketTab({ koMatches, userKOW, setKOPick, isOpen, resultKOW }) {
  const [stage, setStage] = useState("R32");
  const stages = ["R32","R16","QF","SF","3P","F"];
  const stageColor = STAGE_COLORS[stage];

  return <div style={{paddingBottom:36}}>
    <div style={{padding:"22px 22px 0"}}>
      <Kicker>THE BRACKET</Kicker>
      <Display size={28} style={{display:"block", marginTop:4}}>Path to glory.</Display>
    </div>
    <div style={{margin:"18px 22px 24px", background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"12px 8px"}}>
      <BracketVisual koMatches={koMatches} userKOW={userKOW} setKOPick={setKOPick} isOpen={isOpen} resultKOW={resultKOW}/>
    </div>
    <div style={{padding:"0 22px"}}>
      <div style={{display:"flex", gap:4, overflowX:"auto", paddingBottom:4}}>
        {stages.map(s=>{
          const sm = koMatches.filter(m=>m.stage===s);
          const done = sm.filter(m=>userKOW[`w_${m.id}`]).length;
          const on = stage===s, c = STAGE_COLORS[s];
          return <button key={s} onClick={()=>setStage(s)} style={{padding:"7px 12px", flexShrink:0, background:on?c:"transparent", color:on?"#fff":CT.ink, border:`1.5px solid ${on?c:CT.ink}`, cursor:"pointer", borderRadius:0, fontFamily:FF.sans, fontWeight:700, fontSize:11, letterSpacing:"0.04em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6}}>
            {s} <Num style={{fontSize:9, opacity:0.75}}>{done}/{sm.length}</Num>
          </button>;
        })}
      </div>
    </div>
    <div style={{padding:"22px 22px 0"}}>
      <div style={{display:"flex", alignItems:"baseline", gap:12, marginBottom:14}}>
        <Serif size={22} color={stageColor}>{STAGE_LABEL[stage]}</Serif>
        <div style={{flex:1, height:2, background:stageColor}}/>
      </div>
      {koMatches.filter(m=>m.stage===stage).map(m=><KOCard key={m.id} match={m} pick={userKOW[`w_${m.id}`]} result={resultKOW[`w_${m.id}`]} onPick={t=>setKOPick(m.id,t)} isOpen={isOpen} color={stageColor}/>)}
    </div>
  </div>;
}

function KOCard({ match, pick, result, onPick, isOpen, color }) {
  const ok = pick && result && pick===result, bad = pick && result && pick!==result;
  return <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"14px", marginBottom:10, boxShadow:pick?`4px 4px 0 ${color}`:"none"}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <Num style={{fontSize:10, fontWeight:700, color, letterSpacing:"0.04em"}}>M{match.id}</Num>
        <Kicker>{match.time} MYT</Kicker>
      </div>
      <Kicker>{match.venue}</Kicker>
    </div>
    {match.home && match.away ? <>
      <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:10, marginBottom:14}}>
        <TeamCell team={match.home}/><Serif size={13} color={CT.faint}>vs</Serif><TeamCell team={match.away} reverse/>
      </div>
      {isOpen ? <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
        <PickBtn active={pick===match.home} correct={ok&&pick===match.home} wrong={bad&&pick===match.home} color={color} onClick={()=>onPick(match.home)}>{shortName(match.home)}</PickBtn>
        <PickBtn active={pick===match.away} correct={ok&&pick===match.away} wrong={bad&&pick===match.away} color={color} onClick={()=>onPick(match.away)}>{shortName(match.away)}</PickBtn>
      </div> : <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <Kicker>PICK: <span style={{color:CT.ink}}>{pick||"—"}</span></Kicker>
        {result && pick && <span style={{fontFamily:FF.mono, fontSize:10, fontWeight:700, letterSpacing:"0.12em", padding:"2px 6px", background:ok?CT.green:CT.red, color:"#fff"}}>{ok?"CORRECT":"MISSED"}</span>}
      </div>}
    </> : <div style={{padding:"10px 0", textAlign:"center"}}><Serif size={13} color={CT.faint}>awaits earlier round.</Serif></div>}
  </div>;
}

function BracketVisual({ koMatches, userKOW, setKOPick, isOpen, resultKOW }) {
  const STAGE_ORDER = ["R32","R16","QF","SF","F"];
  const byStage = {};
  koMatches.filter(m=>m.stage!=="3P").forEach(m=>{ if(!byStage[m.stage]) byStage[m.stage]=[]; byStage[m.stage].push(m); });
  const MH = { R32:40, R16:80, QF:160, SF:320, F:640 };
  const TOTAL = 16*40;
  return <div style={{overflowX:"auto"}}>
    <div style={{display:"flex", minWidth: STAGE_ORDER.length*120, gap:4}}>
      {STAGE_ORDER.map(s=>{
        const c = STAGE_COLORS[s];
        return <div key={s} style={{width:118}}>
          <div style={{textAlign:"center", marginBottom:6, padding:"3px 0", background:c, color:"#fff"}}>
            <span style={{fontFamily:FF.mono, fontSize:10, fontWeight:700, letterSpacing:"0.12em"}}>{s}</span>
          </div>
          <div style={{height:TOTAL, display:"flex", flexDirection:"column"}}>
            {(byStage[s]||[]).map(m=>{
              const winner = userKOW[`w_${m.id}`], actualW = resultKOW[`w_${m.id}`];
              return <div key={m.id} style={{height:MH[s], display:"flex", alignItems:"center", flexShrink:0}}>
                <div style={{width:"100%", border:`1px solid ${CT.rule2}`}}>
                  {[m.home, m.away].map((team,ti)=>{
                    const isW = winner===team, isL = winner && winner!==team;
                    const correct = actualW && isW && actualW===winner, wrong = actualW && isW && actualW!==winner;
                    return <div key={ti} onClick={()=>isOpen&&team&&setKOPick(m.id,team)} style={{display:"flex", alignItems:"center", gap:4, padding:"3px 5px", borderBottom: ti===0?`1px solid ${CT.rule}`:"none", background: isW ? (correct?CT.green:wrong?CT.red:c) : "transparent", color: isW?"#fff":CT.ink, opacity: isL?0.35:1, cursor:(isOpen&&team)?"pointer":"default"}}>
                      {team ? <Flag team={team} size={9}/> : <div style={{width:13, height:9, background:CT.rule}}/>}
                      <span style={{fontFamily:FF.display, fontWeight:isW?700:600, fontSize:10, letterSpacing:"-0.02em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1}}>{team ? (team.length>10?shortName(team).slice(0,10):team) : "—"}</span>
                    </div>;
                  })}
                </div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

// ═══ LEADERBOARD SCREEN ══════════════════════════════════════════════════════
function LeaderboardScreen({ leaderboard, resultsIn, onBack, count }) {
  const podiumColors = [CT.yellow, CT.blue, CT.red];
  return <>
    <div style={{background:CT.ink, color:"#fff", padding:"14px 22px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <button onClick={onBack} style={{background:"transparent", border:`1.5px solid #555`, color:"#fff", fontFamily:FF.sans, fontSize:11, fontWeight:600, padding:"5px 10px", cursor:"pointer", letterSpacing:"0.04em", textTransform:"uppercase"}}>← Back</button>
      <Wordmark inverse/>
    </div>
    <div style={{display:"flex", height:6}}>
      <div style={{flex:1, background:CT.yellow}}/><div style={{flex:1, background:CT.blue}}/><div style={{flex:1, background:CT.red}}/>
    </div>

    <div style={{padding:"22px 22px 0"}}>
      <Kicker>LIVE STANDINGS</Kicker>
      <Display size={32} style={{display:"block", marginTop:4}}>Leaderboard.</Display>
      <div style={{marginTop:8, fontFamily:FF.sans, fontSize:13, color:CT.muted}}>{count} players · {resultsIn}/72 group results entered</div>
    </div>

    {resultsIn===0 ? <div style={{padding:"40px 22px"}}>
      <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"40px 22px", textAlign:"center"}}>
        <Display size={24} color={CT.muted}>No results yet.</Display>
        <div style={{marginTop:10, fontSize:13, color:CT.muted}}>Accuracy appears once admin enters match results.</div>
      </div>
    </div> : leaderboard.length===0 ? <div style={{padding:"40px 22px"}}>
      <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"40px 22px", textAlign:"center"}}>
        <Display size={24} color={CT.muted}>No players yet.</Display>
      </div>
    </div> : <>
      {leaderboard.length>=3 && <div style={{padding:"22px 22px 8px"}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1.2fr 1fr", gap:6, alignItems:"end"}}>
          {[1,0,2].map(i=>{
            const p = leaderboard[i]; if (!p) return <div key={i}/>;
            const place = i+1, c = podiumColors[i], big = i===0;
            return <div key={p.name} style={{background:c, color:c===CT.yellow?CT.ink:"#fff", padding:big?"18px 12px 16px":"14px 10px 12px", textAlign:"center", border:`1.5px solid ${CT.ink}`}}>
              <div style={{fontFamily:FF.display, fontWeight:800, fontSize:big?56:42, lineHeight:0.9, letterSpacing:"-0.04em"}}>{place}</div>
              <div style={{height:1, background:c===CT.yellow?"rgba(10,10,10,0.3)":"rgba(255,255,255,0.4)", margin:"8px 0"}}/>
              <div style={{fontFamily:FF.sans, fontWeight:700, fontSize:big?13:12, letterSpacing:"-0.01em"}}>{p.name}</div>
              <div style={{marginTop:6}}>
                {p.pct!==null ? <Num style={{fontSize:big?22:18, fontWeight:700}}>{p.pct}<span style={{opacity:0.7, fontSize:11}}>%</span></Num> : <Num style={{fontSize:big?16:13, fontWeight:600, opacity:0.8}}>{p.groupDone+p.koDone} picks</Num>}
              </div>
            </div>;
          })}
        </div>
      </div>}

      <div style={{padding:"14px 22px 36px"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:10, marginBottom:8}}>
          <Kicker>FULL TABLE</Kicker><div style={{flex:1, height:1, background:CT.rule2}}/>
        </div>
        {leaderboard.map((p,i)=>(
          <div key={p.name} style={{display:"grid", gridTemplateColumns:"32px 1fr auto auto", gap:10, alignItems:"center", padding:"12px 0", borderTop:`1px solid ${CT.rule}`}}>
            <Num style={{fontSize:13, fontWeight:700, color:i<3?CT.red:CT.faint}}>{(i+1).toString().padStart(2,"0")}</Num>
            <span style={{fontFamily:FF.sans, fontWeight:i<3?700:500, fontSize:14, color:CT.ink}}>{p.name}</span>
            <Num style={{fontSize:10, color:CT.muted}}>{p.groupDone}/72 · {p.koDone}/{KO_DEF.length}</Num>
            {p.pct!==null ? <Num style={{fontSize:i===0?20:16, fontWeight:700, color:i===0?CT.red:CT.ink}}>{p.pct}<span style={{fontSize:10, color:CT.faint}}>%</span></Num>
              : <Num style={{fontSize:11, color:CT.muted}}>—</Num>}
          </div>
        ))}
      </div>
    </>}
  </>;
}

// ═══ ADMIN PANEL ═════════════════════════════════════════════════════════════
function AdminPanel({ resultGroup, resultB3, resultKOW, settings, allUsers, leaderboard, realStandings, onSaveResults, onSaveSettings, onDeleteUser, onBack, showToast }) {
  const [adminTab, setAdminTab] = useState("phase");
  const [activeGrp, setActiveGrp] = useState("A");
  const [activeKOStage, setActiveKOStage] = useState("R32");
  const [localSettings, setLocalSettings] = useState({...settings});
  const [localB3, setLocalB3] = useState({...resultB3});
  const [localKOW, setLocalKOW] = useState({...resultKOW});

  const adminStandings = computeStandings(resultGroup);
  const adminKOMatches = buildKO(adminStandings, localB3, localKOW);
  const phase = getPhase(localSettings);

  async function saveGrp(id,val) { const r={...resultGroup,[id]:val}; await onSaveResults(r,localB3,localKOW); showToast("Result saved"); }
  async function clearGrp(id) { const r={...resultGroup}; delete r[id]; await onSaveResults(r,localB3,localKOW); showToast("Cleared"); }
  async function saveB3(key,team) { const nb={...localB3,[key]:team}; setLocalB3(nb); await onSaveResults(resultGroup,nb,localKOW); showToast("3rd place team assigned"); }
  async function saveKO(mid,team) { const nk={...localKOW,[`w_${mid}`]:team}; setLocalKOW(nk); await onSaveResults(resultGroup,localB3,nk); showToast("Result saved"); }
  async function clearKO(mid) { const nk={...localKOW}; delete nk[`w_${mid}`]; setLocalKOW(nk); await onSaveResults(resultGroup,localB3,nk); showToast("Cleared"); }
  async function handleSaveSettings() { await onSaveSettings(localSettings); showToast("Settings saved"); }
  async function resetBracketPicks() { const upd={}; Object.entries(allUsers).forEach(([name,data])=>{ upd[name]={...data,userKOW:{}}; }); await storageSet(USERS_KEY, JSON.stringify(upd)); showToast("All bracket picks reset"); }

  const grpMatches = GROUP_MATCHES.filter(m=>m.grp===activeGrp);
  const koMatches = adminKOMatches.filter(m=>m.stage===activeKOStage);

  return <>
    <div style={{background:CT.ink, color:"#fff", padding:"14px 22px"}}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <button onClick={onBack} style={{background:"transparent", border:`1.5px solid #555`, color:"#fff", fontFamily:FF.sans, fontSize:11, fontWeight:600, padding:"5px 10px", cursor:"pointer", letterSpacing:"0.04em", textTransform:"uppercase"}}>← Exit</button>
        <div>
          <Kicker color={CT.yellow}>ADMIN</Kicker>
          <div style={{fontFamily:FF.display, fontWeight:800, fontSize:18, color:"#fff", marginTop:2, letterSpacing:"-0.02em"}}>Control panel</div>
          <div style={{marginTop:4}}><Kicker color="#9c9789">{Object.keys(resultGroup).length}/72 GROUP · {Object.keys(localKOW).length} KO · {Object.keys(allUsers).length} PLAYERS · {phase.toUpperCase()}</Kicker></div>
        </div>
      </div>
    </div>

    <div style={{background:"#fff", borderBottom:`1.5px solid ${CT.ink}`, display:"flex", overflowX:"auto", padding:"0 12px"}}>
      {[["phase","Phase"],["group","Group Results"],["b3","Best 3rd"],["knockout","KO Results"],["standings","Standings"],["players","Players"]].map(([t,l])=>{
        const on = adminTab===t;
        return <button key={t} onClick={()=>setAdminTab(t)} style={{padding:"12px 14px", border:"none", background:"transparent", cursor:"pointer", position:"relative", fontFamily:FF.sans, fontSize:12, fontWeight:on?700:500, color:on?CT.ink:CT.muted, whiteSpace:"nowrap"}}>
          {l}{on && <div style={{position:"absolute", left:0, right:0, bottom:-1.5, height:3, background:CT.red}}/>}
        </button>;
      })}
    </div>

    <div style={{padding:"22px"}}>

      {adminTab==="phase" && <>
        <div style={{background:CT.ink, color:"#fff", padding:"12px 14px", marginBottom:14}}>
          <Kicker color="#9c9789">Control which phase is currently open. Deadlines auto-lock picks; toggles override.</Kicker>
        </div>

        <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"16px", marginBottom:12}}>
          <Kicker color={CT.red}>PHASE I</Kicker>
          <div style={{fontFamily:FF.display, fontWeight:800, fontSize:20, marginTop:2}}>Group stage</div>
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:13, fontWeight:600}}>Group picks open</div>
              <Kicker>{localSettings.groupOpen?"PLAYERS CAN SUBMIT":"CLOSED"}</Kicker>
            </div>
            <Toggle checked={localSettings.groupOpen} onChange={v=>setLocalSettings(s=>({...s,groupOpen:v}))}/>
          </div>
          <div style={{marginTop:14}}>
            <Kicker>DEADLINE (UTC)</Kicker>
            <input type="datetime-local" style={{...inputLight, marginTop:6}}
              value={localSettings.groupDeadline?localSettings.groupDeadline.slice(0,16):""}
              onChange={e=>setLocalSettings(s=>({...s,groupDeadline:e.target.value+":00Z"}))}/>
            <div style={{marginTop:6}}><Kicker>MYT: <span style={{color:CT.ink}}>{fmtMYT(localSettings.groupDeadline)}</span></Kicker></div>
          </div>
        </div>

        <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"16px", marginBottom:12}}>
          <Kicker color={CT.blue}>PHASE II</Kicker>
          <div style={{fontFamily:FF.display, fontWeight:800, fontSize:20, marginTop:2}}>Bracket</div>
          <div style={{marginTop:8, padding:"8px 10px", background:CT.yellow, color:CT.ink}}>
            <Kicker color={CT.ink}>OPEN ONLY AFTER ALL 72 GROUP RESULTS + 8 BEST-3RD SLOTS</Kicker>
          </div>
          <div style={{marginTop:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:13, fontWeight:600}}>Bracket picks open</div>
              <Kicker>{localSettings.bracketOpen?"PLAYERS CAN SUBMIT":"NOT YET OPEN"}</Kicker>
            </div>
            <Toggle checked={localSettings.bracketOpen} onChange={v=>setLocalSettings(s=>({...s,bracketOpen:v}))}/>
          </div>
          <div style={{marginTop:14}}>
            <Kicker>DEADLINE (UTC)</Kicker>
            <input type="datetime-local" style={{...inputLight, marginTop:6}}
              value={localSettings.bracketDeadline?localSettings.bracketDeadline.slice(0,16):""}
              onChange={e=>setLocalSettings(s=>({...s,bracketDeadline:e.target.value+":00Z"}))}/>
            <div style={{marginTop:6, marginBottom:14}}><Kicker>MYT: <span style={{color:CT.ink}}>{fmtMYT(localSettings.bracketDeadline)}</span></Kicker></div>
            <Btn color={CT.red} sm onClick={()=>{if(window.confirm("Reset ALL bracket picks for all players? Cannot be undone."))resetBracketPicks();}}>Reset all bracket picks</Btn>
          </div>
        </div>

        <div style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"16px", marginBottom:14}}>
          <Kicker>REGISTRATION</Kicker>
          <div style={{marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:13, fontWeight:600}}>Lock new registrations</div>
              <Kicker>{localSettings.registrationLocked?"CLOSED":"OPEN TO ANYONE"}</Kicker>
            </div>
            <Toggle checked={localSettings.registrationLocked} onChange={v=>setLocalSettings(s=>({...s,registrationLocked:v}))}/>
          </div>
        </div>

        <Btn color={CT.ink} full onClick={handleSaveSettings}>Save all settings</Btn>

        <div style={{background:"#fff", border:`1.5px solid ${CT.rule2}`, padding:"14px", marginTop:14}}>
          <Kicker>ADMIN PASSWORD</Kicker>
          <div style={{marginTop:6, fontSize:13, color:CT.muted, lineHeight:1.5}}>Update <code style={{background:CT.paper2, padding:"1px 5px", fontFamily:FF.mono, fontSize:12}}>ADMIN_PW</code> in App.jsx and redeploy.</div>
        </div>
      </>}

      {adminTab==="group" && <>
        <div style={{background:CT.yellow, color:CT.ink, padding:"10px 14px", marginBottom:14}}>
          <Kicker color={CT.ink}>● CLICK A RESULT TO SAVE INSTANTLY. GREEN = ENTERED</Kicker>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:3, marginBottom:18}}>
          {GROUPS.map(g=>{
            const done = GROUP_MATCHES.filter(m=>m.grp===g&&resultGroup[m.id]).length;
            const total = GROUP_MATCHES.filter(m=>m.grp===g).length;
            const on = activeGrp===g, c = GROUP_COLORS[g];
            return <button key={g} onClick={()=>setActiveGrp(g)} style={{aspectRatio:"1", background:on?c:done===total?`${c}30`:"#fff", color:on?"#fff":CT.ink, border:`1.5px solid ${on?c:CT.rule2}`, cursor:"pointer", borderRadius:0, fontFamily:FF.display, fontWeight:800, fontSize:14, letterSpacing:"-0.03em"}}>{g}</button>;
          })}
        </div>
        {grpMatches.map(m=>(
          <div key={m.id} style={{background:"#fff", border:`1.5px solid ${CT.rule2}`, padding:"12px", marginBottom:8}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <Kicker>M{m.id} · {m.date} · {m.time} MYT</Kicker>
              {resultGroup[m.id] && <Btn color={CT.red} sm onClick={()=>clearGrp(m.id)}>Clear</Btn>}
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
              <TeamCell team={m.home}/><Serif size={13} color={CT.faint}>vs</Serif><TeamCell team={m.away} reverse/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5}}>
              {[["home",m.home],["draw","Draw"],["away",m.away]].map(([val,lbl])=>(
                <PickBtn key={val} active={resultGroup[m.id]===val} color={CT.green} onClick={()=>saveGrp(m.id,val)}>
                  {resultGroup[m.id]===val?"✓ ":""}{shortName(lbl)}
                </PickBtn>
              ))}
            </div>
          </div>
        ))}
      </>}

      {adminTab==="b3" && <>
        <div style={{background:CT.blue, color:"#fff", padding:"10px 14px", marginBottom:14}}>
          <Kicker color="#fff">● ASSIGN WHICH 3RD-PLACE TEAM ADVANCED INTO EACH BRACKET SLOT</Kicker>
        </div>
        {BEST3RD_MATCHES.map(m=>{
          const groups = m.awaySlot.groups, key = `b3_${groups.join("")}`, selected = localB3[key];
          const myt = etToMYT(m.date, m.et);
          const eligible = groups.map(g=>{ const tab=adminStandings[g]; if(!tab||tab.length<3) return null; const t=tab[2]; if(!t) return null; return {...t,grp:g}; }).filter(Boolean);
          return <div key={m.id} style={{background:"#fff", border:`1.5px solid ${CT.ink}`, padding:"14px", marginBottom:10}}>
            <div style={{fontFamily:FF.display, fontWeight:800, fontSize:15, letterSpacing:"-0.02em"}}>Match {m.id}</div>
            <Kicker>{myt.date} · {myt.time} MYT · {m.venue}</Kicker>
            <div style={{marginTop:6}}><Kicker>BEST 3RD FROM GROUPS {groups.join("/")} · {STAGE_LABEL[m.stage]}</Kicker></div>
            <div style={{display:"flex", flexDirection:"column", gap:6, marginTop:12}}>
              {eligible.length===0 && <div style={{fontSize:12, color:CT.faint}}>Enter group results first to see eligible teams.</div>}
              {eligible.map(t=>{
                const isSel = selected===t.team;
                return <button key={t.team} onClick={()=>saveB3(key,t.team)} style={{display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1.5px solid ${isSel?CT.green:CT.rule2}`, background:isSel?CT.green:"#fff", color:isSel?"#fff":CT.ink, cursor:"pointer", textAlign:"left", width:"100%", borderRadius:0}}>
                  <Flag team={t.team} size={20}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:FF.sans, fontWeight:isSel?700:500, fontSize:13}}>{t.team}</div>
                    <div style={{fontFamily:FF.mono, fontSize:10, letterSpacing:"0.08em", opacity:isSel?0.85:0.65, marginTop:2}}>GROUP {t.grp} · 3RD · {t.pts} PTS</div>
                  </div>
                  {isSel && <Kicker color="#fff">✓ ASSIGNED</Kicker>}
                </button>;
              })}
            </div>
          </div>;
        })}
      </>}

      {adminTab==="knockout" && <>
        <div style={{background:CT.blue, color:"#fff", padding:"10px 14px", marginBottom:14}}>
          <Kicker color="#fff">● TEAMS AUTO-POPULATE FROM GROUP RESULTS + BEST-3RD ASSIGNMENTS</Kicker>
        </div>
        <div style={{display:"flex", gap:4, overflowX:"auto", marginBottom:14}}>
          {["R32","R16","QF","SF","3P","F"].map(s=>{
            const on = activeKOStage===s, c = STAGE_COLORS[s];
            return <button key={s} onClick={()=>setActiveKOStage(s)} style={{padding:"7px 12px", flexShrink:0, background:on?c:"transparent", color:on?"#fff":CT.ink, border:`1.5px solid ${on?c:CT.ink}`, cursor:"pointer", borderRadius:0, fontFamily:FF.sans, fontWeight:700, fontSize:11, letterSpacing:"0.04em", textTransform:"uppercase"}}>{STAGE_LABEL[s]}</button>;
          })}
        </div>
        {koMatches.map(m=>{
          const actualW = localKOW[`w_${m.id}`];
          return <div key={m.id} style={{background:"#fff", border:`1.5px solid ${CT.rule2}`, padding:"12px", marginBottom:8}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <Kicker>M{m.id} · {m.date} · {m.time} MYT</Kicker>
              {actualW && <Btn color={CT.red} sm onClick={()=>clearKO(m.id)}>Clear</Btn>}
            </div>
            {m.home && m.away ? <>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
                <TeamCell team={m.home}/><Serif size={13} color={CT.faint}>vs</Serif><TeamCell team={m.away} reverse/>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:5}}>
                {[m.home, m.away].map(team=>(
                  <PickBtn key={team} active={actualW===team} color={CT.green} onClick={()=>saveKO(m.id,team)}>
                    {actualW===team?"✓ ":""}{shortName(team)}
                  </PickBtn>
                ))}
              </div>
            </> : <div style={{fontSize:12, color:CT.faint}}>Teams TBD — enter previous round first.</div>}
          </div>;
        })}
      </>}

      {adminTab==="standings" && <>
        <div style={{background:CT.green, color:"#fff", padding:"10px 14px", marginBottom:14}}>
          <Kicker color="#fff">● LIVE STANDINGS FROM ACTUAL GROUP RESULTS</Kicker>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          {GROUPS.map(g=>{
            const tab = adminStandings[g];
            if (!tab || !tab.length) return <div key={g} style={{background:"#fff", border:`1.5px solid ${CT.rule2}`, padding:"14px", textAlign:"center"}}>
              <Kicker>GROUP {g}</Kicker>
              <div style={{marginTop:6, fontSize:12, color:CT.faint}}>No results yet</div>
            </div>;
            return <StandingsCard key={g} group={g} table={tab} color={GROUP_COLORS[g]}/>;
          })}
        </div>
      </>}

      {adminTab==="players" && <>
        <div style={{marginBottom:14, display:"flex", alignItems:"baseline", gap:10}}>
          <Kicker>PLAYERS</Kicker><Num style={{fontSize:14, color:CT.muted}}>({Object.keys(allUsers).length})</Num>
          <div style={{flex:1, height:1.5, background:CT.ink}}/>
        </div>
        <div style={{background:CT.red, color:"#fff", padding:"10px 14px", marginBottom:14}}>
          <Kicker color="#fff">● DELETING REMOVES PREDICTIONS + PIN. THEY CAN RE-REGISTER.</Kicker>
        </div>
        {leaderboard.length===0 ? <div style={{background:"#fff", border:`1.5px solid ${CT.rule2}`, padding:"40px", textAlign:"center", color:CT.faint}}>No players yet.</div>
          : leaderboard.map(u=>(
          <div key={u.name} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#fff", border:`1.5px solid ${CT.rule2}`, marginBottom:6}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{width:30, height:30, background:CT.ink, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FF.display, fontWeight:800, fontSize:13}}>{u.name[0].toUpperCase()}</div>
              <div>
                <div style={{fontFamily:FF.sans, fontWeight:700, fontSize:13}}>{u.name}</div>
                <Kicker>{u.groupDone}/72 · {u.koDone}/{KO_DEF.length}{u.pct!==null?` · ${u.pct}% ACC`:""}</Kicker>
              </div>
            </div>
            <Btn color={CT.red} sm onClick={()=>onDeleteUser(u.name)}>Delete</Btn>
          </div>
        ))}
      </>}
    </div>
  </>;
}

// ═══ TOGGLE ══════════════════════════════════════════════════════════════════
function Toggle({ checked, onChange }) {
  return <label style={{position:"relative", width:44, height:24, flexShrink:0, cursor:"pointer"}}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{opacity:0, width:0, height:0}}/>
    <span style={{position:"absolute", inset:0, background:checked?CT.green:"#d1d5db", transition:"0.2s"}}>
      <span style={{position:"absolute", height:18, width:18, left:checked?23:3, bottom:3, background:"#fff", transition:"0.2s"}}/>
    </span>
  </label>;
}
