import { useState, useEffect, useCallback } from "react";
import { storageGet, storageSet } from "./supabase";

// ─── PIN HASHING ──────────────────────────────────────────────────────────────
async function hashPin(pin) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin + "wc2026salt"));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
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
const EMOJI_F = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿","Canada":"🇨🇦",
  "Bosnia & Herzegovina":"🇧🇦","USA":"🇺🇸","Paraguay":"🇵🇾","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺","Türkiye":"🇹🇷",
  "Germany":"🇩🇪","Curaçao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵","Ivory Coast":"🇨🇮",
  "Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷",
  "New Zealand":"🇳🇿","France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴","Portugal":"🇵🇹",
  "DR Congo":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
  "Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
};
const ALL_TEAMS = Object.keys(FLAG_CODE).sort();

function Flag({ team, size = 28 }) {
  const [err, setErr] = useState(false);
  const code = FLAG_CODE[team];
  if (!code || err) return <span style={{ fontSize: size * 0.78, lineHeight: 1 }}>{EMOJI_F[team] || "⚽"}</span>;
  return <img src={`https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/${code}.svg`} alt={team} onError={() => setErr(true)}
    style={{ width: Math.round(size * 1.45), height: size, objectFit: "cover", borderRadius: 3, border: "1px solid #e5e7eb", display: "block", flexShrink: 0 }} />;
}

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
// Convert ET date+time string to UTC ISO string
function etToUtcIso(dateStr, etStr) {
  const isPM = etStr.includes("p.m."), isAM = etStr.includes("a.m.");
  const clean = etStr.replace(/\s?(a\.m\.|p\.m\.)/, "").trim();
  let [h, m] = clean.includes(":") ? clean.split(":").map(Number) : [parseInt(clean), 0];
  if (isNaN(m)) m = 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  // ET = UTC-4 (EDT during summer)
  const utcMin = h * 60 + m + 4 * 60;
  const dayOver = Math.floor(utcMin / 1440);
  const tod = utcMin % 1440;
  const uh = Math.floor(tod / 60), um = tod % 60;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, mo - 1, d + dayOver, uh, um, 0));
  return base.toISOString();
}

function utcToMYT(isoStr) {
  if (!isoStr) return { time: "—", date: "—" };
  const d = new Date(isoStr);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const myt = new Date(d.getTime() + 8 * 3600 * 1000);
  const hh = myt.getUTCHours(), mm = myt.getUTCMinutes();
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return {
    time: `${h12}:${mm.toString().padStart(2,"0")} ${ampm}`,
    date: `${days[myt.getUTCDay()]}, ${months[myt.getUTCMonth()]} ${myt.getUTCDate()}`,
  };
}

function fmtMYT(isoStr) {
  if (!isoStr) return "Not set";
  return new Date(isoStr).toLocaleString("en-MY", { timeZone:"Asia/Kuala_Lumpur", day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) + " MYT";
}

// ─── MATCH DATA ───────────────────────────────────────────────────────────────
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

const KO_RAW = [
  {id:73,stage:"R32",date:"2026-06-28",et:"3 p.m.",homeSlot:{type:"winner",grp:"A"},awaySlot:{type:"runner",grp:"B"},venue:"Los Angeles"},
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

// Pre-compute kickoff UTC times
const GROUP_MATCHES = GROUP_RAW.map(m => {
  const kickoffUtc = etToUtcIso(m.date, m.et);
  const myt = utcToMYT(kickoffUtc);
  return { ...m, kickoffUtc, ...myt };
});

const KO_DEF = KO_RAW.map(m => {
  const kickoffUtc = etToUtcIso(m.date, m.et);
  const myt = utcToMYT(kickoffUtc);
  return { ...m, kickoffUtc, ...myt };
});

// First match kickoff — bonus picks deadline
const BONUS_DEADLINE_UTC = GROUP_MATCHES[0].kickoffUtc; // 2026-06-11 19:00 UTC

const BEST3RD_MATCHES = KO_DEF.filter(m => m.awaySlot?.type === "best3rd");
const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const STAGE_LABEL = { R32:"Round of 32", R16:"Round of 16", QF:"Quarterfinal", SF:"Semifinal", "3P":"3rd Place", F:"Final" };
const STAGE_COL = { R32:"#7c3aed", R16:"#b45309", QF:"#b45309", SF:"#dc2626", "3P":"#4b5563", F:"#1d4ed8" };
const KO_STAGE_ORDER = ["R32","R16","QF","SF","3P","F"];
const ADMIN_PW = "wc2026admin";
const K_USERS = "wc2026_users";
const K_RESULTS = "wc2026_results";
const K_SETTINGS = "wc2026_settings";
const DEFAULT_SETTINGS = {
  bracketOpen: false,
  bracketDeadline: "2026-06-28T19:00:00Z",
  registrationLocked: false,
};

// ─── SCORING ──────────────────────────────────────────────────────────────────
const KO_PTS = { R32:5, R16:10, QF:20, SF:35, "3P":25, F:60 };

function calcScore(user, resultGrp, resultKOW, resultBonus) {
  let grpPts=0, koPts=0, bonusPts=0;
  const grpPreds = user.groupPreds || {};
  const userKOW = user.userKOW || {};

  GROUP_MATCHES.forEach(m => {
    const pick = grpPreds[m.id], res = resultGrp[m.id];
    if (pick && res) {
      if (pick === res) {
        grpPts += 3;
        if (res === "draw") grpPts += 2; // draw bonus
      }
    }
  });

  KO_DEF.forEach(m => {
    const pick = userKOW[`w_${m.id}`], res = resultKOW[`w_${m.id}`];
    if (pick && res && pick === res) koPts += KO_PTS[m.stage] || 0;
  });

  if (user.bonusChampion && resultBonus.champion && user.bonusChampion === resultBonus.champion) bonusPts += 40;
  if (user.bonusRunner && resultBonus.runner && user.bonusRunner === resultBonus.runner) bonusPts += 20;

  return { grpPts, koPts, bonusPts, total: grpPts + koPts + bonusPts };
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────
function computeStandings(preds) {
  const groups = {};
  GROUP_MATCHES.forEach(m => {
    if (!groups[m.grp]) groups[m.grp] = {};
    [m.home, m.away].forEach(t => { if (!groups[m.grp][t]) groups[m.grp][t] = {team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}; });
    const r = preds[m.id]; if (!r) return;
    const H = groups[m.grp][m.home], A = groups[m.grp][m.away];
    H.p++; A.p++;
    if (r==="home"){H.w++;H.pts+=3;A.l++;H.gf++;A.ga++;}
    else if (r==="away"){A.w++;A.pts+=3;H.l++;A.gf++;H.ga++;}
    else{H.d++;A.d++;H.pts++;A.pts++;H.gf++;A.gf++;H.ga++;A.ga++;}
  });
  const out = {};
  Object.keys(groups).forEach(g => { out[g] = Object.values(groups[g]).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||b.w-a.w); });
  return out;
}

function resolveTeam(slot, standings, b3, koW) {
  if (!slot) return null;
  if (slot.type==="winner") return standings[slot.grp]?.[0]?.team||null;
  if (slot.type==="runner") return standings[slot.grp]?.[1]?.team||null;
  if (slot.type==="best3rd") return b3[`b3_${slot.groups.join("")}`]||null;
  if (slot.type==="winnerOf") return koW[`w_${slot.matchId}`]||null;
  if (slot.type==="loserOf") {
    const def=KO_DEF.find(x=>x.id===slot.matchId); if(!def) return null;
    const w=koW[`w_${slot.matchId}`]; if(!w) return null;
    const h=resolveTeam(def.homeSlot,standings,b3,koW);
    const a=resolveTeam(def.awaySlot,standings,b3,koW);
    return w===h?a:w===a?h:null;
  }
  return null;
}

function buildKO(standings, b3, koW) {
  return KO_DEF.map(m => ({ ...m, home:resolveTeam(m.homeSlot,standings,b3,koW), away:resolveTeam(m.awaySlot,standings,b3,koW) }));
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page:{minHeight:"100vh",background:"#f9fafb",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:"#111827"},
  hdr:{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",position:"sticky",top:0,zIndex:10},
  wrap:{maxWidth:700,margin:"0 auto",padding:"0 1rem 4rem"},
  wrapN:{maxWidth:460,margin:"0 auto",padding:"0 1rem 4rem"},
  hero:{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"2rem 1.5rem 0",textAlign:"center"},
  card:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"1rem 1.25rem",marginBottom:10},
  cardSm:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 12px",marginBottom:8},
  cardTitle:{fontSize:12,fontWeight:600,color:"#374151",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.4px"},
  inp:{width:"100%",background:"#fff",border:"1px solid #d1d5db",borderRadius:8,padding:"9px 13px",color:"#111827",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
  sel:{width:"100%",background:"#fff",border:"1px solid #d1d5db",borderRadius:8,padding:"9px 13px",color:"#111827",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",cursor:"pointer"},
  navBar:{background:"#fff",borderBottom:"1px solid #e5e7eb",display:"flex",overflowX:"auto"},
  navTab:{flex:1,minWidth:72,padding:"11px 6px",fontSize:11,fontWeight:600,border:"none",background:"none",color:"#6b7280",cursor:"pointer",borderBottom:"2px solid transparent",whiteSpace:"nowrap",transition:"all 0.15s",textTransform:"uppercase",letterSpacing:"0.4px"},
  navOn:{color:"#2563eb",borderBottomColor:"#2563eb"},
  subNav:{background:"#f9fafb",borderBottom:"1px solid #e5e7eb",display:"flex",overflowX:"auto",paddingLeft:12},
  subTab:{padding:"8px 14px",fontSize:11,fontWeight:600,border:"none",background:"none",color:"#6b7280",cursor:"pointer",borderBottom:"2px solid transparent",whiteSpace:"nowrap",transition:"all 0.15s"},
  subOn:{color:"#2563eb",borderBottomColor:"#2563eb"},
  btn:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit"},
  btnP:{background:"#2563eb",color:"#fff"},
  btnG:{background:"#dcfce7",color:"#15803d",border:"1px solid #86efac"},
  btnR:{background:"#fee2e2",color:"#b91c1c",border:"1px solid #fca5a5"},
  btnQ:{background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb"},
  btnY:{background:"#fef9c3",color:"#854d0e",border:"1px solid #fde68a"},
  btnO:{background:"#fff7ed",color:"#9a3412",border:"1px solid #fed7aa"},
  btnSm:{padding:"5px 11px",fontSize:11},
  btnFull:{width:"100%"},
  aY:{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#92400e",marginBottom:10},
  aG:{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#15803d",marginBottom:10},
  aR:{background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#b91c1c",marginBottom:10},
  aB:{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#1d4ed8",marginBottom:10},
  aP:{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#7e22ce",marginBottom:10},
  pbarWrap:{height:3,background:"#f3f4f6"},
  pbar:{height:3,background:"#2563eb",transition:"width 0.4s"},
  avatar:{width:30,height:30,borderRadius:"50%",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#2563eb",flexShrink:0},
  th:{padding:"5px 7px",textAlign:"left",fontSize:10,textTransform:"uppercase",letterSpacing:"0.5px",color:"#9ca3af",fontWeight:600,borderBottom:"1px solid #f3f4f6"},
  td:{padding:"6px 7px",borderBottom:"1px solid #f9fafb",color:"#374151"},
  toast:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#111827",borderRadius:8,padding:"9px 18px",fontSize:13,color:"#fff",zIndex:999,whiteSpace:"nowrap"},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"},
  modal:{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"1.5rem",maxWidth:360,width:"100%",textAlign:"center"},
  phaseTag:(on)=>({display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:12,background:on?"#f0fdf4":"#fff5f5",color:on?"#15803d":"#b91c1c",border:`1px solid ${on?"#86efac":"#fca5a5"}`}),
  toggleWrap:{position:"relative",width:44,height:24,flexShrink:0},
  ptsBadge:(pts,color)=>({display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,background:color||"#eff6ff",color:"#1d4ed8",border:"1px solid #bfdbfe"}),
};

function Toggle({on,onChange}){
  return(
    <label style={S.toggleWrap}>
      <input type="checkbox" checked={on} onChange={onChange} style={{opacity:0,width:0,height:0}}/>
      <span style={{position:"absolute",inset:0,background:on?"#2563eb":"#d1d5db",borderRadius:12,cursor:"pointer",transition:"0.3s"}}>
        <span style={{position:"absolute",height:18,width:18,left:on?23:3,bottom:3,background:"#fff",borderRadius:"50%",transition:"0.3s"}}/>
      </span>
    </label>
  );
}


// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");
  const [username, setUsername] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [pinStep, setPinStep] = useState("enter");
  const [pinDigits, setPinDigits] = useState(["","","",""]);
  const [confirmDigits, setConfirmDigits] = useState(["","","",""]);
  const [pinError, setPinError] = useState("");
  const [groupPreds, setGroupPreds] = useState({});
  const [userKOW, setUserKOW] = useState({});
  const [bonusChampion, setBonusChampion] = useState("");
  const [bonusRunner, setBonusRunner] = useState("");
  const [allUsers, setAllUsers] = useState({});
  const [resultGrp, setResultGrp] = useState({});
  const [resultB3, setResultB3] = useState({});
  const [resultKOW, setResultKOW] = useState({});
  const [resultBonus, setResultBonus] = useState({champion:"",runner:""});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mainTab, setMainTab] = useState("predictions");
  const [subTab, setSubTab] = useState("group");
  const [saved, setSaved] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Update "now" every 30s to keep kickoff locks fresh
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const bracketDeadline = new Date(settings.bracketDeadline||DEFAULT_SETTINGS.bracketDeadline);
  const bracketOpen = settings.bracketOpen && now < bracketDeadline;
  const bonusLocked = now >= new Date(BONUS_DEADLINE_UTC);
  // phase: 1=group only visible, 2=bracket visible too, 0=view only
  const anyGroupOpen = GROUP_MATCHES.some(m => now < new Date(m.kickoffUtc));
  const phase = bracketOpen ? 2 : anyGroupOpen ? 1 : 0;

  function matchIsOpen(kickoffUtc) { return now < new Date(kickoffUtc); }

  useEffect(()=>{
    (async()=>{
      try{const u=await storageGet(K_USERS);if(u?.value)setAllUsers(JSON.parse(u.value));}catch{}
      try{const r=await storageGet(K_RESULTS);if(r?.value){const d=JSON.parse(r.value);setResultGrp(d.group||{});setResultB3(d.b3||{});setResultKOW(d.ko||{});setResultBonus(d.bonus||{champion:"",runner:""});}}catch{}
      try{const s=await storageGet(K_SETTINGS);if(s?.value)setSettings({...DEFAULT_SETTINGS,...JSON.parse(s.value)});}catch{}
      setLoading(false);
    })();
  },[]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),2800);};
  const saveUsers=async u=>{await storageSet(K_USERS,JSON.stringify(u));setAllUsers(u);};
  const saveResults=async(grp,b3,ko,bonus)=>{await storageSet(K_RESULTS,JSON.stringify({group:grp,b3,ko,bonus}));setResultGrp(grp);setResultB3(b3);setResultKOW(ko);setResultBonus(bonus);};
  const saveSetting=async s=>{await storageSet(K_SETTINGS,JSON.stringify(s));setSettings(s);};

  const realStandings=computeStandings(resultGrp);
  const userStandings=computeStandings(groupPreds);
  const koMatches=buildKO(realStandings,resultB3,userKOW);

  const leaderboard=Object.entries(allUsers).map(([name,data])=>{
    const score=calcScore(data,resultGrp,resultKOW,resultBonus);
    return{name,groupDone:Object.keys(data.groupPreds||{}).length,koDone:Object.keys(data.userKOW||{}).length,...score};
  }).sort((a,b)=>{
    if(b.total!==a.total)return b.total-a.total;
    if(b.koPts!==a.koPts)return b.koPts-a.koPts;
    const aChamp=a.bonusPts>=40?1:0,bChamp=b.bonusPts>=40?1:0;
    if(bChamp!==aChamp)return bChamp-aChamp;
    return b.bonusPts-a.bonusPts;
  });

  async function handleNameSubmit(){
    const name=nameInput.trim();if(!name)return;
    if(name.toLowerCase()==="admin"){setView("adminLogin");return;}
    const existing=allUsers[name];
    if(!existing){
      if(settings.registrationLocked){showToast("Registration is closed. Contact the admin.");return;}
      setPinStep("set");setPinDigits(["","","",""]);setConfirmDigits(["","","",""]);setPinError("");
    }else{
      setPinStep("enter");setPinDigits(["","","",""]);setPinError("");
    }
    setView("pin");
  }

  async function handlePinEnter(){
    const pin=pinDigits.join("");
    if(pin.length!==4){setPinError("Please enter all 4 digits");return;}
    const hashed=await hashPin(pin);
    if(allUsers[nameInput.trim()]?.pin!==hashed){setPinError("Incorrect PIN. Try again.");setPinDigits(["","","",""]);return;}
    loginUser(nameInput.trim());
  }

  async function handlePinSet(){
    const pin=pinDigits.join(""),conf=confirmDigits.join("");
    if(pin.length!==4){setPinError("Please enter all 4 digits");return;}
    if(pin!==conf){setPinError("PINs don't match. Try again.");setConfirmDigits(["","","",""]);return;}
    const hashed=await hashPin(pin);
    const name=nameInput.trim();
    const upd={...allUsers,[name]:{pin:hashed,groupPreds:{},userKOW:{},bonusChampion:"",bonusRunner:"",registeredAt:new Date().toISOString()}};
    await saveUsers(upd);
    loginUser(name);
  }

  function loginUser(name){
    setUsername(name);
    const ex=allUsers[name]||{};
    setGroupPreds(ex.groupPreds||{});setUserKOW(ex.userKOW||{});
    setBonusChampion(ex.bonusChampion||"");setBonusRunner(ex.bonusRunner||"");
    if(phase===2){setMainTab("predictions");setSubTab("bracket");}
    else{setMainTab("predictions");setSubTab("group");}
    setView("predict");
  }

  async function handleSave(){
    const upd={...allUsers,[username]:{...allUsers[username],groupPreds,userKOW,bonusChampion,bonusRunner,savedAt:new Date().toISOString()}};
    await saveUsers(upd);setSaved(true);showToast("Predictions saved!");setTimeout(()=>setSaved(false),2000);
  }

  async function handleDeleteUser(name){
    const upd={...allUsers};delete upd[name];await saveUsers(upd);setModal(null);showToast(`${name}'s entry deleted`);
  }

  function setGroupPick(id,val){
    const m=GROUP_MATCHES.find(x=>x.id===id);
    if(m&&matchIsOpen(m.kickoffUtc))setGroupPreds(p=>({...p,[id]:val}));
  }
  function setKOPick(mid,team){
    const m=KO_DEF.find(x=>x.id===mid);
    if(m&&matchIsOpen(m.kickoffUtc))setUserKOW(p=>({...p,[`w_${mid}`]:team}));
  }

  function handleFeelingLucky(){
    const rand=arr=>arr[Math.floor(Math.random()*arr.length)];
    if(phase===2){
      const n={...userKOW};
      KO_STAGE_ORDER.forEach(stage=>{
        KO_DEF.filter(m=>m.stage===stage&&matchIsOpen(m.kickoffUtc)).forEach(m=>{
          if(!n[`w_${m.id}`]){
            const h=resolveTeam(m.homeSlot,realStandings,resultB3,n);
            const a=resolveTeam(m.awaySlot,realStandings,resultB3,n);
            const opts=[h,a].filter(Boolean);
            if(opts.length>0)n[`w_${m.id}`]=rand(opts);
          }
        });
      });
      setUserKOW(n);showToast("🍀 Bracket picks filled! Review and save.");
    }else{
      const n={...groupPreds};
      GROUP_MATCHES.filter(m=>matchIsOpen(m.kickoffUtc)).forEach(m=>{
        if(!n[m.id])n[m.id]=rand(["home","draw","away"]);
      });
      setGroupPreds(n);showToast("🍀 Group picks filled! Review and save.");
    }
  }

  if(loading)return<div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{fontSize:40}}>⚽</div><div style={{color:"#6b7280",fontSize:14}}>Loading...</div></div>;

  return(
    <div style={S.page}>
      {toast&&<div style={S.toast}>{toast}</div>}
      {modal&&(
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{fontSize:32,marginBottom:12}}>{modal.icon||"⚠️"}</div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{modal.title}</div>
            <div style={{fontSize:13,color:"#6b7280",marginBottom:20,lineHeight:1.5}}>{modal.message}</div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,...S.btnQ,flex:1}} onClick={()=>setModal(null)}>Cancel</button>
              <button style={{...S.btn,...(modal.danger?S.btnR:S.btnP),flex:1}} onClick={()=>{modal.onConfirm();setModal(null);}}>{modal.confirmLabel||"Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {view==="home"&&<HomeScreen nameInput={nameInput} setNameInput={setNameInput} onSubmit={handleNameSubmit} phase={phase} bracketOpen={bracketOpen} bonusLocked={bonusLocked} bracketDeadline={bracketDeadline} bonusDeadline={new Date(BONUS_DEADLINE_UTC)} count={Object.keys(allUsers).length} onLB={()=>setView("leaderboard")} onRules={()=>setView("rules")} regLocked={settings.registrationLocked} now={now}/>}

      {view==="rules"&&<RulesScreen onBack={()=>setView("home")}/>}

      {view==="pin"&&<PinScreen name={nameInput.trim()} step={pinStep} pinDigits={pinDigits} setPinDigits={setPinDigits} confirmDigits={confirmDigits} setConfirmDigits={setConfirmDigits} pinError={pinError} setPinError={setPinError} onEnter={handlePinEnter} onSet={handlePinSet} onBack={()=>{setView("home");setPinDigits(["","","",""]);setConfirmDigits(["","","",""]);setPinError("");}}/>}

      {view==="adminLogin"&&(
        <div style={{...S.wrapN,paddingTop:"3rem"}}>
          <div style={S.card}>
            <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
              <div style={{fontSize:36,marginBottom:8}}>🔐</div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>Admin access</div>
            </div>
            <input type="password" style={{...S.inp,marginBottom:10}} value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(adminPw===ADMIN_PW){setView("admin");setAdminErr(false);}else setAdminErr(true);}}} placeholder="Password..." autoFocus/>
            {adminErr&&<div style={{...S.aR,marginBottom:10}}>Incorrect password</div>}
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,...S.btnQ,flex:1}} onClick={()=>{setView("home");setAdminPw("");setAdminErr(false);}}>← Back</button>
              <button style={{...S.btn,...S.btnP,flex:1}} onClick={()=>{if(adminPw===ADMIN_PW){setView("admin");setAdminErr(false);}else setAdminErr(true);}}>Login</button>
            </div>
          </div>
        </div>
      )}

      {view==="admin"&&<AdminPanel resultGrp={resultGrp} resultB3={resultB3} resultKOW={resultKOW} resultBonus={resultBonus} settings={settings} allUsers={allUsers} leaderboard={leaderboard} onSaveResults={saveResults} onSaveSettings={saveSetting} onDeleteUser={name=>setModal({icon:"🗑️",title:"Delete entry?",message:`Permanently deletes ${name}'s picks and PIN. They'll need to re-register.`,danger:true,confirmLabel:"Delete",onConfirm:()=>handleDeleteUser(name)})} onBack={()=>setView("home")} showToast={showToast} setModal={setModal}/>}

      {view==="leaderboard"&&<LeaderboardScreen leaderboard={leaderboard} onBack={()=>setView(username?"predict":"home")} count={Object.keys(allUsers).length} resultBonus={resultBonus}/>}

      {view==="predict"&&(
        <>
          <div style={S.hdr}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={S.avatar}>{username[0].toUpperCase()}</div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{username}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>
                  {calcScore({groupPreds,userKOW,bonusChampion,bonusRunner},resultGrp,resultKOW,resultBonus).total} pts total
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button style={{...S.btn,...S.btnQ,...S.btnSm}} onClick={()=>setView("leaderboard")}>Board</button>
              <button style={{...S.btn,...S.btnY,...S.btnSm}} onClick={handleFeelingLucky}>🍀 Lucky</button>
              <button style={{...S.btn,...(saved?S.btnG:S.btnP),...S.btnSm}} onClick={handleSave}>{saved?"✓ Saved":"Save"}</button>
              <button style={{...S.btn,...S.btnQ,...S.btnSm}} onClick={()=>{setView("home");setUsername("");setNameInput("");}}>Exit</button>
            </div>
          </div>
          <div style={S.pbarWrap}>
            <div style={{...S.pbar,width:`${Math.min(100,Math.round((Object.keys(groupPreds).length+Object.keys(userKOW).length)/(72+KO_DEF.length)*100))}%`}}/>
          </div>

          <div style={S.navBar}>
            {[["predictions","My Predictions"],["standings","Predicted Standings"],["leaderboard_tab","Leaderboard"],["rules_tab","How to Play"]].map(([t,l])=>(
              <button key={t} style={{...S.navTab,...(mainTab===t?S.navOn:{})}} onClick={()=>{setMainTab(t);if(t==="leaderboard_tab")setView("leaderboard");if(t==="rules_tab")setView("rules");}}>{l}</button>
            ))}
          </div>

          {mainTab==="predictions"&&(
            <div style={S.subNav}>
              <button style={{...S.subTab,...(subTab==="group"?S.subOn:{})}} onClick={()=>setSubTab("group")}>Group Stage</button>
              <button style={{...S.subTab,...(subTab==="bonus"?S.subOn:{})}} onClick={()=>setSubTab("bonus")}>🏅 Bonus Picks</button>
              {(phase===2||phase===0)&&<button style={{...S.subTab,...(subTab==="bracket"?S.subOn:{})}} onClick={()=>setSubTab("bracket")}>Bracket (R32→Final)</button>}
            </div>
          )}

          <div style={S.wrap}>
            {mainTab==="predictions"&&subTab==="group"&&<GroupStageTab groupPreds={groupPreds} onPick={setGroupPick} resultGrp={resultGrp} matchIsOpen={matchIsOpen} now={now}/>}
            {mainTab==="predictions"&&subTab==="bonus"&&<BonusTab bonusChampion={bonusChampion} setBonusChampion={setBonusChampion} bonusRunner={bonusRunner} setBonusRunner={setBonusRunner} bonusLocked={bonusLocked} bonusDeadline={new Date(BONUS_DEADLINE_UTC)} resultBonus={resultBonus}/>}
            {mainTab==="predictions"&&subTab==="bracket"&&phase!==1&&<BracketTab koMatches={koMatches} userKOW={userKOW} setKOPick={setKOPick} resultKOW={resultKOW} matchIsOpen={matchIsOpen}/>}
            {mainTab==="standings"&&<StandingsTab standings={userStandings} groupPreds={groupPreds}/>}
          </div>
        </>
      )}
    </div>
  );
}


// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({nameInput,setNameInput,onSubmit,phase,bracketOpen,bonusLocked,bracketDeadline,bonusDeadline,count,onLB,onRules,regLocked,now}){
  const nextKickoff = GROUP_MATCHES.find(m=>now<new Date(m.kickoffUtc));
  return(
    <>
      <div style={S.hero}>
        <div style={{fontSize:44,marginBottom:10}}>⚽</div>
        <div style={{fontSize:22,fontWeight:700,color:"#111827",letterSpacing:-0.3}}>World Cup 2026 Prediction Challenge</div>
        <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>FIFA World Cup 2026 · All times in Malaysia Time (MYT)</div>
        <div style={{display:"flex",borderTop:"1px solid #f3f4f6",marginTop:"1.5rem"}}>
          {[["104","Matches"],["48","Nations"],["3","Hosts"],[count||"0","Players"]].map(([v,l],i)=>(
            <div key={l} style={{flex:1,padding:"12px 8px",textAlign:"center",borderRight:i<3?"1px solid #f3f4f6":"none"}}>
              <div style={{fontSize:20,fontWeight:700}}>{v}</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:2,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{...S.wrapN,paddingTop:"1.5rem"}}>
        <div style={S.card}>
          <div style={S.cardTitle}>Prediction status</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>⚽ Group Stage picks</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{nextKickoff?`Next kickoff: ${nextKickoff.date} ${nextKickoff.time} MYT`:"All group matches kicked off"}</div>
              </div>
              <span style={S.phaseTag(phase===1||phase===2)}>{phase===1||phase===2?"OPEN":"CLOSED"}</span>
            </div>
            <div style={{height:1,background:"#f3f4f6"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>🏅 Champion & Runner-up bonus</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>Locks at first kickoff: {fmtMYT(BONUS_DEADLINE_UTC)}</div>
              </div>
              <span style={S.phaseTag(!bonusLocked)}>{bonusLocked?"LOCKED":"OPEN"}</span>
            </div>
            <div style={{height:1,background:"#f3f4f6"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>🏆 Bracket picks (R32 → Final)</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>Closes: {fmtMYT(bracketDeadline.toISOString())}</div>
              </div>
              <span style={S.phaseTag(bracketOpen)}>{bracketOpen?"OPEN":"CLOSED"}</span>
            </div>
          </div>
        </div>
        {regLocked&&<div style={S.aY}>🔒 Registration is closed. Contact the admin.</div>}
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:10}}>Enter your name to play</div>
          <input style={{...S.inp,marginBottom:10}} value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSubmit()} placeholder='Your name — or "admin" for admin panel' autoFocus/>
          <button style={{...S.btn,...S.btnP,...S.btnFull}} onClick={onSubmit}>{phase===0?"View my predictions":phase===2?"Enter bracket picks →":"Enter picks →"}</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <button style={{...S.btn,...S.btnQ,flex:1}} onClick={onLB}>View Leaderboard</button>
          <button style={{...S.btn,...S.btnQ,flex:1}} onClick={onRules}>How to Play</button>
        </div>
      </div>
    </>
  );
}

// ─── RULES SCREEN ─────────────────────────────────────────────────────────────
function RulesScreen({onBack}){
  const Section=({title,children})=>(
    <div style={{...S.card,marginBottom:12}}>
      <div style={S.cardTitle}>{title}</div>
      {children}
    </div>
  );
  const Row=({label,value,sub,bold})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
      <div><div style={{fontSize:13,color:"#374151",fontWeight:bold?600:400}}>{label}</div>{sub&&<div style={{fontSize:11,color:"#6b7280",marginTop:1}}>{sub}</div>}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#2563eb",flexShrink:0,marginLeft:12}}>{value}</div>
    </div>
  );
  return(
    <>
      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <button style={{...S.btn,...S.btnQ,...S.btnSm}} onClick={onBack}>← Back</button>
          <div style={{fontWeight:700,fontSize:14}}>How to Play</div>
        </div>
      </div>
      <div style={S.wrap}>
        <div style={{paddingTop:"1rem"}}>
          <div style={{...S.aB,marginBottom:16,fontSize:14,fontWeight:500}}>
            Pick smart, stay engaged through every round, and may the best bracket win. No buy-in — this is a credits-based prediction game.
          </div>

          <Section title="Stage 1 — Group Stage Picks">
            <div style={{fontSize:13,color:"#6b7280",marginBottom:10,lineHeight:1.6}}>
              72 matches across 12 groups. For every match, pick the outcome: <strong>Win, Draw, or Loss</strong>. No scoreline needed. Each match locks individually at its own kickoff time — so you can update picks right up until the whistle blows.
            </div>
            <Row label="Correct W/D/L pick" value="3 pts"/>
            <Row label="Draw bonus" value="+2 pts" sub="Extra reward for correctly calling a draw — the hardest outcome to predict"/>
            <Row label="Maximum possible" value="~250 pts" sub="216 base + draw bonuses" bold/>
          </Section>

          <Section title="Stage 2 — Knockout Picks">
            <div style={{fontSize:13,color:"#6b7280",marginBottom:10,lineHeight:1.6}}>
              Pick the winner of every knockout match from R32 through to the Final. Admin opens bracket picks after the group stage ends. Each match locks at its own kickoff — update bracket picks right up until then.
            </div>
            <Row label="Round of 32 (×16)" value="5 pts each"/>
            <Row label="Round of 16 (×8)" value="10 pts each"/>
            <Row label="Quarterfinals (×4)" value="20 pts each"/>
            <Row label="Semifinals (×2)" value="35 pts each"/>
            <Row label="3rd place play-off (×1)" value="25 pts"/>
            <Row label="Final (×1)" value="60 pts"/>
            <Row label="Maximum possible" value="395 pts" bold/>
          </Section>

          <Section title="Stage 3 — Pre-Tournament Bonus Picks">
            <div style={{fontSize:13,color:"#6b7280",marginBottom:10,lineHeight:1.6}}>
              Lock in before the opening match kicks off. <strong>These cannot be changed once the tournament starts.</strong> High risk, high reward — pick the team you think lifts the trophy and the team you think finishes as runner-up.
            </div>
            <Row label="Correct Champion pick" value="+40 pts"/>
            <Row label="Correct Runner-up pick" value="+20 pts"/>
            <Row label="Maximum possible" value="60 pts" bold/>
          </Section>

          <Section title="Total Possible Score">
            <Row label="Group Stage picks" value="~250 pts"/>
            <Row label="Knockout picks" value="395 pts"/>
            <Row label="Bonus picks" value="60 pts"/>
            <Row label="Theoretical maximum" value="~705 pts" bold/>
            <div style={{fontSize:12,color:"#9ca3af",marginTop:8,fontStyle:"italic"}}>Top finishers typically land between 350–450 pts. Nobody hits the ceiling — that's the point.</div>
          </Section>

          <Section title="Tiebreakers">
            <div style={{fontSize:13,color:"#374151",lineHeight:1.7}}>
              If two players finish on equal total points, ties are broken in this order:
            </div>
            <ol style={{paddingLeft:20,marginTop:8,fontSize:13,color:"#374151",lineHeight:2}}>
              <li>Highest knockout stage score (Stage 2 only)</li>
              <li>Correct Champion bonus pick</li>
              <li>Correct Runner-up bonus pick</li>
              <li>Coin flip — winner picks heads or tails</li>
            </ol>
          </Section>

          <Section title="Rules & Admin">
            {[
              ["Picks lock at kickoff","Each match locks individually the moment it kicks off. You can still update other matches that haven't started yet."],
              ["Bonus picks lock early","Champion and Runner-up picks lock at the first match kickoff and cannot be changed after."],
              ["Results count as-is","For knockout matches decided by extra time or penalties, the team that progresses counts as the winner."],
              ["Admin is final","The pool administrator's scoring is final. Disputes resolved by the admin."],
            ].map(([t,d])=>(
              <div key={t} style={{marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:"#111827"}}>{t}</div>
                <div style={{fontSize:12,color:"#6b7280",marginTop:2,lineHeight:1.5}}>{d}</div>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </>
  );
}

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({name,step,pinDigits,setPinDigits,confirmDigits,setConfirmDigits,pinError,setPinError,onEnter,onSet,onBack}){
  function handleDigit(val,idx,isConf){
    if(!/^\d*$/.test(val))return;
    const arr=isConf?[...confirmDigits]:[...pinDigits];
    arr[idx]=val.slice(-1);
    isConf?setConfirmDigits(arr):setPinDigits(arr);
    if(val&&idx<3){document.querySelector(`[data-pin="${isConf?"c":"p"}${idx+1}"]`)?.focus();}
  }
  function handleKey(e,idx,isConf){
    if(e.key==="Backspace"){
      const arr=isConf?[...confirmDigits]:[...pinDigits];
      if(!arr[idx]&&idx>0){document.querySelector(`[data-pin="${isConf?"c":"p"}${idx-1}"]`)?.focus();}
      arr[idx]="";isConf?setConfirmDigits(arr):setPinDigits(arr);
    }
    if(e.key==="Enter"){step==="enter"?onEnter():onSet();}
  }
  const pinRow=(arr,prefix,af)=>(
    <div style={{display:"flex",gap:10,justifyContent:"center",margin:"10px 0"}}>
      {[0,1,2,3].map(i=>(
        <input key={i} data-pin={`${prefix}${i}`} type="password" inputMode="numeric" maxLength={1} value={arr[i]||""} onChange={e=>handleDigit(e.target.value,i,prefix==="c")} onKeyDown={e=>handleKey(e,i,prefix==="c")} autoFocus={af&&i===0} style={{width:48,height:56,textAlign:"center",fontSize:22,fontWeight:700,border:"1.5px solid #d1d5db",borderRadius:8,outline:"none",background:"#f9fafb",color:"#111827",fontFamily:"inherit"}}/>
      ))}
    </div>
  );
  return(
    <div style={{...S.wrapN,paddingTop:"3rem"}}>
      <div style={S.card}>
        <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
          <div style={{fontSize:36,marginBottom:8}}>{step==="enter"?"🔑":"🔒"}</div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{step==="enter"?`Welcome back, ${name}!`:`Create your PIN, ${name}!`}</div>
          <div style={{fontSize:13,color:"#6b7280"}}>{step==="enter"?"Enter your 4-digit PIN to continue":"Set a 4-digit PIN to secure your predictions"}</div>
        </div>
        <div style={{fontSize:12,color:"#374151",fontWeight:600,textAlign:"center"}}>{step==="enter"?"Your PIN":"Choose a PIN"}</div>
        {pinRow(pinDigits,"p",true)}
        {step==="set"&&<><div style={{fontSize:12,color:"#374151",fontWeight:600,marginTop:8,textAlign:"center"}}>Confirm PIN</div>{pinRow(confirmDigits,"c",false)}</>}
        {pinError&&<div style={{...S.aR,textAlign:"center",marginBottom:8}}>{pinError}</div>}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button style={{...S.btn,...S.btnQ,flex:1}} onClick={onBack}>← Back</button>
          <button style={{...S.btn,...S.btnP,flex:1}} onClick={step==="enter"?onEnter:onSet}>{step==="enter"?"Enter →":"Set PIN & continue"}</button>
        </div>
        <div style={{marginTop:10,fontSize:11,color:"#9ca3af",textAlign:"center"}}>{step==="enter"?"Forgot your PIN? Ask admin to delete your entry and re-register.":"Remember this PIN — no recovery option."}</div>
      </div>
    </div>
  );
}

// ─── BONUS PICKS TAB ──────────────────────────────────────────────────────────
function BonusTab({bonusChampion,setBonusChampion,bonusRunner,setBonusRunner,bonusLocked,bonusDeadline,resultBonus}){
  const champCorrect=bonusChampion&&resultBonus.champion&&bonusChampion===resultBonus.champion;
  const runnerCorrect=bonusRunner&&resultBonus.runner&&bonusRunner===resultBonus.runner;
  return(
    <div style={{paddingTop:"1rem"}}>
      <div style={S.aP}>
        🏅 These picks lock permanently at the first kickoff — <strong>{fmtMYT(bonusDeadline.toISOString())}</strong>. Choose wisely — they reward players who read the full tournament narrative.
      </div>
      {bonusLocked&&<div style={S.aY}>🔒 Bonus picks are locked. Viewing your selections only.</div>}

      {/* Champion */}
      <div style={{...S.card,border:`1px solid ${champCorrect?"#86efac":bonusChampion?"#bfdbfe":"#e5e7eb"}`,background:champCorrect?"#f0fdf4":"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>🥇 Champion</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>Pick the team that lifts the trophy · <strong>+40 pts</strong> if correct</div>
          </div>
          {champCorrect&&<span style={{fontSize:12,fontWeight:700,color:"#15803d",background:"#dcfce7",padding:"3px 9px",borderRadius:8}}>✓ Correct! +40 pts</span>}
        </div>
        {!bonusLocked?(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {bonusChampion&&<Flag team={bonusChampion} size={26}/>}
            <select style={S.sel} value={bonusChampion} onChange={e=>setBonusChampion(e.target.value)}>
              <option value="">— Select a team —</option>
              {ALL_TEAMS.map(t=><option key={t} value={t}>{EMOJI_F[t]||"⚽"} {t}</option>)}
            </select>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {bonusChampion?<><Flag team={bonusChampion} size={28}/><span style={{fontSize:14,fontWeight:600,color:"#111827"}}>{bonusChampion}</span></>:<span style={{fontSize:13,color:"#9ca3af"}}>No pick made</span>}
          </div>
        )}
      </div>

      {/* Runner-up */}
      <div style={{...S.card,border:`1px solid ${runnerCorrect?"#86efac":bonusRunner?"#bfdbfe":"#e5e7eb"}`,background:runnerCorrect?"#f0fdf4":"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>🥈 Runner-up</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:1}}>Pick the losing finalist · <strong>+20 pts</strong> if correct</div>
          </div>
          {runnerCorrect&&<span style={{fontSize:12,fontWeight:700,color:"#15803d",background:"#dcfce7",padding:"3px 9px",borderRadius:8}}>✓ Correct! +20 pts</span>}
        </div>
        {!bonusLocked?(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {bonusRunner&&<Flag team={bonusRunner} size={26}/>}
            <select style={S.sel} value={bonusRunner} onChange={e=>setBonusRunner(e.target.value)}>
              <option value="">— Select a team —</option>
              {ALL_TEAMS.filter(t=>t!==bonusChampion).map(t=><option key={t} value={t}>{EMOJI_F[t]||"⚽"} {t}</option>)}
            </select>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {bonusRunner?<><Flag team={bonusRunner} size={28}/><span style={{fontSize:14,fontWeight:600,color:"#111827"}}>{bonusRunner}</span></>:<span style={{fontSize:13,color:"#9ca3af"}}>No pick made</span>}
          </div>
        )}
      </div>

      <div style={{...S.cardSm,background:"#f9fafb"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:6}}>Note</div>
        <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>
          These are separate from your bracket Final pick (Match 104). Your bracket pick for the Final remains editable until that match kicks off on Jul 19.
        </div>
      </div>
    </div>
  );
}


// ─── GROUP STAGE TAB ──────────────────────────────────────────────────────────
function GroupStageTab({groupPreds,onPick,resultGrp,matchIsOpen,now}){
  const [activeGrp,setActiveGrp]=useState("A");
  const matches=GROUP_MATCHES.filter(m=>m.grp===activeGrp);
  const done=GROUP_MATCHES.filter(m=>groupPreds[m.id]).length;
  return(
    <div style={{paddingTop:"1rem"}}>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"1rem"}}>
        {GROUPS.map(g=>{
          const gD=GROUP_MATCHES.filter(m=>m.grp===g&&groupPreds[m.id]).length;
          const gT=GROUP_MATCHES.filter(m=>m.grp===g).length;
          const ok=gD===gT;
          return<button key={g} onClick={()=>setActiveGrp(g)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${activeGrp===g?"#2563eb":ok?"#86efac":"#e5e7eb"}`,background:activeGrp===g?"#2563eb":ok?"#f0fdf4":"#fff",color:activeGrp===g?"#fff":ok?"#15803d":"#374151",cursor:"pointer"}}>{g} {ok?"✓":`${gD}/${gT}`}</button>;
        })}
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:"0.75rem"}}>{done}/72 group picks made · Each match locks at its own kickoff</div>
      {matches.map(m=><GroupCard key={m.id} match={m} pick={groupPreds[m.id]} result={resultGrp[m.id]} onPick={v=>onPick(m.id,v)} isOpen={matchIsOpen(m.kickoffUtc)}/>)}
    </div>
  );
}

function GroupCard({match,pick,result,onPick,isOpen}){
  const ok=pick&&result&&pick===result,bad=pick&&result&&pick!==result;
  const isDraw=result==="draw";
  const pts=ok?(3+(isDraw?2:0)):0;
  const rt=r=>r==="home"?match.home:r==="away"?match.away:"Draw";
  const sh=t=>t&&t.length>12?t.split(" ")[0]:t;
  return(
    <div style={{background:ok?"#f0fdf4":bad?"#fff5f5":"#fff",border:`1px solid ${ok?"#86efac":bad?"#fca5a5":result?"#fde68a":isOpen?"#e5e7eb":"#f3f4f6"}`,borderRadius:10,marginBottom:8,overflow:"hidden",opacity:isOpen?1:0.92}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 12px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6"}}>
        <span style={{fontSize:10,fontWeight:600,color:"#6b7280",textTransform:"uppercase"}}>Group {match.grp}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isOpen&&<span style={{fontSize:10,color:"#b91c1c",fontWeight:600}}>🔒 Locked</span>}
          <span style={{fontSize:11,color:"#9ca3af"}}>{match.time} MYT · {match.venue}</span>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 36px 1fr",alignItems:"center",gap:6,marginBottom:10}}>
          {[match.home,null,match.away].map((t,i)=>i===1?<div key={i} style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#d1d5db"}}>vs</div>:<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><Flag team={t} size={26}/><div style={{fontSize:12,fontWeight:600,color:"#111827",textAlign:"center"}}>{t}</div></div>)}
        </div>
        {isOpen&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
            {[["home",sh(match.home),"#eff6ff","#bfdbfe","#1d4ed8"],["draw","Draw","#fffbeb","#fde68a","#92400e"],["away",sh(match.away),"#f5f3ff","#ddd6fe","#6d28d9"]].map(([val,lbl,bg,bdr,col])=>(
              <button key={val} onClick={()=>onPick(val)} style={{padding:"7px 4px",borderRadius:7,border:`1px solid ${pick===val?bdr:"#e5e7eb"}`,background:pick===val?bg:"#f9fafb",color:pick===val?col:"#6b7280",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"center"}}>
                {pick===val?"✓ ":""}{lbl}
              </button>
            ))}
          </div>
        )}
        {!isOpen&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#6b7280"}}>Your pick: <strong style={{color:"#111827"}}>{pick?rt(pick):"—"}</strong></span>{result&&pick&&<span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:ok?"#dcfce7":"#fee2e2",color:ok?"#15803d":"#b91c1c"}}>{ok?`✓ +${pts} pts`:"✗ 0 pts"}</span>}</div>}
        {result&&<div style={{fontSize:10,color:"#9ca3af",marginTop:5}}>Result: {rt(result)}{result!=="draw"?" win":""}{isDraw?" (+2 draw bonus available)":""}</div>}
      </div>
    </div>
  );
}

// ─── BRACKET TAB ──────────────────────────────────────────────────────────────
function BracketTab({koMatches,userKOW,setKOPick,resultKOW,matchIsOpen}){
  const [activeStage,setActiveStage]=useState("R32");
  const stageMatches=koMatches.filter(m=>m.stage===activeStage);
  const stageDone=s=>koMatches.filter(m=>m.stage===s&&userKOW[`w_${m.id}`]).length;
  const stageTotal=s=>KO_DEF.filter(m=>m.stage===s).length;
  return(
    <div style={{paddingTop:"1rem"}}>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:"0.75rem"}}>Each match locks at its own kickoff. Update picks right up until then.</div>
      {activeStage==="3P"&&<div style={{...S.aB,marginBottom:10}}>3rd place winner: <strong>+25 pts</strong> if correct.</div>}
      {activeStage==="F"&&<div style={{...S.aP,marginBottom:10}}>Final winner: <strong>+60 pts</strong> if correct. This is separate from your Champion bonus pick.</div>}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"1rem"}}>
        {KO_STAGE_ORDER.map(s=>{
          const done=stageDone(s),total=stageTotal(s),ok=done===total&&total>0;
          return<button key={s} onClick={()=>setActiveStage(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${activeStage===s?STAGE_COL[s]:ok?"#86efac":"#e5e7eb"}`,background:activeStage===s?STAGE_COL[s]:ok?"#f0fdf4":"#fff",color:activeStage===s?"#fff":ok?"#15803d":"#374151",cursor:"pointer"}}>{STAGE_LABEL[s]} {ok?"✓":`${done}/${total}`}</button>;
        })}
      </div>
      {stageMatches.map(m=><KOMatchCard key={m.id} match={m} userKOW={userKOW} setKOPick={setKOPick} resultKOW={resultKOW} isOpen={matchIsOpen(m.kickoffUtc)}/>)}
      <div style={{marginTop:"1.5rem"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:8}}>Bracket overview</div>
        <div style={{overflowX:"auto",paddingBottom:"0.5rem"}}><BracketVisual koMatches={koMatches} userKOW={userKOW} setKOPick={setKOPick} resultKOW={resultKOW} matchIsOpen={matchIsOpen}/></div>
      </div>
    </div>
  );
}

function KOMatchCard({match,userKOW,setKOPick,resultKOW,isOpen}){
  const winner=userKOW[`w_${match.id}`];
  const actualW=resultKOW[`w_${match.id}`];
  const ok=winner&&actualW&&winner===actualW,bad=winner&&actualW&&winner!==actualW;
  const pts=KO_PTS[match.stage]||0;
  const canPick=isOpen&&match.home&&match.away;
  return(
    <div style={{background:ok?"#f0fdf4":bad?"#fff5f5":"#fff",border:`1px solid ${ok?"#86efac":bad?"#fca5a5":winner?"#bfdbfe":isOpen?"#e5e7eb":"#f3f4f6"}`,borderRadius:10,marginBottom:8,overflow:"hidden",opacity:isOpen||winner?1:0.9}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 12px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,fontWeight:600,color:STAGE_COL[match.stage]||"#6b7280",textTransform:"uppercase"}}>{STAGE_LABEL[match.stage]} · M{match.id}</span>
          <span style={{fontSize:10,fontWeight:700,color:"#2563eb",background:"#eff6ff",padding:"1px 6px",borderRadius:8}}>{pts} pts</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isOpen&&match.home&&<span style={{fontSize:10,color:"#b91c1c",fontWeight:600}}>🔒 Locked</span>}
          <span style={{fontSize:11,color:"#9ca3af"}}>{match.time} MYT · {match.venue}</span>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        {match.home&&match.away?(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 36px 1fr",alignItems:"center",gap:6,marginBottom:10}}>
              {[match.home,null,match.away].map((t,i)=>i===1?<div key={i} style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#d1d5db"}}>vs</div>:<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><Flag team={t} size={24}/><div style={{fontSize:12,fontWeight:600,color:"#111827",textAlign:"center"}}>{t}</div></div>)}
            </div>
            {canPick&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[match.home,match.away].map(team=>{
                  const isSel=winner===team;
                  return<button key={team} onClick={()=>setKOPick(match.id,team)} style={{padding:"7px 8px",borderRadius:7,border:`1px solid ${isSel?"#bfdbfe":"#e5e7eb"}`,background:isSel?"#eff6ff":"#f9fafb",color:isSel?"#1d4ed8":"#6b7280",fontSize:12,fontWeight:isSel?600:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Flag team={team} size={14}/>{isSel?"✓ ":""}{team.length>13?team.split(" ")[0]:team}</button>;
                })}
              </div>
            )}
            {!canPick&&winner&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#6b7280"}}>Your pick: <strong style={{color:"#111827"}}>{winner}</strong></span>{actualW&&<span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:ok?"#dcfce7":"#fee2e2",color:ok?"#15803d":"#b91c1c"}}>{ok?`✓ +${pts} pts`:"✗ 0 pts"}</span>}</div>}
            {!canPick&&!winner&&match.home&&<div style={{fontSize:12,color:"#9ca3af",textAlign:"center"}}>No pick made — match is locked</div>}
            {actualW&&<div style={{fontSize:10,color:"#9ca3af",marginTop:5}}>Result: {actualW} win</div>}
          </>
        ):<div style={{fontSize:12,color:"#9ca3af",textAlign:"center",padding:"8px 0"}}>Teams TBD — pick earlier rounds first</div>}
      </div>
    </div>
  );
}

function BracketVisual({koMatches,userKOW,setKOPick,resultKOW,matchIsOpen}){
  const byStage={};
  koMatches.filter(m=>m.stage!=="3P").forEach(m=>{if(!byStage[m.stage])byStage[m.stage]=[];byStage[m.stage].push(m);});
  const STAGES_VIS=["R32","R16","QF","SF","F"];
  const MH={R32:52,R16:104,QF:208,SF:416,F:832};
  const TOTAL=16*52;
  return(
    <div style={{display:"flex",gap:2,minWidth:STAGES_VIS.length*134}}>
      {STAGES_VIS.map(stage=>{
        const matches=byStage[stage]||[];const mh=MH[stage]||52;
        return(
          <div key={stage} style={{width:130}}>
            <div style={{fontSize:9,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.8px",textAlign:"center",paddingBottom:6}}>{STAGE_LABEL[stage]}</div>
            <div style={{height:TOTAL,display:"flex",flexDirection:"column"}}>
              {matches.map(m=>{
                const w=userKOW[`w_${m.id}`],aW=resultKOW[`w_${m.id}`],open=matchIsOpen(m.kickoffUtc);
                return(
                  <div key={m.id} style={{height:mh,display:"flex",alignItems:"center",flexShrink:0}}>
                    <div style={{width:"100%",background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,overflow:"hidden",margin:"0 1px"}}>
                      <div style={{fontSize:8,color:"#9ca3af",padding:"2px 5px",borderBottom:"1px solid #f3f4f6",background:"#f9fafb"}}>{m.time}{!open&&m.home?" 🔒":""}</div>
                      {[m.home,m.away].map((team,ti)=>{
                        const isW=w===team,isL=w&&w!==team,correct=aW&&w&&w===aW,wrong=aW&&w&&w!==aW;
                        return(
                          <div key={ti} onClick={()=>open&&team&&setKOPick(m.id,team)} style={{display:"flex",alignItems:"center",gap:3,padding:"4px 5px",borderBottom:ti===0?"1px solid #f3f4f6":"none",background:isW?(correct?"#f0fdf4":wrong?"#fff5f5":"#eff6ff"):"transparent",cursor:(open&&team)?"pointer":"default",opacity:isL?0.4:1,transition:"background 0.1s"}}>
                            {team?<Flag team={team} size={13}/>:<div style={{width:19,height:13,background:"#f3f4f6",borderRadius:2}}/>}
                            <span style={{fontSize:9,fontWeight:isW?600:400,color:isW?"#1d4ed8":team?"#111827":"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{team?(team.length>10?team.split(" ")[0]:team):"TBD"}</span>
                            {isW&&<span style={{fontSize:8,color:correct?"#15803d":wrong?"#b91c1c":"#2563eb"}}>{correct?"✓":wrong?"✗":"·"}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STANDINGS TAB ────────────────────────────────────────────────────────────
function StandingsTab({standings,groupPreds}){
  const done=GROUP_MATCHES.filter(m=>groupPreds[m.id]).length;
  return(
    <div style={{paddingTop:"1rem"}}>
      {done<72&&<div style={S.aY}>{72-done} group matches still unpicked — standings are partial.</div>}
      <div style={{fontSize:12,color:"#6b7280",marginBottom:"1rem"}}>Your predicted group standings. Green rows advance to Round of 32.</div>
      {GROUPS.map(g=>{
        const table=standings[g];if(!table||table.length===0)return null;
        return(
          <div key={g} style={{...S.cardSm,marginBottom:10}}>
            <div style={S.cardTitle}>Group {g}</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr><th style={S.th}>Team</th><th style={{...S.th,textAlign:"center"}}>P</th><th style={{...S.th,textAlign:"center"}}>W</th><th style={{...S.th,textAlign:"center"}}>D</th><th style={{...S.th,textAlign:"center"}}>L</th><th style={{...S.th,textAlign:"center"}}>GD</th><th style={{...S.th,textAlign:"center"}}>Pts</th></tr></thead>
              <tbody>
                {table.map((t,i)=>(
                  <tr key={t.team} style={{background:i<2?"#f0fdf4":"transparent"}}>
                    <td style={{...S.td,fontWeight:i<2?600:400}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {i<2&&<span style={{fontSize:10,color:"#15803d",fontWeight:700}}>→</span>}
                        <Flag team={t.team} size={14}/>
                        <span style={{color:i<2?"#15803d":i===2?"#6b7280":"#374151"}}>{t.team}</span>
                        {i===2&&<span style={{fontSize:10,color:"#6b7280",marginLeft:2}}>(3rd)</span>}
                      </div>
                    </td>
                    <td style={{...S.td,textAlign:"center"}}>{t.p}</td><td style={{...S.td,textAlign:"center"}}>{t.w}</td><td style={{...S.td,textAlign:"center"}}>{t.d}</td><td style={{...S.td,textAlign:"center"}}>{t.l}</td>
                    <td style={{...S.td,textAlign:"center"}}>{t.gf-t.ga>0?"+":""}{t.gf-t.ga}</td>
                    <td style={{...S.td,textAlign:"center",fontWeight:700,color:i<2?"#15803d":i===2?"#6b7280":"#374151"}}>{t.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}


// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({resultGrp,resultB3,resultKOW,resultBonus,settings,allUsers,leaderboard,onSaveResults,onSaveSettings,onDeleteUser,onBack,showToast,setModal}){
  const [aTab,setATab]=useState("phases");
  const [activeGrp,setActiveGrp]=useState("A");
  const [activeKOStage,setActiveKOStage]=useState("R32");
  const [localSettings,setLocalSettings]=useState(settings);
  const [localB3,setLocalB3]=useState(resultB3);
  const [localKOW,setLocalKOW]=useState(resultKOW);
  const [localBonus,setLocalBonus]=useState(resultBonus);

  const adminStandings=computeStandings(resultGrp);
  const adminKOMatches=buildKO(adminStandings,localB3,localKOW);

  async function saveGrp(id,val){const r={...resultGrp,[id]:val};await onSaveResults(r,localB3,localKOW,localBonus);showToast("Result saved");}
  async function clearGrp(id){const r={...resultGrp};delete r[id];await onSaveResults(r,localB3,localKOW,localBonus);showToast("Cleared");}
  async function saveB3(key,team){const nb={...localB3,[key]:team};setLocalB3(nb);await onSaveResults(resultGrp,nb,localKOW,localBonus);showToast("Assigned");}
  async function saveKO(mid,team){const nk={...localKOW,[`w_${mid}`]:team};setLocalKOW(nk);await onSaveResults(resultGrp,localB3,nk,localBonus);showToast("Result saved");}
  async function clearKO(mid){const nk={...localKOW};delete nk[`w_${mid}`];setLocalKOW(nk);await onSaveResults(resultGrp,localB3,nk,localBonus);showToast("Cleared");}
  async function saveBonus(bonus){setLocalBonus(bonus);await onSaveResults(resultGrp,localB3,localKOW,bonus);showToast("Bonus result saved");}
  async function handleSaveSettings(){await onSaveSettings(localSettings);showToast("Settings saved");}

  async function resetBracketPicks(){
    const upd={...allUsers};
    Object.keys(upd).forEach(n=>{upd[n]={...upd[n],userKOW:{}};});
    await storageSet(K_USERS,JSON.stringify(upd));showToast("Bracket picks reset");
  }

  const grpMatches=GROUP_MATCHES.filter(m=>m.grp===activeGrp);
  const koStageMatches=adminKOMatches.filter(m=>m.stage===activeKOStage);
  const b3Ready=BEST3RD_MATCHES.every(m=>localB3[`b3_${m.awaySlot.groups.join("")}`]);
  const STAGE_LABEL_ADMIN={R32:"Round of 32",R16:"Round of 16",QF:"Quarterfinal",SF:"Semifinal","3P":"3rd Place",F:"Final"};

  return(
    <>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <button style={{...S.btn,...S.btnQ,...S.btnSm}} onClick={onBack}>← Exit</button>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>Admin Panel</div>
          <div style={{fontSize:11,color:"#6b7280"}}>{Object.keys(resultGrp).length}/72 group · {Object.keys(localKOW).length}/32 KO · {Object.keys(allUsers).length} players</div>
        </div>
      </div>
      <div style={S.navBar}>
        {[["phases","Phases"],["group","Group Results"],["b3","Best 3rd"],["knockout","Knockout"],["bonus","Bonus Results"],["standings","Standings"],["players","Players"],["settings","Settings"]].map(([t,l])=>(
          <button key={t} style={{...S.navTab,...(aTab===t?S.navOn:{})}} onClick={()=>setATab(t)}>{l}</button>
        ))}
      </div>
      <div style={S.wrap}>

        {aTab==="phases"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aB}>Bracket picks toggle controls visibility for players. Group picks lock per match automatically. Deadlines auto-close — toggle is a manual failsafe.</div>
            <div style={S.card}>
              <div style={S.cardTitle}>⚽ Group Stage</div>
              <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>Group picks lock automatically at each match's kickoff. No manual toggle needed — players can update until the whistle.</div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>🏆 Bracket Picks (R32 → Final)</div>
              {!b3Ready&&<div style={{...S.aY,marginBottom:10}}>⚠️ Assign all 8 best 3rd-place teams first before opening bracket picks.</div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500}}>Bracket picks open</div>
                  <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{localSettings.bracketOpen?"Players can make bracket picks":"Bracket is hidden from players"}</div>
                </div>
                <Toggle on={localSettings.bracketOpen} onChange={e=>setLocalSettings(s=>({...s,bracketOpen:e.target.checked}))}/>
              </div>
              <div style={{fontSize:12,fontWeight:500,marginBottom:4}}>Bracket deadline (UTC)</div>
              <input type="datetime-local" style={{...S.inp,marginBottom:6}} value={localSettings.bracketDeadline?.slice(0,16)||""} onChange={e=>setLocalSettings(s=>({...s,bracketDeadline:e.target.value+":00Z"}))}/>
              <div style={{fontSize:11,color:"#9ca3af",marginBottom:12}}>MYT: {fmtMYT(localSettings.bracketDeadline)}</div>
              <button style={{...S.btn,...S.btnO,...S.btnSm}} onClick={()=>setModal({icon:"⚠️",title:"Reset all bracket picks?",message:"Clears every player's bracket predictions. Group picks and bonus picks are unaffected.",danger:true,confirmLabel:"Reset",onConfirm:resetBracketPicks})}>Reset all bracket picks</button>
            </div>
            <button style={{...S.btn,...S.btnP,...S.btnFull}} onClick={handleSaveSettings}>Save phase settings</button>
          </div>
        )}

        {aTab==="group"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aY}>Click a result to save instantly. Green = entered.</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"1rem"}}>
              {GROUPS.map(g=>{
                const done=GROUP_MATCHES.filter(m=>m.grp===g&&resultGrp[m.id]).length;
                const total=GROUP_MATCHES.filter(m=>m.grp===g).length;
                return<button key={g} onClick={()=>setActiveGrp(g)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${activeGrp===g?"#2563eb":done===total?"#86efac":"#e5e7eb"}`,background:activeGrp===g?"#2563eb":done===total?"#f0fdf4":"#fff",color:activeGrp===g?"#fff":done===total?"#15803d":"#374151",cursor:"pointer"}}>{g} {done}/{total}</button>;
              })}
            </div>
            {grpMatches.map(m=>(
              <div key={m.id} style={S.cardSm}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:11,color:"#6b7280"}}>{m.date} · {m.time} MYT · {m.venue}</div>
                  {resultGrp[m.id]&&<button style={{...S.btn,...S.btnR,...S.btnSm}} onClick={()=>clearGrp(m.id)}>Clear</button>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <Flag team={m.home} size={18}/><span style={{fontSize:13,fontWeight:500}}>{m.home}</span>
                  <span style={{color:"#9ca3af",fontSize:12}}>vs</span>
                  <Flag team={m.away} size={18}/><span style={{fontSize:13,fontWeight:500}}>{m.away}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                  {[["home",m.home],["draw","Draw"],["away",m.away]].map(([val,lbl])=>(
                    <button key={val} onClick={()=>saveGrp(m.id,val)} style={{padding:"6px 4px",borderRadius:6,border:`1px solid ${resultGrp[m.id]===val?"#86efac":"#e5e7eb"}`,background:resultGrp[m.id]===val?"#f0fdf4":"#f9fafb",color:resultGrp[m.id]===val?"#15803d":"#6b7280",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                      {resultGrp[m.id]===val?"✓ ":""}{lbl.length>12?lbl.split(" ")[0]:lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {aTab==="b3"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aB}>Assign actual 3rd-place qualifiers after group stage. Do this before opening bracket picks.</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:"1rem"}}>{BEST3RD_MATCHES.filter(m=>localB3[`b3_${m.awaySlot.groups.join("")}`]).length}/{BEST3RD_MATCHES.length} assigned</div>
            {BEST3RD_MATCHES.map(m=>{
              const groups=m.awaySlot.groups,key=`b3_${groups.join("")}`,selected=localB3[key],myt=utcToMYT(m.kickoffUtc);
              const eligible=groups.map(g=>{const t=adminStandings[g]?.[2];return t?{...t,grp:g}:null;}).filter(Boolean);
              return(
                <div key={m.id} style={{...S.card,marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:2}}>Match {m.id} · {myt.date} · {myt.time} MYT</div>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>Best 3rd from Groups {groups.join("/")} · {m.venue}</div>
                  {eligible.length===0&&<div style={{fontSize:12,color:"#9ca3af"}}>Enter group results first.</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {eligible.map(t=>{
                      const isSel=selected===t.team;
                      return<button key={t.team} onClick={()=>saveB3(key,t.team)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,border:`1px solid ${isSel?"#86efac":"#e5e7eb"}`,background:isSel?"#f0fdf4":"#f9fafb",cursor:"pointer",textAlign:"left",width:"100%"}}>
                        <Flag team={t.team} size={22}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:isSel?600:500,color:isSel?"#15803d":"#111827"}}>{t.team}</div><div style={{fontSize:11,color:"#6b7280"}}>Group {t.grp} 3rd · {t.pts} pts</div></div>
                        {isSel&&<span style={{fontSize:11,color:"#15803d",fontWeight:600}}>✓ Assigned</span>}
                      </button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {aTab==="knockout"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aB}>Enter actual match winners. Teams populate from group results + best-3rd assignments. Points shown per round.</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:"1rem"}}>
              {KO_STAGE_ORDER.map(s=>(
                <button key={s} onClick={()=>setActiveKOStage(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${activeKOStage===s?STAGE_COL[s]:"#e5e7eb"}`,background:activeKOStage===s?STAGE_COL[s]:"#fff",color:activeKOStage===s?"#fff":"#374151",cursor:"pointer"}}>{STAGE_LABEL_ADMIN[s]} ({KO_PTS[s]}pts)</button>
              ))}
            </div>
            {koStageMatches.map(m=>{
              const aW=localKOW[`w_${m.id}`];
              return(
                <div key={m.id} style={S.cardSm}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,color:"#6b7280"}}>Match {m.id} · {m.date} · {m.time} MYT · {m.venue}</div>
                    {aW&&<button style={{...S.btn,...S.btnR,...S.btnSm}} onClick={()=>clearKO(m.id)}>Clear</button>}
                  </div>
                  {m.home&&m.away?(
                    <>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <Flag team={m.home} size={16}/><span style={{fontSize:13,fontWeight:500}}>{m.home}</span><span style={{color:"#9ca3af"}}>vs</span><Flag team={m.away} size={16}/><span style={{fontSize:13,fontWeight:500}}>{m.away}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                        {[m.home,m.away].map(team=>(
                          <button key={team} onClick={()=>saveKO(m.id,team)} style={{padding:"6px 8px",borderRadius:6,border:`1px solid ${aW===team?"#86efac":"#e5e7eb"}`,background:aW===team?"#f0fdf4":"#f9fafb",color:aW===team?"#15803d":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}>
                            <Flag team={team} size={14}/>{aW===team?"✓ ":""}{team.length>13?team.split(" ")[0]:team}
                          </button>
                        ))}
                      </div>
                    </>
                  ):<div style={{fontSize:12,color:"#9ca3af"}}>Teams TBD — enter previous round first</div>}
                </div>
              );
            })}
          </div>
        )}

        {aTab==="bonus"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aB}>Enter the actual champion and runner-up at the end of the tournament. This scores all players' pre-tournament bonus picks.</div>
            {[["champion","🥇 Actual Champion","+40 pts for correct pick","champion"],["runner","🥈 Actual Runner-up","+20 pts for correct pick","runner"]].map(([key,label,sub,field])=>(
              <div key={key} style={{...S.card,marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{label}</div>
                <div style={{fontSize:12,color:"#6b7280",marginBottom:10}}>{sub}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {localBonus[field]&&<Flag team={localBonus[field]} size={26}/>}
                  <select style={S.sel} value={localBonus[field]||""} onChange={e=>{const nb={...localBonus,[field]:e.target.value};saveBonus(nb);}}>
                    <option value="">— Not set —</option>
                    {ALL_TEAMS.map(t=><option key={t} value={t}>{EMOJI_F[t]||"⚽"} {t}</option>)}
                  </select>
                </div>
                {localBonus[field]&&<div style={{fontSize:12,color:"#15803d",marginTop:8,fontWeight:600}}>✓ Set: {localBonus[field]}</div>}
              </div>
            ))}
          </div>
        )}

        {aTab==="standings"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.aB}>Live standings from actual results.</div>
            {GROUPS.map(g=>{
              const table=adminStandings[g];if(!table||table.length===0)return<div key={g} style={{...S.cardSm,color:"#9ca3af",fontSize:12}}>Group {g} — no results yet</div>;
              return(
                <div key={g} style={{...S.cardSm,marginBottom:10}}>
                  <div style={S.cardTitle}>Group {g}</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr><th style={S.th}>Team</th><th style={{...S.th,textAlign:"center"}}>P</th><th style={{...S.th,textAlign:"center"}}>W</th><th style={{...S.th,textAlign:"center"}}>D</th><th style={{...S.th,textAlign:"center"}}>L</th><th style={{...S.th,textAlign:"center"}}>Pts</th></tr></thead>
                    <tbody>{table.map((t,i)=>(
                      <tr key={t.team} style={{background:i<2?"#f0fdf4":"transparent"}}>
                        <td style={{...S.td,fontWeight:i<2?600:400}}><div style={{display:"flex",alignItems:"center",gap:6}}>{i<2&&<span style={{fontSize:10,color:"#15803d"}}>→</span>}<Flag team={t.team} size={14}/><span style={{color:i<2?"#15803d":"#374151",fontSize:12}}>{t.team}</span></div></td>
                        <td style={{...S.td,textAlign:"center"}}>{t.p}</td><td style={{...S.td,textAlign:"center"}}>{t.w}</td><td style={{...S.td,textAlign:"center"}}>{t.d}</td><td style={{...S.td,textAlign:"center"}}>{t.l}</td>
                        <td style={{...S.td,textAlign:"center",fontWeight:700,color:i<2?"#15803d":"#374151"}}>{t.pts}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {aTab==="players"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:10}}>Players ({Object.keys(allUsers).length})</div>
            <div style={S.aY}>Deleting removes predictions AND PIN. Player must re-register.</div>
            {leaderboard.length===0&&<div style={{...S.card,textAlign:"center",color:"#9ca3af",padding:"2rem"}}>No players yet.</div>}
            {leaderboard.map((u,i)=>(
              <div key={u.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#f9fafb",borderRadius:8,marginBottom:6,border:"1px solid #f3f4f6"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={S.avatar}>{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{u.name}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{u.groupDone}/72 grp · {u.koDone}/32 KO · <strong style={{color:"#2563eb"}}>{u.total} pts</strong></div>
                  </div>
                </div>
                <button style={{...S.btn,...S.btnR,...S.btnSm}} onClick={()=>onDeleteUser(u.name)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {aTab==="settings"&&(
          <div style={{paddingTop:"1rem"}}>
            <div style={S.card}>
              <div style={S.cardTitle}>Registration</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><div style={{fontSize:14,fontWeight:500}}>Lock new registrations</div><div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{localSettings.registrationLocked?"New players cannot join":"Anyone can register"}</div></div>
                <Toggle on={localSettings.registrationLocked} onChange={e=>setLocalSettings(s=>({...s,registrationLocked:e.target.checked}))}/>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Admin password</div>
              <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6}}>Update the <code style={{background:"#f3f4f6",padding:"1px 5px",borderRadius:3,fontSize:12}}>ADMIN_PW</code> constant in App.jsx and redeploy.</div>
            </div>
            <button style={{...S.btn,...S.btnP,...S.btnFull}} onClick={handleSaveSettings}>Save settings</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardScreen({leaderboard,onBack,count,resultBonus}){
  const hasResults=leaderboard.some(u=>u.total>0);
  return(
    <>
      <div style={S.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <button style={{...S.btn,...S.btnQ,...S.btnSm}} onClick={onBack}>← Back</button>
          <div><div style={{fontWeight:700,fontSize:14}}>Leaderboard</div><div style={{fontSize:11,color:"#6b7280"}}>{count} players</div></div>
        </div>
      </div>
      <div style={S.wrap}>
        {resultBonus.champion&&(
          <div style={{...S.aG,marginTop:"1rem",display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20}}>🏆</span>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>Champion: {resultBonus.champion}</div>
              {resultBonus.runner&&<div style={{fontSize:12,color:"#374151"}}>Runner-up: {resultBonus.runner}</div>}
            </div>
          </div>
        )}
        {!hasResults?(
          <div style={{...S.card,textAlign:"center",padding:"2.5rem",marginTop:"1.25rem"}}>
            <div style={{fontSize:40,marginBottom:12}}>📊</div>
            <div style={{fontWeight:600,color:"#374151",marginBottom:6}}>No points yet</div>
            <div style={{fontSize:13,color:"#6b7280"}}>Points appear once admin enters match results</div>
          </div>
        ):leaderboard.length===0?(
          <div style={{...S.card,textAlign:"center",padding:"2.5rem",marginTop:"1.25rem"}}>
            <div style={{fontSize:40,marginBottom:12}}>👥</div>
            <div style={{fontWeight:600,color:"#374151"}}>No players yet</div>
          </div>
        ):(
          <div style={{marginTop:"1.25rem"}}>
            {leaderboard.map((u,i)=>(
              <div key={u.name} style={{background:i===0?"#eff6ff":"#fff",border:`1px solid ${i===0?"#93c5fd":"#e5e7eb"}`,borderRadius:10,padding:"11px 13px",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:i<3?18:13,fontWeight:700,color:i===0?"#2563eb":i===1?"#6b7280":i===2?"#92400e":"#9ca3af",minWidth:24,textAlign:"center"}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600}}>{u.name}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{u.groupDone}/72 group · {u.koDone}/32 bracket</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:20,fontWeight:700,color:i===0?"#2563eb":"#111827"}}>{u.total} pts</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>
                      {u.grpPts>0?`${u.grpPts} grp`:""}{u.koPts>0?` · ${u.koPts} KO`:""}{u.bonusPts>0?` · ${u.bonusPts} bonus`:""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{...S.cardSm,marginTop:16,background:"#f9fafb"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>Tiebreaker order</div>
          <div style={{fontSize:11,color:"#6b7280",lineHeight:1.7}}>1. Highest knockout score · 2. Correct champion pick · 3. Correct runner-up pick · 4. Coin flip</div>
        </div>
      </div>
    </>
  );
}
