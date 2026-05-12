import { useState, useEffect } from "react";
import { storageGet, storageSet } from "./supabase";

const TEAM_FLAGS = {
  "Mexico": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/mx.svg",
  "South Africa": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/za.svg",
  "South Korea": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/kr.svg",
  "Czechia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/cz.svg",
  "Canada": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ca.svg",
  "Bosnia & Herzegovina": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ba.svg",
  "USA": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/us.svg",
  "Paraguay": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/py.svg",
  "Qatar": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/qa.svg",
  "Switzerland": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ch.svg",
  "Brazil": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/br.svg",
  "Morocco": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ma.svg",
  "Haiti": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ht.svg",
  "Scotland": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/gb-sct.svg",
  "Australia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/au.svg",
  "Türkiye": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/tr.svg",
  "Germany": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/de.svg",
  "Curaçao": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/cw.svg",
  "Netherlands": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/nl.svg",
  "Japan": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/jp.svg",
  "Ivory Coast": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ci.svg",
  "Ecuador": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ec.svg",
  "Sweden": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/se.svg",
  "Tunisia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/tn.svg",
  "Spain": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/es.svg",
  "Cape Verde": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/cv.svg",
  "Belgium": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/be.svg",
  "Egypt": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/eg.svg",
  "Saudi Arabia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/sa.svg",
  "Uruguay": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/uy.svg",
  "Iran": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ir.svg",
  "New Zealand": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/nz.svg",
  "France": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/fr.svg",
  "Senegal": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/sn.svg",
  "Iraq": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/iq.svg",
  "Norway": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/no.svg",
  "Argentina": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/ar.svg",
  "Algeria": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/dz.svg",
  "Austria": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/at.svg",
  "Jordan": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/jo.svg",
  "Portugal": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/pt.svg",
  "DR Congo": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/cd.svg",
  "England": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/gb-eng.svg",
  "Croatia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/hr.svg",
  "Ghana": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/gh.svg",
  "Panama": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/pa.svg",
  "Uzbekistan": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/uz.svg",
  "Colombia": "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/co.svg",
};

const EMOJI_FLAGS = {
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

function Flag({ team, size = 32 }) {
  const [err, setErr] = useState(false);
  const src = TEAM_FLAGS[team];
  if (!src || err) return <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>{EMOJI_FLAGS[team] || "⚽"}</span>;
  return <img src={src} alt={team} onError={() => setErr(true)} style={{ width: size * 1.4, height: size, objectFit: "cover", borderRadius: 3, border: "1px solid #e5e7eb", display: "block", flexShrink: 0 }} />;
}

function etToMYT(dateStr, timeStr) {
  const isPM = timeStr.includes("p.m.");
  const isAM = timeStr.includes("a.m.");
  const clean = timeStr.replace(/\s?(a\.m\.|p\.m\.)/, "").trim();
  let [h, m] = clean.includes(":") ? clean.split(":").map(Number) : [parseInt(clean), 0];
  if (isNaN(m)) m = 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  const utcMin = h * 60 + m + 4 * 60;
  const mytMin = utcMin + 8 * 60;
  const dayOver = Math.floor(mytMin / 1440);
  const tod = ((mytMin % 1440) + 1440) % 1440;
  const mh = Math.floor(tod / 60), mm = tod % 60;
  const ampm = mh >= 12 ? "PM" : "AM";
  const disp = `${mh % 12 === 0 ? 12 : mh % 12}:${mm.toString().padStart(2, "0")} ${ampm}`;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, mo - 1, d + dayOver));
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return { time: disp, date: `${days[base.getUTCDay()]}, ${months[base.getUTCMonth()]} ${base.getUTCDate()}`, rawDate: dateStr };
}

const RAW = [
  {id:1,stage:"Group A",grp:"A",date:"2026-06-11",et:"3 p.m.",home:"Mexico",away:"South Africa",venue:"Estadio Azteca, Mexico City"},
  {id:2,stage:"Group A",grp:"A",date:"2026-06-11",et:"10 p.m.",home:"South Korea",away:"Czechia",venue:"Estadio Akron, Mexico"},
  {id:3,stage:"Group B",grp:"B",date:"2026-06-12",et:"3 p.m.",home:"Canada",away:"Bosnia & Herzegovina",venue:"BMO Field, Toronto"},
  {id:4,stage:"Group D",grp:"D",date:"2026-06-12",et:"9 p.m.",home:"USA",away:"Paraguay",venue:"SoFi Stadium, Los Angeles"},
  {id:5,stage:"Group B",grp:"B",date:"2026-06-13",et:"3 p.m.",home:"Qatar",away:"Switzerland",venue:"Levi's Stadium, Santa Clara"},
  {id:6,stage:"Group C",grp:"C",date:"2026-06-13",et:"6 p.m.",home:"Brazil",away:"Morocco",venue:"MetLife Stadium, New Jersey"},
  {id:7,stage:"Group C",grp:"C",date:"2026-06-13",et:"9 p.m.",home:"Haiti",away:"Scotland",venue:"Gillette Stadium, Foxborough"},
  {id:8,stage:"Group D",grp:"D",date:"2026-06-14",et:"12 p.m.",home:"Australia",away:"Türkiye",venue:"BC Place, Vancouver"},
  {id:9,stage:"Group E",grp:"E",date:"2026-06-14",et:"1 p.m.",home:"Germany",away:"Curaçao",venue:"NRG Stadium, Houston"},
  {id:10,stage:"Group F",grp:"F",date:"2026-06-14",et:"4 p.m.",home:"Netherlands",away:"Japan",venue:"AT&T Stadium, Arlington"},
  {id:11,stage:"Group E",grp:"E",date:"2026-06-14",et:"7 p.m.",home:"Ivory Coast",away:"Ecuador",venue:"Lincoln Financial Field, Philadelphia"},
  {id:12,stage:"Group F",grp:"F",date:"2026-06-14",et:"10 p.m.",home:"Sweden",away:"Tunisia",venue:"Estadio BBVA, Monterrey"},
  {id:13,stage:"Group H",grp:"H",date:"2026-06-15",et:"12 p.m.",home:"Spain",away:"Cape Verde",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:14,stage:"Group G",grp:"G",date:"2026-06-15",et:"3 p.m.",home:"Belgium",away:"Egypt",venue:"Lumen Field, Seattle"},
  {id:15,stage:"Group H",grp:"H",date:"2026-06-15",et:"6 p.m.",home:"Saudi Arabia",away:"Uruguay",venue:"Hard Rock Stadium, Miami"},
  {id:16,stage:"Group G",grp:"G",date:"2026-06-15",et:"9 p.m.",home:"Iran",away:"New Zealand",venue:"SoFi Stadium, Los Angeles"},
  {id:17,stage:"Group I",grp:"I",date:"2026-06-16",et:"3 p.m.",home:"France",away:"Senegal",venue:"MetLife Stadium, New Jersey"},
  {id:18,stage:"Group I",grp:"I",date:"2026-06-16",et:"6 p.m.",home:"Iraq",away:"Norway",venue:"Gillette Stadium, Foxborough"},
  {id:19,stage:"Group J",grp:"J",date:"2026-06-16",et:"9 p.m.",home:"Argentina",away:"Algeria",venue:"Arrowhead Stadium, Kansas City"},
  {id:20,stage:"Group J",grp:"J",date:"2026-06-17",et:"12 a.m.",home:"Austria",away:"Jordan",venue:"Levi's Stadium, Santa Clara"},
  {id:21,stage:"Group K",grp:"K",date:"2026-06-17",et:"1 p.m.",home:"Portugal",away:"DR Congo",venue:"NRG Stadium, Houston"},
  {id:22,stage:"Group L",grp:"L",date:"2026-06-17",et:"4 p.m.",home:"England",away:"Croatia",venue:"AT&T Stadium, Arlington"},
  {id:23,stage:"Group L",grp:"L",date:"2026-06-17",et:"7 p.m.",home:"Ghana",away:"Panama",venue:"BMO Field, Toronto"},
  {id:24,stage:"Group K",grp:"K",date:"2026-06-17",et:"10 p.m.",home:"Uzbekistan",away:"Colombia",venue:"Estadio Azteca, Mexico City"},
  {id:25,stage:"Group A",grp:"A",date:"2026-06-18",et:"12 p.m.",home:"Czechia",away:"South Africa",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:26,stage:"Group B",grp:"B",date:"2026-06-18",et:"3 p.m.",home:"Switzerland",away:"Bosnia & Herzegovina",venue:"SoFi Stadium, Los Angeles"},
  {id:27,stage:"Group B",grp:"B",date:"2026-06-18",et:"6 p.m.",home:"Canada",away:"Qatar",venue:"BC Place, Vancouver"},
  {id:28,stage:"Group A",grp:"A",date:"2026-06-18",et:"9 p.m.",home:"Mexico",away:"South Korea",venue:"Estadio Akron, Mexico"},
  {id:29,stage:"Group D",grp:"D",date:"2026-06-19",et:"3 p.m.",home:"USA",away:"Australia",venue:"Lumen Field, Seattle"},
  {id:30,stage:"Group C",grp:"C",date:"2026-06-19",et:"6 p.m.",home:"Scotland",away:"Morocco",venue:"Gillette Stadium, Foxborough"},
  {id:31,stage:"Group C",grp:"C",date:"2026-06-19",et:"8:30 p.m.",home:"Brazil",away:"Haiti",venue:"Lincoln Financial Field, Philadelphia"},
  {id:32,stage:"Group D",grp:"D",date:"2026-06-19",et:"11 p.m.",home:"Türkiye",away:"Paraguay",venue:"Levi's Stadium, Santa Clara"},
  {id:33,stage:"Group F",grp:"F",date:"2026-06-20",et:"1 p.m.",home:"Netherlands",away:"Sweden",venue:"NRG Stadium, Houston"},
  {id:34,stage:"Group E",grp:"E",date:"2026-06-20",et:"4 p.m.",home:"Germany",away:"Ivory Coast",venue:"BMO Field, Toronto"},
  {id:35,stage:"Group E",grp:"E",date:"2026-06-20",et:"8 p.m.",home:"Ecuador",away:"Curaçao",venue:"Arrowhead Stadium, Kansas City"},
  {id:36,stage:"Group F",grp:"F",date:"2026-06-21",et:"12 a.m.",home:"Tunisia",away:"Japan",venue:"Estadio BBVA, Monterrey"},
  {id:37,stage:"Group H",grp:"H",date:"2026-06-21",et:"12 p.m.",home:"Spain",away:"Saudi Arabia",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:38,stage:"Group G",grp:"G",date:"2026-06-21",et:"3 p.m.",home:"Belgium",away:"Iran",venue:"SoFi Stadium, Los Angeles"},
  {id:39,stage:"Group H",grp:"H",date:"2026-06-21",et:"6 p.m.",home:"Uruguay",away:"Cape Verde",venue:"Hard Rock Stadium, Miami"},
  {id:40,stage:"Group G",grp:"G",date:"2026-06-21",et:"9 p.m.",home:"New Zealand",away:"Egypt",venue:"BC Place, Vancouver"},
  {id:41,stage:"Group J",grp:"J",date:"2026-06-22",et:"1 p.m.",home:"Argentina",away:"Austria",venue:"AT&T Stadium, Arlington"},
  {id:42,stage:"Group I",grp:"I",date:"2026-06-22",et:"5 p.m.",home:"France",away:"Iraq",venue:"Lincoln Financial Field, Philadelphia"},
  {id:43,stage:"Group I",grp:"I",date:"2026-06-22",et:"8 p.m.",home:"Norway",away:"Senegal",venue:"MetLife Stadium, New Jersey"},
  {id:44,stage:"Group J",grp:"J",date:"2026-06-22",et:"11 p.m.",home:"Jordan",away:"Algeria",venue:"Levi's Stadium, Santa Clara"},
  {id:45,stage:"Group K",grp:"K",date:"2026-06-23",et:"1 p.m.",home:"Portugal",away:"Uzbekistan",venue:"NRG Stadium, Houston"},
  {id:46,stage:"Group L",grp:"L",date:"2026-06-23",et:"4 p.m.",home:"England",away:"Ghana",venue:"Gillette Stadium, Foxborough"},
  {id:47,stage:"Group L",grp:"L",date:"2026-06-23",et:"7 p.m.",home:"Panama",away:"Croatia",venue:"BMO Field, Toronto"},
  {id:48,stage:"Group K",grp:"K",date:"2026-06-23",et:"10 p.m.",home:"Colombia",away:"DR Congo",venue:"Estadio Akron, Mexico"},
  {id:49,stage:"Group B",grp:"B",date:"2026-06-24",et:"3 p.m.",home:"Switzerland",away:"Canada",venue:"BC Place, Vancouver"},
  {id:50,stage:"Group B",grp:"B",date:"2026-06-24",et:"3 p.m.",home:"Bosnia & Herzegovina",away:"Qatar",venue:"Lumen Field, Seattle"},
  {id:51,stage:"Group C",grp:"C",date:"2026-06-24",et:"6 p.m.",home:"Scotland",away:"Brazil",venue:"Hard Rock Stadium, Miami"},
  {id:52,stage:"Group C",grp:"C",date:"2026-06-24",et:"6 p.m.",home:"Morocco",away:"Haiti",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:53,stage:"Group A",grp:"A",date:"2026-06-24",et:"9 p.m.",home:"Czechia",away:"Mexico",venue:"Estadio Azteca, Mexico City"},
  {id:54,stage:"Group A",grp:"A",date:"2026-06-24",et:"9 p.m.",home:"South Africa",away:"South Korea",venue:"Estadio BBVA, Monterrey"},
  {id:55,stage:"Group E",grp:"E",date:"2026-06-25",et:"4 p.m.",home:"Curaçao",away:"Ivory Coast",venue:"Lincoln Financial Field, Philadelphia"},
  {id:56,stage:"Group E",grp:"E",date:"2026-06-25",et:"4 p.m.",home:"Ecuador",away:"Germany",venue:"MetLife Stadium, New Jersey"},
  {id:57,stage:"Group F",grp:"F",date:"2026-06-25",et:"7 p.m.",home:"Japan",away:"Sweden",venue:"AT&T Stadium, Arlington"},
  {id:58,stage:"Group F",grp:"F",date:"2026-06-25",et:"7 p.m.",home:"Tunisia",away:"Netherlands",venue:"Arrowhead Stadium, Kansas City"},
  {id:59,stage:"Group D",grp:"D",date:"2026-06-25",et:"10 p.m.",home:"Türkiye",away:"USA",venue:"SoFi Stadium, Los Angeles"},
  {id:60,stage:"Group D",grp:"D",date:"2026-06-25",et:"10 p.m.",home:"Paraguay",away:"Australia",venue:"Levi's Stadium, Santa Clara"},
  {id:61,stage:"Group I",grp:"I",date:"2026-06-26",et:"3 p.m.",home:"Norway",away:"France",venue:"Gillette Stadium, Foxborough"},
  {id:62,stage:"Group I",grp:"I",date:"2026-06-26",et:"3 p.m.",home:"Senegal",away:"Iraq",venue:"BMO Field, Toronto"},
  {id:63,stage:"Group H",grp:"H",date:"2026-06-26",et:"8 p.m.",home:"Cape Verde",away:"Saudi Arabia",venue:"NRG Stadium, Houston"},
  {id:64,stage:"Group H",grp:"H",date:"2026-06-26",et:"8 p.m.",home:"Uruguay",away:"Spain",venue:"Estadio Akron, Mexico"},
  {id:65,stage:"Group G",grp:"G",date:"2026-06-26",et:"11 p.m.",home:"Egypt",away:"Iran",venue:"Lumen Field, Seattle"},
  {id:66,stage:"Group G",grp:"G",date:"2026-06-26",et:"11 p.m.",home:"New Zealand",away:"Belgium",venue:"BC Place, Vancouver"},
  {id:67,stage:"Group L",grp:"L",date:"2026-06-27",et:"5 p.m.",home:"Panama",away:"England",venue:"MetLife Stadium, New Jersey"},
  {id:68,stage:"Group L",grp:"L",date:"2026-06-27",et:"5 p.m.",home:"Croatia",away:"Ghana",venue:"Lincoln Financial Field, Philadelphia"},
  {id:69,stage:"Group K",grp:"K",date:"2026-06-27",et:"7:30 p.m.",home:"Colombia",away:"Portugal",venue:"Hard Rock Stadium, Miami"},
  {id:70,stage:"Group K",grp:"K",date:"2026-06-27",et:"7:30 p.m.",home:"DR Congo",away:"Uzbekistan",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:71,stage:"Group J",grp:"J",date:"2026-06-27",et:"10 p.m.",home:"Algeria",away:"Austria",venue:"Arrowhead Stadium, Kansas City"},
  {id:72,stage:"Group J",grp:"J",date:"2026-06-27",et:"10 p.m.",home:"Jordan",away:"Argentina",venue:"AT&T Stadium, Arlington"},
];

const KNOCKOUT_TEMPLATES = [
  {id:73,stage:"Round of 32",date:"2026-06-28",et:"3 p.m.",homeSlot:"runner_A",awaySlot:"runner_B",venue:"SoFi Stadium, Los Angeles"},
  {id:74,stage:"Round of 32",date:"2026-06-29",et:"1 p.m.",homeSlot:"winner_C",awaySlot:"runner_F",venue:"NRG Stadium, Houston"},
  {id:75,stage:"Round of 32",date:"2026-06-29",et:"4:30 p.m.",homeSlot:"winner_E",awaySlot:"best3rd",venue:"Gillette Stadium, Foxborough"},
  {id:76,stage:"Round of 32",date:"2026-06-29",et:"9 p.m.",homeSlot:"winner_F",awaySlot:"runner_C",venue:"Estadio BBVA, Monterrey"},
  {id:77,stage:"Round of 32",date:"2026-06-30",et:"1 p.m.",homeSlot:"runner_E",awaySlot:"runner_I",venue:"AT&T Stadium, Arlington"},
  {id:78,stage:"Round of 32",date:"2026-06-30",et:"5 p.m.",homeSlot:"winner_I",awaySlot:"best3rd",venue:"MetLife Stadium, New Jersey"},
  {id:79,stage:"Round of 32",date:"2026-06-30",et:"9 p.m.",homeSlot:"winner_A",awaySlot:"best3rd",venue:"Estadio Azteca, Mexico City"},
  {id:80,stage:"Round of 32",date:"2026-07-01",et:"12 p.m.",homeSlot:"winner_L",awaySlot:"best3rd",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:81,stage:"Round of 32",date:"2026-07-01",et:"4 p.m.",homeSlot:"winner_G",awaySlot:"best3rd",venue:"Lumen Field, Seattle"},
  {id:82,stage:"Round of 32",date:"2026-07-01",et:"8 p.m.",homeSlot:"winner_D",awaySlot:"best3rd",venue:"Levi's Stadium, Santa Clara"},
  {id:83,stage:"Round of 32",date:"2026-07-02",et:"3 p.m.",homeSlot:"winner_H",awaySlot:"runner_J",venue:"SoFi Stadium, Los Angeles"},
  {id:84,stage:"Round of 32",date:"2026-07-02",et:"7 p.m.",homeSlot:"runner_K",awaySlot:"runner_L",venue:"BMO Field, Toronto"},
  {id:85,stage:"Round of 32",date:"2026-07-02",et:"11 p.m.",homeSlot:"winner_B",awaySlot:"best3rd",venue:"BC Place, Vancouver"},
  {id:86,stage:"Round of 32",date:"2026-07-03",et:"2 p.m.",homeSlot:"runner_D",awaySlot:"runner_G",venue:"AT&T Stadium, Arlington"},
  {id:87,stage:"Round of 32",date:"2026-07-03",et:"6 p.m.",homeSlot:"winner_J",awaySlot:"runner_H",venue:"Hard Rock Stadium, Miami"},
  {id:88,stage:"Round of 32",date:"2026-07-03",et:"9:30 p.m.",homeSlot:"winner_K",awaySlot:"best3rd",venue:"Arrowhead Stadium, Kansas City"},
  {id:89,stage:"Round of 16",date:"2026-07-04",et:"1 p.m.",homeSlot:"r32_1",awaySlot:"r32_2",venue:"NRG Stadium, Houston"},
  {id:90,stage:"Round of 16",date:"2026-07-04",et:"5 p.m.",homeSlot:"r32_3",awaySlot:"r32_4",venue:"Lincoln Financial Field, Philadelphia"},
  {id:91,stage:"Round of 16",date:"2026-07-05",et:"4 p.m.",homeSlot:"r32_5",awaySlot:"r32_6",venue:"MetLife Stadium, New Jersey"},
  {id:92,stage:"Round of 16",date:"2026-07-05",et:"8 p.m.",homeSlot:"r32_7",awaySlot:"r32_8",venue:"Estadio Azteca, Mexico City"},
  {id:93,stage:"Round of 16",date:"2026-07-06",et:"3 p.m.",homeSlot:"r32_9",awaySlot:"r32_10",venue:"AT&T Stadium, Arlington"},
  {id:94,stage:"Round of 16",date:"2026-07-06",et:"8 p.m.",homeSlot:"r32_11",awaySlot:"r32_12",venue:"Lumen Field, Seattle"},
  {id:95,stage:"Round of 16",date:"2026-07-07",et:"12 p.m.",homeSlot:"r32_13",awaySlot:"r32_14",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:96,stage:"Round of 16",date:"2026-07-07",et:"4 p.m.",homeSlot:"r32_15",awaySlot:"r32_16",venue:"BC Place, Vancouver"},
  {id:97,stage:"Quarterfinal",date:"2026-07-09",et:"4 p.m.",homeSlot:"r16_1",awaySlot:"r16_2",venue:"Gillette Stadium, Foxborough"},
  {id:98,stage:"Quarterfinal",date:"2026-07-10",et:"3 p.m.",homeSlot:"r16_3",awaySlot:"r16_4",venue:"SoFi Stadium, Los Angeles"},
  {id:99,stage:"Quarterfinal",date:"2026-07-11",et:"5 p.m.",homeSlot:"r16_5",awaySlot:"r16_6",venue:"Hard Rock Stadium, Miami"},
  {id:100,stage:"Quarterfinal",date:"2026-07-11",et:"9 p.m.",homeSlot:"r16_7",awaySlot:"r16_8",venue:"Arrowhead Stadium, Kansas City"},
  {id:101,stage:"Semifinal",date:"2026-07-14",et:"3 p.m.",homeSlot:"qf_1",awaySlot:"qf_2",venue:"AT&T Stadium, Arlington"},
  {id:102,stage:"Semifinal",date:"2026-07-15",et:"3 p.m.",homeSlot:"qf_3",awaySlot:"qf_4",venue:"Mercedes-Benz Stadium, Atlanta"},
  {id:103,stage:"3rd Place",date:"2026-07-18",et:"5 p.m.",homeSlot:"sf_loser_1",awaySlot:"sf_loser_2",venue:"Hard Rock Stadium, Miami"},
  {id:104,stage:"Final",date:"2026-07-19",et:"3 p.m.",homeSlot:"sf_winner_1",awaySlot:"sf_winner_2",venue:"MetLife Stadium, New Jersey"},
];

const GROUP_MATCHES = RAW.map(m => ({ ...m, ...etToMYT(m.date, m.et) }));
const ALL_TEAMS = [...new Set(GROUP_MATCHES.map(m => [m.home, m.away]).flat())].sort();
const STAGES = ["Group Stage","Round of 32","Round of 16","Quarterfinal","Semifinal","3rd Place","Final"];

const USERS_KEY = "wc2026_users";
const RESULTS_KEY = "wc2026_results";
const CHAMP_KEY = "wc2026_champ";
const KNOCKOUT_KEY = "wc2026_knockout";
const SETTINGS_KEY = "wc2026_settings";
const ADMIN_PW = "Bullgy2026";

function computeStandings(groupMatches, results) {
  const groups = {};
  groupMatches.forEach(m => {
    if (!groups[m.grp]) groups[m.grp] = {};
    [m.home, m.away].forEach(t => {
      if (!groups[m.grp][t]) groups[m.grp][t] = { team: t, p: 0, w: 0, d: 0, l: 0, pts: 0 };
    });
    const r = results[m.id];
    if (!r) return;
    const home = groups[m.grp][m.home];
    const away = groups[m.grp][m.away];
    home.p++; away.p++;
    if (r === "home") { home.w++; home.pts += 3; away.l++; }
    else if (r === "away") { away.w++; away.pts += 3; home.l++; }
    else { home.d++; away.d++; home.pts++; away.pts++; }
  });
  const sorted = {};
  Object.keys(groups).forEach(g => {
    sorted[g] = Object.values(groups[g]).sort((a, b) => b.pts - a.pts || b.w - a.w);
  });
  return sorted;
}

function slotLabel(slot, standings) {
  if (!slot) return "TBD";
  const parts = slot.split("_");
  const type = parts[0];
  const grp = parts[1]?.toUpperCase();
  if (grp && standings[grp]) {
    const s = standings[grp];
    if (type === "winner") return s[0]?.team || `Winner ${grp}`;
    if (type === "runner") return s[1]?.team || `Runner-up ${grp}`;
  }
  if (type === "best3rd") return "Best 3rd-place";
  return slot.replace(/_/g, " ");
}

function calcScore(preds, results, userChamp, officialChamp) {
  let correct = 0, total = 0;
  GROUP_MATCHES.forEach(m => {
    if (preds[m.id] && results[m.id]) { total++; if (preds[m.id] === results[m.id]) correct++; }
  });
  const champSettled = !!officialChamp;
  const champCorrect = champSettled && userChamp && userChamp === officialChamp ? 1 : 0;
  const grandTotal = total + (champSettled ? 1 : 0);
  const grandCorrect = correct + champCorrect;
  return { correct: grandCorrect, total: grandTotal, matchCorrect: correct, matchTotal: total, champCorrect, pct: grandTotal > 0 ? Math.round((grandCorrect / grandTotal) * 100) : null };
}

const S = {
  // Layout
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827" },
  wrap: { maxWidth: 600, margin: "0 auto", padding: "0 1rem 4rem" },
  wrapNarrow: { maxWidth: 480, margin: "0 auto", padding: "0 1rem 4rem" },

  // Header
  header: { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  headerTitle: { fontSize: 16, fontWeight: 600, color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  // Hero
  hero: { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "2.5rem 1.5rem 2rem", textAlign: "center" },
  heroEmoji: { fontSize: 44, display: "block", marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: "#6b7280", marginTop: 4 },

  // Stats row
  statsRow: { display: "flex", borderTop: "1px solid #f3f4f6", marginTop: "1.5rem" },
  statCell: { flex: 1, padding: "12px 8px", textAlign: "center", borderRight: "1px solid #f3f4f6" },
  statN: { fontSize: 20, fontWeight: 700, color: "#111827" },
  statL: { fontSize: 11, color: "#9ca3af", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" },

  // Nav tabs
  nav: { background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", overflowX: "auto" },
  navTab: { flex: 1, minWidth: 80, padding: "12px 8px", fontSize: 12, fontWeight: 600, border: "none", background: "none", color: "#6b7280", cursor: "pointer", borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s", textTransform: "uppercase", letterSpacing: "0.4px" },
  navTabOn: { color: "#2563eb", borderBottomColor: "#2563eb" },

  // Stage pills
  stagePills: { display: "flex", gap: 6, flexWrap: "wrap", margin: "1.25rem 0 1rem" },
  pill: { padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase", letterSpacing: "0.3px" },
  pillOn: { background: "#2563eb", border: "1px solid #2563eb", color: "#fff" },

  // Date divider
  dateDivider: { display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px" },
  dateLine: { flex: 1, height: 1, background: "#f3f4f6" },
  dateText: { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" },

  // Match card
  matchCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 8, overflow: "hidden", transition: "border-color 0.15s" },
  matchCardOk: { borderColor: "#86efac", background: "#f0fdf4" },
  matchCardBad: { borderColor: "#fca5a5", background: "#fff5f5" },
  matchCardSettled: { borderColor: "#fde68a" },
  matchTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" },
  matchStageBadge: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", color: "#6b7280" },
  matchTime: { fontSize: 11, color: "#9ca3af" },
  matchBody: { padding: "12px 14px" },
  teamsRow: { display: "grid", gridTemplateColumns: "1fr 40px 1fr", alignItems: "center", gap: 6 },
  teamCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  teamName: { fontSize: 12, fontWeight: 600, color: "#111827", textAlign: "center", lineHeight: 1.3 },
  vsText: { fontSize: 13, fontWeight: 600, color: "#d1d5db", textAlign: "center" },
  venue: { fontSize: 10, color: "#9ca3af", textAlign: "center", marginTop: 8 },

  // Pick buttons
  pickRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginTop: 10 },
  pickBtn: { padding: "7px 4px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "all 0.12s", textTransform: "uppercase" },
  pickBtnHome: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" },
  pickBtnDraw: { background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" },
  pickBtnAway: { background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#6d28d9" },
  pickBtnAdmin: { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" },

  // Result bar
  resultBar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" },
  resultLabel: { fontSize: 11, color: "#9ca3af" },
  resultVal: { fontSize: 12, fontWeight: 600, color: "#374151", marginLeft: 4 },
  correctBadge: { fontSize: 11, fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 4 },
  wrongBadge: { fontSize: 11, fontWeight: 600, color: "#b91c1c", background: "#fee2e2", padding: "2px 8px", borderRadius: 4 },

  // Progress bar
  pbarWrap: { height: 3, background: "#f3f4f6" },
  pbar: { height: 3, background: "#2563eb", transition: "width 0.4s" },

  // Cards
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem", marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.4px" },

  // Inputs / buttons
  inp: { width: "100%", background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 14px", color: "#111827", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  btn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  btnPrimary: { background: "#2563eb", color: "#fff" },
  btnSuccess: { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" },
  btnDanger: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" },
  btnGhost: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
  btnSm: { padding: "5px 12px", fontSize: 11 },
  btnFull: { width: "100%" },

  // Alerts
  alertY: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#92400e", marginBottom: 12 },
  alertG: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#15803d", marginBottom: 12 },
  alertR: { background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#b91c1c", marginBottom: 12 },
  alertB: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#1d4ed8", marginBottom: 12 },

  // Leaderboard
  lbRow: { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", marginBottom: 8 },
  lbRank: { fontSize: 16, fontWeight: 700, color: "#9ca3af", minWidth: 24, textAlign: "center" },
  lbName: { fontSize: 14, fontWeight: 600, color: "#111827" },
  lbDetail: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  lbPct: { fontSize: 22, fontWeight: 700, color: "#2563eb" },
  lbSub: { fontSize: 11, color: "#9ca3af" },

  // Champion grid
  champGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 6, maxHeight: 360, overflowY: "auto" },
  champBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 5px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", transition: "all 0.12s", textAlign: "center" },
  champBtnOn: { border: "2px solid #2563eb", background: "#eff6ff" },
  champName: { fontSize: 11, fontWeight: 500, color: "#374151", lineHeight: 1.2 },
  champNameOn: { color: "#1d4ed8", fontWeight: 600 },

  // Toggle
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f3f4f6" },
  toggleLabel: { fontSize: 14, fontWeight: 500, color: "#111827" },
  toggleSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  // User row
  userRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 8, marginBottom: 6, border: "1px solid #f3f4f6" },

  // Toast
  toast: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#111827", borderRadius: 8, padding: "9px 18px", fontSize: 13, color: "#fff", zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },

  // Confirm overlay
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  confirmBox: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", maxWidth: 340, width: "100%", textAlign: "center" },

  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { padding: "6px 8px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #f3f4f6" },
  td: { padding: "7px 8px", borderBottom: "1px solid #f9fafb", color: "#374151" },

  // Avatar
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#2563eb", flexShrink: 0 },
};

export default function App() {
  const [view, setView] = useState("home");
  const [username, setUsername] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [predictions, setPredictions] = useState({});
  const [champion, setChampion] = useState("");
  const [allUsers, setAllUsers] = useState({});
  const [results, setResults] = useState({});
  const [officialChamp, setOfficialChamp] = useState("");
  const [knockoutTeams, setKnockoutTeams] = useState({});
  const [settings, setSettings] = useState({ registrationLocked: false });
  const [filterStage, setFilterStage] = useState("Group Stage");
  const [saved, setSaved] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("schedule");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const DEADLINE = new Date("2026-06-11T07:00:00Z");
  const isClosed = new Date() >= DEADLINE;

  useEffect(() => {
    (async () => {
      try { const u = await storageGet(USERS_KEY); if (u?.value) setAllUsers(JSON.parse(u.value)); } catch {}
      try { const r = await storageGet(RESULTS_KEY); if (r?.value) setResults(JSON.parse(r.value)); } catch {}
      try { const c = await storageGet(CHAMP_KEY); if (c?.value) setOfficialChamp(JSON.parse(c.value)); } catch {}
      try { const k = await storageGet(KNOCKOUT_KEY); if (k?.value) setKnockoutTeams(JSON.parse(k.value)); } catch {}
      try { const s = await storageGet(SETTINGS_KEY); if (s?.value) setSettings(JSON.parse(s.value)); } catch {}
      setLoading(false);
    })();
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const saveUsers = async u => { await storageSet(USERS_KEY, JSON.stringify(u)); setAllUsers(u); };
  const saveResults = async r => { await storageSet(RESULTS_KEY, JSON.stringify(r)); setResults(r); };
  const saveChamp = async c => { await storageSet(CHAMP_KEY, JSON.stringify(c)); setOfficialChamp(c); };
  const saveKnockout = async k => { await storageSet(KNOCKOUT_KEY, JSON.stringify(k)); setKnockoutTeams(k); };
  const saveSettings = async s => { await storageSet(SETTINGS_KEY, JSON.stringify(s)); setSettings(s); };

  const standings = computeStandings(GROUP_MATCHES, results);

  const buildKnockout = () => KNOCKOUT_TEMPLATES.map(m => {
    const myt = etToMYT(m.date, m.et);
    const sv = knockoutTeams[m.id] || {};
    return { ...m, ...myt, home: sv.home || slotLabel(m.homeSlot, standings), away: sv.away || slotLabel(m.awaySlot, standings) };
  });

  const leaderboard = Object.entries(allUsers).map(([name, data]) => {
    const score = calcScore(data.predictions || {}, results, data.champion, officialChamp);
    return { name, champion: data.champion, pickCount: Object.keys(data.predictions || {}).length, ...score };
  }).sort((a, b) => (a.pct !== null && b.pct !== null) ? b.pct - a.pct : a.pct !== null ? -1 : b.pct !== null ? 1 : b.pickCount - a.pickCount);

  function handleLogin() {
    const name = nameInput.trim();
    if (!name) return;
    if (name.toLowerCase() === "admin") { setView("adminLogin"); return; }
    if (!allUsers[name] && settings.registrationLocked) { showToast("Registration is closed. Contact the admin."); return; }
    setUsername(name);
    const ex = allUsers[name];
    setPredictions(ex?.predictions || {}); setChampion(ex?.champion || "");
    setTab("schedule"); setView("predict");
  }

  async function handleSave() {
    const upd = { ...allUsers, [username]: { predictions, champion, savedAt: new Date().toISOString() } };
    await saveUsers(upd); setSaved(true); showToast("Predictions saved!");
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteUser(name) {
    const upd = { ...allUsers }; delete upd[name];
    await saveUsers(upd); setConfirmDelete(null); showToast(`${name}'s entry deleted`);
  }

  const getFiltered = () => filterStage === "Group Stage" ? GROUP_MATCHES : buildKnockout().filter(m => m.stage === filterStage);

  const groupedByDate = ms => {
    const out = {};
    ms.forEach(m => { const k = m.rawDate || m.date; if (!out[k]) out[k] = []; out[k].push(m); });
    return out;
  };

  const done = GROUP_MATCHES.filter(m => predictions[m.id]).length;
  const resultsEntered = Object.keys(results).length;

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 40 }}>🏆</span>
      <div style={{ color: "#6b7280", fontSize: 14 }}>Loading...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {toast && <div style={S.toast}>{toast}</div>}

      {confirmDelete && (
        <div style={S.overlay}>
          <div style={S.confirmBox}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Delete entry?</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.5 }}>
              This will permanently delete <strong>{confirmDelete}</strong>'s predictions and cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn, ...S.btnGhost, flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnDanger, flex: 1 }} onClick={() => handleDeleteUser(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {view === "home" && <HomeScreen nameInput={nameInput} setNameInput={setNameInput} onLogin={handleLogin} isClosed={isClosed} count={Object.keys(allUsers).length} resultsIn={resultsEntered} onLB={() => setView("leaderboard")} deadline={DEADLINE} regLocked={settings.registrationLocked} />}

      {view === "adminLogin" && (
        <div style={{ ...S.wrapNarrow, paddingTop: "4rem" }}>
          <div style={S.card}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Admin access</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Enter password to manage results</div>
            </div>
            <input type="password" style={{ ...S.inp, marginBottom: 10 }} value={adminPw} onChange={e => setAdminPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { if (adminPw === ADMIN_PW) { setView("admin"); setAdminErr(false); } else setAdminErr(true); } }} placeholder="Password..." autoFocus />
            {adminErr && <div style={{ ...S.alertR, marginBottom: 10 }}>Incorrect password</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn, ...S.btnGhost, flex: 1 }} onClick={() => { setView("home"); setAdminPw(""); setAdminErr(false); }}>← Back</button>
              <button style={{ ...S.btn, ...S.btnPrimary, flex: 1 }} onClick={() => { if (adminPw === ADMIN_PW) { setView("admin"); setAdminErr(false); } else setAdminErr(true); }}>Login</button>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Default: wc2026admin</div>
          </div>
        </div>
      )}

      {view === "admin" && <AdminPanel groupMatches={GROUP_MATCHES} results={results} officialChamp={officialChamp} allTeams={ALL_TEAMS} standings={standings} buildKnockout={buildKnockout} knockoutTeams={knockoutTeams} settings={settings} onSaveResult={async (id, val) => { const r = { ...results, [id]: val }; await saveResults(r); showToast("Result saved"); }} onClearResult={async id => { const r = { ...results }; delete r[id]; await saveResults(r); showToast("Result cleared"); }} onSaveChamp={async c => { await saveChamp(c); showToast(`Champion set: ${c}`); }} onSaveKnockout={async (id, h, a) => { const k = { ...knockoutTeams, [id]: { home: h, away: a } }; await saveKnockout(k); showToast("Knockout teams saved"); }} onToggleReg={async () => { const s = { ...settings, registrationLocked: !settings.registrationLocked }; await saveSettings(s); showToast(s.registrationLocked ? "Registration locked" : "Registration open"); }} onDeleteUser={name => setConfirmDelete(name)} onBack={() => setView("home")} leaderboard={leaderboard} allUsers={allUsers} />}

      {view === "leaderboard" && <LeaderboardScreen leaderboard={leaderboard} officialChamp={officialChamp} resultsIn={resultsEntered} onBack={() => setView(username ? "predict" : "home")} count={Object.keys(allUsers).length} />}

      {view === "predict" && (
        <>
          <div style={S.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={S.avatar}>{username[0].toUpperCase()}</div>
              <div>
                <div style={S.headerTitle}>{username}</div>
                <div style={S.headerSub}>{done}/72 group picks · {Math.round(done / 72 * 100)}% complete</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => setView("leaderboard")}>Leaderboard</button>
              {!isClosed && <button style={{ ...S.btn, ...(saved ? S.btnSuccess : S.btnPrimary), ...S.btnSm }} onClick={handleSave}>{saved ? "✓ Saved" : "Save"}</button>}
              <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={() => { setView("home"); setUsername(""); setNameInput(""); }}>Exit</button>
            </div>
          </div>
          <div style={S.pbarWrap}><div style={{ ...S.pbar, width: `${Math.round(done / 72 * 100)}%` }} /></div>

          <div style={S.nav}>
            {[["schedule","Predictions"],["champion","Champion"],["schedule_all","Full Schedule"]].map(([t, l]) => (
              <button key={t} style={{ ...S.navTab, ...(tab === t ? S.navTabOn : {}) }} onClick={() => { setTab(t); if (t !== "champion") setFilterStage("Group Stage"); }}>{l}</button>
            ))}
          </div>

          <div style={S.wrap}>
            {isClosed && <div style={{ ...S.alertY, marginTop: "1rem" }}>🔒 Predictions are locked — tournament has kicked off!</div>}

            {(tab === "schedule" || tab === "schedule_all") && (
              <>
                <div style={S.stagePills}>
                  {STAGES.map(s => <button key={s} style={{ ...S.pill, ...(filterStage === s ? S.pillOn : {}) }} onClick={() => setFilterStage(s)}>{s}</button>)}
                </div>
                {Object.entries(groupedByDate(getFiltered())).map(([d, ms]) => (
                  <div key={d}>
                    <div style={S.dateDivider}><div style={S.dateLine} /><div style={S.dateText}>{ms[0].date}</div><div style={S.dateLine} /></div>
                    {ms.map(m => <MatchCard key={m.id} match={m} pick={predictions[m.id]} result={results[m.id]} onPick={v => !isClosed && setPredictions(p => ({ ...p, [m.id]: v }))} isClosed={isClosed} isGroup={m.stage.startsWith("Group")} isAdmin={false} />)}
                  </div>
                ))}
              </>
            )}
            {tab === "champion" && <ChampionTab allTeams={ALL_TEAMS} champion={champion} setChampion={c => { if (!isClosed) setChampion(c); }} isClosed={isClosed} officialChamp={officialChamp} />}
          </div>
        </>
      )}
    </div>
  );
}

function MatchCard({ match, pick, result, onPick, isClosed, isGroup, isAdmin, onAdminPick, onAdminClear }) {
  const hasTBD = !TEAM_FLAGS[match.home] && !TEAM_FLAGS[match.away];
  const pickCorrect = pick && result && pick === result;
  const pickWrong = pick && result && pick !== result;
  const resultText = r => r === "home" ? match.home : r === "away" ? match.away : "Draw";
  const short = t => t && t.length > 11 ? t.split(" ")[0] : t;

  const cardStyle = {
    ...S.matchCard,
    ...(pickCorrect ? S.matchCardOk : pickWrong ? S.matchCardBad : result && isGroup && !isAdmin ? S.matchCardSettled : {}),
  };

  return (
    <div style={cardStyle}>
      <div style={S.matchTop}>
        <span style={S.matchStageBadge}>{match.stage}</span>
        <span style={S.matchTime}>{match.time} MYT</span>
      </div>
      <div style={S.matchBody}>
        {!hasTBD ? (
          <>
            <div style={S.teamsRow}>
              <div style={S.teamCol}>
                <Flag team={match.home} size={30} />
                <div style={S.teamName}>{match.home}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={S.vsText}>vs</div>
              </div>
              <div style={S.teamCol}>
                <Flag team={match.away} size={30} />
                <div style={S.teamName}>{match.away}</div>
              </div>
            </div>

            {isGroup && !isClosed && !isAdmin && (
              <div style={S.pickRow}>
                {[["home", short(match.home), S.pickBtnHome], ["draw", "Draw", S.pickBtnDraw], ["away", short(match.away), S.pickBtnAway]].map(([val, lbl, activeStyle]) => (
                  <button key={val} style={{ ...S.pickBtn, ...(pick === val ? activeStyle : {}) }} onClick={() => onPick(val)}>
                    {pick === val ? "✓ " : ""}{lbl}
                  </button>
                ))}
              </div>
            )}

            {isGroup && isAdmin && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Set result</span>
                  {result && <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => onAdminClear(match.id)}>Clear</button>}
                </div>
                <div style={S.pickRow}>
                  {[["home", short(match.home)], ["draw", "Draw"], ["away", short(match.away)]].map(([val, lbl]) => (
                    <button key={val} style={{ ...S.pickBtn, ...(result === val ? S.pickBtnAdmin : {}) }} onClick={() => onAdminPick(match.id, val)}>
                      {result === val ? "✓ " : ""}{lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isGroup && !isAdmin && isClosed && (
              <div style={S.resultBar}>
                <div><span style={S.resultLabel}>Your pick:</span><span style={S.resultVal}>{pick ? resultText(pick) : "—"}</span></div>
                {result && pick && <span style={pickCorrect ? S.correctBadge : S.wrongBadge}>{pickCorrect ? "✓ Correct" : "✗ Wrong"}</span>}
              </div>
            )}

            {result && isGroup && !isAdmin && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Result: {resultText(result)}{result !== "draw" ? " win" : ""}</div>
            )}

            {!isGroup && !isAdmin && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", paddingTop: 6 }}>Knockout — teams advance from group stage</div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, color: "#6b7280" }}>{match.home} vs {match.away}</div>
        )}
        <div style={S.venue}>📍 {match.venue}</div>
      </div>
    </div>
  );
}

function ChampionTab({ allTeams, champion, setChampion, isClosed, officialChamp }) {
  const champCorrect = officialChamp && champion && champion === officialChamp;
  return (
    <div style={{ paddingTop: "0.5rem" }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>Pick your World Cup champion</div>
      {isClosed && champion && (
        <div style={{ ...(champCorrect ? S.alertG : officialChamp ? S.alertR : S.alertY), marginBottom: "1rem" }}>
          {champCorrect ? `🎉 ${champion} won! Your pick is correct!` : officialChamp ? `❌ ${officialChamp} won — your pick (${champion}) was wrong.` : `🔒 You picked ${champion}. Awaiting the final.`}
        </div>
      )}
      {!champion && !isClosed && <div style={{ ...S.alertB, marginBottom: "1rem" }}>Select the team you think will lift the trophy on July 19</div>}
      {champion && !isClosed && <div style={{ ...S.alertG, marginBottom: "1rem" }}>Your pick: {champion} — click another to change</div>}
      <div style={S.champGrid}>
        {allTeams.map(t => (
          <button key={t} style={{ ...S.champBtn, ...(champion === t ? S.champBtnOn : {}) }} onClick={() => setChampion(t)}>
            <Flag team={t} size={26} />
            <div style={{ ...S.champName, ...(champion === t ? S.champNameOn : {}) }}>{t}</div>
            {champion === t && <div style={{ fontSize: 9, color: "#2563eb", fontWeight: 700 }}>YOUR PICK</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeScreen({ nameInput, setNameInput, onLogin, isClosed, count, resultsIn, onLB, deadline, regLocked }) {
  const mytD = deadline.toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <>
      <div style={S.hero}>
        <span style={S.heroEmoji}>🏆</span>
        <div style={S.heroTitle}>FIFA World Cup 2026</div>
        <div style={S.heroSub}>Office Prediction Challenge · Malaysia Time</div>
        <div style={S.statsRow}>
          {[["104","Matches"],["48","Nations"],["3","Hosts"],[count || "0","Players"]].map(([v, l]) => (
            <div key={l} style={{ ...S.statCell, borderRight: l === "Players" ? "none" : "1px solid #f3f4f6" }}>
              <div style={S.statN}>{v}</div>
              <div style={S.statL}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...S.wrapNarrow, paddingTop: "1.5rem" }}>
        {resultsIn > 0 && <div style={S.alertG}>📊 {resultsIn} results in — leaderboard is live!</div>}
        {isClosed && <div style={S.alertR}>🔒 Predictions closed — tournament is underway!</div>}
        {regLocked && !isClosed && <div style={S.alertY}>🔒 Registration is closed. Contact the admin to join.</div>}

        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Enter your name to play</div>
          <input style={{ ...S.inp, marginBottom: 10 }} value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onLogin()} placeholder='Your name — or type "admin" for admin panel' autoFocus />
          <button style={{ ...S.btn, ...S.btnPrimary, ...S.btnFull }} onClick={onLogin}>
            {isClosed ? "View my predictions" : "Make my predictions →"}
          </button>
          <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Predictions close: {mytD} MYT</div>
        </div>

        <button style={{ ...S.btn, ...S.btnGhost, ...S.btnFull, marginBottom: 16 }} onClick={onLB}>View Leaderboard</button>

        <div style={S.card}>
          <div style={S.cardTitle}>How to play</div>
          {[["⚽","Pick win / draw / loss for all 72 group stage matches"],["🏆","Pick the ultimate World Cup champion"],["🔒","Predictions lock at first kickoff — Jun 11, 3PM MYT"],["📊","Admin enters results after each match is played"],["🥇","Highest accuracy % wins the challenge"]].map(([ic, tx]) => (
            <div key={tx} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{ic}</span>
              <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AdminPanel({ groupMatches, results, officialChamp, allTeams, standings, buildKnockout, knockoutTeams, settings, onSaveResult, onClearResult, onSaveChamp, onSaveKnockout, onToggleReg, onDeleteUser, onBack, leaderboard, allUsers }) {
  const [champInput, setChampInput] = useState(officialChamp || "");
  const [filterStage, setFilterStage] = useState("Group Stage");
  const [adminTab, setAdminTab] = useState("results");
  const [search, setSearch] = useState("");
  const [koEdits, setKoEdits] = useState({});
  const entered = Object.keys(results).length;

  const getFiltered = () => {
    const base = filterStage === "Group Stage" ? groupMatches : buildKnockout().filter(m => m.stage === filterStage);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(m => m.home?.toLowerCase().includes(q) || m.away?.toLowerCase().includes(q));
  };

  const grouped = ms => {
    const out = {};
    ms.forEach(m => { const k = m.rawDate || m.date; if (!out[k]) out[k] = []; out[k].push(m); });
    return out;
  };

  return (
    <>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={onBack}>← Exit</button>
          <div>
            <div style={S.headerTitle}>Admin Panel</div>
            <div style={S.headerSub}>{entered}/72 results · {Object.keys(allUsers).length} participants</div>
          </div>
        </div>
      </div>

      <div style={S.nav}>
        {[["results","Results"],["knockout","Knockout"],["standings","Standings"],["players","Players"],["settings","Settings"]].map(([t, l]) => (
          <button key={t} style={{ ...S.navTab, ...(adminTab === t ? S.navTabOn : {}) }} onClick={() => setAdminTab(t)}>{l}</button>
        ))}
      </div>

      <div style={S.wrap}>
        {adminTab === "results" && (
          <>
            <div style={{ ...S.card, marginTop: "1.25rem" }}>
              <div style={S.cardTitle}>World Cup Champion</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 5, maxHeight: 200, overflowY: "auto", marginBottom: 10 }}>
                {allTeams.map(t => (
                  <button key={t} style={{ ...S.champBtn, ...(champInput === t ? S.champBtnOn : {}), padding: "7px 4px" }} onClick={() => setChampInput(t)}>
                    <Flag team={t} size={20} />
                    <div style={{ ...S.champName, ...(champInput === t ? S.champNameOn : {}), fontSize: 10 }}>{t}</div>
                  </button>
                ))}
              </div>
              {champInput && <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnFull }} onClick={() => onSaveChamp(champInput)}>✓ Set {champInput} as Champion</button>}
              {officialChamp && <div style={{ ...S.alertG, marginTop: 8, marginBottom: 0 }}>Current champion: {officialChamp}</div>}
            </div>

            <div style={S.stagePills}>
              {STAGES.map(s => <button key={s} style={{ ...S.pill, ...(filterStage === s ? S.pillOn : {}) }} onClick={() => setFilterStage(s)}>{s}</button>)}
            </div>

            <input style={{ ...S.inp, marginBottom: 10 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team..." />
            <div style={{ ...S.alertY, marginBottom: 10 }}>Click a result button to save instantly. Green = result entered.</div>

            {Object.entries(grouped(getFiltered())).map(([d, ms]) => (
              <div key={d}>
                <div style={S.dateDivider}><div style={S.dateLine} /><div style={S.dateText}>{ms[0].date}</div><div style={S.dateLine} /></div>
                {ms.map(m => <MatchCard key={m.id} match={m} pick={null} result={results[m.id]} onPick={() => {}} isClosed={true} isGroup={m.stage.startsWith("Group")} isAdmin={true} onAdminPick={onSaveResult} onAdminClear={onClearResult} />)}
              </div>
            ))}
          </>
        )}

        {adminTab === "knockout" && (
          <>
            <div style={{ ...S.alertB, marginTop: "1.25rem" }}>Teams auto-populated from group standings. Override manually if needed.</div>
            <div style={S.stagePills}>
              {["Round of 32","Round of 16","Quarterfinal","Semifinal","3rd Place","Final"].map(s => (
                <button key={s} style={{ ...S.pill, ...(filterStage === s ? S.pillOn : {}) }} onClick={() => setFilterStage(s)}>{s}</button>
              ))}
            </div>
            {buildKnockout().filter(m => m.stage === (filterStage === "Group Stage" ? "Round of 32" : filterStage)).map(m => (
              <div key={m.id} style={{ ...S.card, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Match #{m.id} · {m.date} · {m.time} MYT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "end" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 3 }}>Home</div>
                    <input style={{ ...S.inp, fontSize: 12, padding: "6px 10px" }} value={koEdits[`${m.id}_h`] !== undefined ? koEdits[`${m.id}_h`] : (knockoutTeams[m.id]?.home || m.home)} onChange={e => setKoEdits(x => ({ ...x, [`${m.id}_h`]: e.target.value }))} />
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", paddingBottom: 6 }}>vs</div>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 3 }}>Away</div>
                    <input style={{ ...S.inp, fontSize: 12, padding: "6px 10px" }} value={koEdits[`${m.id}_a`] !== undefined ? koEdits[`${m.id}_a`] : (knockoutTeams[m.id]?.away || m.away)} onChange={e => setKoEdits(x => ({ ...x, [`${m.id}_a`]: e.target.value }))} />
                  </div>
                </div>
                <button style={{ ...S.btn, ...S.btnSuccess, ...S.btnSm, marginTop: 8 }} onClick={() => {
                  const h = koEdits[`${m.id}_h`] !== undefined ? koEdits[`${m.id}_h`] : (knockoutTeams[m.id]?.home || m.home);
                  const a = koEdits[`${m.id}_a`] !== undefined ? koEdits[`${m.id}_a`] : (knockoutTeams[m.id]?.away || m.away);
                  onSaveKnockout(m.id, h, a);
                }}>Save</button>
              </div>
            ))}
          </>
        )}

        {adminTab === "standings" && (
          <>
            <div style={{ ...S.alertB, marginTop: "1.25rem" }}>Live standings from results. Top 2 in each group auto-advance.</div>
            {Object.keys(standings).sort().map(g => (
              <div key={g} style={S.card}>
                <div style={S.cardTitle}>Group {g}</div>
                <table style={S.table}>
                  <thead><tr><th style={S.th}>Team</th><th style={S.th}>P</th><th style={S.th}>W</th><th style={S.th}>D</th><th style={S.th}>L</th><th style={S.th}>Pts</th></tr></thead>
                  <tbody>
                    {standings[g].map((t, i) => (
                      <tr key={t.team}>
                        <td style={{ ...S.td, fontWeight: i < 2 ? 600 : 400, color: i < 2 ? "#1d4ed8" : "#374151" }}>{i < 2 ? "→ " : ""}{t.team}</td>
                        <td style={S.td}>{t.p}</td><td style={S.td}>{t.w}</td><td style={S.td}>{t.d}</td><td style={S.td}>{t.l}</td>
                        <td style={{ ...S.td, fontWeight: 700, color: i < 2 ? "#1d4ed8" : "#374151" }}>{t.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {Object.keys(standings).length === 0 && <div style={{ ...S.card, textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No results entered yet.</div>}
          </>
        )}

        {adminTab === "players" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "1.25rem 0 0.75rem" }}>Players ({Object.keys(allUsers).length})</div>
            <div style={{ ...S.alertY, marginBottom: 12 }}>Deleting an entry is permanent and cannot be undone.</div>
            {Object.keys(allUsers).length === 0 && <div style={{ ...S.card, textAlign: "center", color: "#9ca3af", padding: "2rem" }}>No players yet.</div>}
            {leaderboard.map((u) => (
              <div key={u.name} style={S.userRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={S.avatar}>{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {u.pickCount}/72 picks · {u.champion || "No champion pick"}
                      {u.pct !== null ? ` · ${u.pct}%` : ""}
                    </div>
                  </div>
                </div>
                <button style={{ ...S.btn, ...S.btnDanger, ...S.btnSm }} onClick={() => onDeleteUser(u.name)}>Delete</button>
              </div>
            ))}
          </>
        )}

        {adminTab === "settings" && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "1.25rem 0 0.75rem" }}>Settings</div>
            <div style={S.card}>
              <div style={S.toggleRow}>
                <div>
                  <div style={S.toggleLabel}>Lock registrations</div>
                  <div style={S.toggleSub}>{settings.registrationLocked ? "New players cannot register" : "New players can register freely"}</div>
                </div>
                <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                  <input type="checkbox" checked={settings.registrationLocked} onChange={onToggleReg} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: "absolute", inset: 0, background: settings.registrationLocked ? "#2563eb" : "#d1d5db", borderRadius: 12, cursor: "pointer", transition: "0.3s" }}>
                    <span style={{ position: "absolute", height: 18, width: 18, left: settings.registrationLocked ? 23 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </span>
                </label>
              </div>
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Admin password</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                To change the password, update the <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>ADMIN_PW</code> constant in <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>App.jsx</code> and redeploy.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function LeaderboardScreen({ leaderboard, officialChamp, resultsIn, onBack, count }) {
  return (
    <>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ ...S.btn, ...S.btnGhost, ...S.btnSm }} onClick={onBack}>← Back</button>
          <div>
            <div style={S.headerTitle}>Leaderboard</div>
            <div style={S.headerSub}>{count} players · {resultsIn}/72 results{officialChamp ? ` · Champion: ${officialChamp}` : ""}</div>
          </div>
        </div>
      </div>
      <div style={S.wrap}>
        {resultsIn === 0 ? (
          <div style={{ ...S.card, textAlign: "center", padding: "3rem 1rem", marginTop: "1.25rem" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>No results yet</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Accuracy % will appear once admin enters match results</div>
          </div>
        ) : !leaderboard.length ? (
          <div style={{ ...S.card, textAlign: "center", padding: "3rem 1rem", marginTop: "1.25rem" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 600, color: "#374151" }}>No players yet</div>
          </div>
        ) : (
          <div style={{ marginTop: "1.25rem" }}>
            {leaderboard.map((u, i) => (
              <div key={u.name} style={{ ...S.lbRow, borderColor: i === 0 && u.pct !== null ? "#93c5fd" : "#e5e7eb", background: i === 0 && u.pct !== null ? "#eff6ff" : "#fff" }}>
                <div style={{ ...S.lbRank, color: i === 0 ? "#2563eb" : i === 1 ? "#6b7280" : i === 2 ? "#92400e" : "#9ca3af", fontSize: i < 3 ? 18 : 14 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.lbName}>{u.name}</div>
                  <div style={S.lbDetail}>
                    {u.matchCorrect}/{u.matchTotal} matches correct
                    {u.champion ? ` · ${u.champion}${u.champCorrect === 1 ? " ✓" : ""}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {u.pct !== null
                    ? <><div style={{ ...S.lbPct, color: i === 0 ? "#2563eb" : "#111827" }}>{u.pct}%</div><div style={S.lbSub}>{u.correct}/{u.total} correct</div></>
                    : <><div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{u.pickCount}/72 picks</div><div style={S.lbSub}>awaiting results</div></>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
