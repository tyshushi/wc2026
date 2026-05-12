import { useState, useEffect } from "react";
import { storageGet, storageSet, storageDelete } from "./supabase";

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

function FlagImg({ team, size = 40 }) {
  const [err, setErr] = useState(false);
  const src = TEAM_FLAGS[team];
  const EMOJI = {
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
  if (!src || err) {
    return (
      <div style={{ width: size * 1.4, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.75, lineHeight: 1 }}>
        {EMOJI[team] || "⚽"}
      </div>
    );
  }
  return (
    <img
      src={src} alt={team} onError={() => setErr(true)}
      style={{ width: size * 1.4, height: size, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)", display: "block", flexShrink: 0 }}
    />
  );
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
const STAGE_COLORS = {
  "Group Stage":"#3b82f6","Round of 32":"#8b5cf6","Round of 16":"#f59e0b",
  "Quarterfinal":"#f97316","Semifinal":"#ef4444","3rd Place":"#6b7280","Final":"#eab308"
};

const USERS_KEY = "wc2026_users";
const RESULTS_KEY = "wc2026_results";
const CHAMP_KEY = "wc2026_champ";
const KNOCKOUT_KEY = "wc2026_knockout";
const SETTINGS_KEY = "wc2026_settings";
const ADMIN_PW = "wc2026admin";

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
    const sorted = standings[grp];
    if (type === "winner") return sorted[0]?.team || `Winner ${grp}`;
    if (type === "runner") return sorted[1]?.team || `Runner-up ${grp}`;
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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow',sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh}
.hero{background:linear-gradient(160deg,#0d1b3e 0%,#1a0a2e 60%,#0d1b3e 100%);border-bottom:1px solid rgba(255,255,255,0.07);padding:1.5rem 1.5rem 0;text-align:center}
.trophy{font-size:52px;display:block;margin-bottom:10px}
.title{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#fff;line-height:1}
.title span{color:#eab308}
.subtitle{font-size:12px;color:rgba(255,255,255,0.4);margin-top:5px;letter-spacing:1.5px;text-transform:uppercase}
.stat-row{display:flex;margin-top:1.25rem;border-top:1px solid rgba(255,255,255,0.06)}
.stat-cell{flex:1;padding:10px 4px;border-right:1px solid rgba(255,255,255,0.06);text-align:center}
.stat-cell:last-child{border-right:none}
.stat-n{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:#eab308}
.stat-l{font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.nav{display:flex;background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.06);overflow-x:auto}
.nav::-webkit-scrollbar{display:none}
.ntab{flex:1;min-width:80px;padding:11px 6px;font-family:'Barlow',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;border:none;background:none;color:rgba(255,255,255,0.38);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:all 0.2s}
.ntab.on{color:#eab308;border-bottom-color:#eab308}
.ntab:hover:not(.on){color:rgba(255,255,255,0.65)}
.wrap{max-width:700px;margin:0 auto;padding:1.25rem 1rem 3rem}
.stabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1.25rem}
.stab{padding:5px 11px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);cursor:pointer;transition:all 0.2s}
.stab.on{border-color:transparent;color:#0a0e1a}
.divider{display:flex;align-items:center;gap:10px;margin:18px 0 10px}
.div-line{flex:1;height:1px;background:rgba(255,255,255,0.06)}
.div-txt{font-size:10px;font-weight:700;color:rgba(255,255,255,0.28);text-transform:uppercase;letter-spacing:1.5px;white-space:nowrap}
.mcard{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:8px;overflow:hidden;transition:border-color 0.2s}
.mcard.ok{border-color:rgba(34,197,94,0.4)}
.mcard.bad{border-color:rgba(239,68,68,0.35)}
.mcard.settled{border-color:rgba(234,179,8,0.15)}
.mhdr{display:flex;align-items:center;justify-content:space-between;padding:7px 13px;background:rgba(255,255,255,0.025);border-bottom:1px solid rgba(255,255,255,0.05)}
.badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;padding:2px 8px;border-radius:4px}
.mtime{font-size:11px;color:rgba(255,255,255,0.38)}
.mbody{padding:13px 14px}
.trow{display:grid;grid-template-columns:1fr 48px 1fr;align-items:center;gap:6px}
.tcol{display:flex;flex-direction:column;align-items:center;gap:7px}
.tname{font-size:12px;font-weight:600;color:#e2e8f0;text-align:center;line-height:1.2;min-height:28px;display:flex;align-items:center;justify-content:center}
.vscol{display:flex;flex-direction:column;align-items:center;gap:3px}
.vs{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;color:rgba(255,255,255,0.2)}
.picks{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-top:11px}
.pbtn{padding:8px 4px;border-radius:7px;border:1px solid rgba(255,255,255,0.09);background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.45);font-family:'Barlow',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;cursor:pointer;transition:all 0.15s;text-align:center}
.pbtn:hover{background:rgba(255,255,255,0.07);color:#e2e8f0}
.pbtn.ph{background:rgba(59,130,246,0.18);border-color:#3b82f6;color:#93c5fd}
.pbtn.pd{background:rgba(234,179,8,0.14);border-color:#eab308;color:#fde68a}
.pbtn.pa{background:rgba(168,85,247,0.18);border-color:#a855f7;color:#d8b4fe}
.pbtn.aset{background:rgba(34,197,94,0.15);border-color:rgba(34,197,94,0.4);color:#4ade80}
.rbar{display:flex;align-items:center;justify-content:space-between;margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,0.05)}
.rlabel{font-size:11px;color:rgba(255,255,255,0.35)}
.rval{font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);margin-left:5px}
.cbadge{font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px}
.cbadge.ok{color:#4ade80;background:rgba(34,197,94,0.12)}
.cbadge.bad{color:#f87171;background:rgba(239,68,68,0.12)}
.venue{font-size:10px;color:rgba(255,255,255,0.2);text-align:center;margin-top:7px}
.card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:1.25rem;margin-bottom:12px}
.shead{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.85);margin-bottom:1rem}
.inp{width:100%;background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:#e2e8f0;font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s}
.inp:focus{border-color:rgba(234,179,8,0.4)}
.inp::placeholder{color:rgba(255,255,255,0.18)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 18px;border-radius:8px;border:none;font-family:'Barlow',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;cursor:pointer;transition:all 0.15s}
.btn-y{background:#eab308;color:#0a0e1a}.btn-y:hover{background:#f59e0b}
.btn-g{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)}
.btn-r{background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.25)}
.btn-s{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.09)}.btn-s:hover{background:rgba(255,255,255,0.1)}
.btn-o{background:rgba(249,115,22,0.15);color:#fb923c;border:1px solid rgba(249,115,22,0.3)}
.btn-sm{padding:5px 11px;font-size:10px}
.btn-full{width:100%}
.alert{padding:10px 13px;border-radius:8px;font-size:13px;margin-bottom:12px;display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.alert-y{background:rgba(234,179,8,0.09);border:1px solid rgba(234,179,8,0.2);color:#fde68a}
.alert-g{background:rgba(34,197,94,0.09);border:1px solid rgba(34,197,94,0.2);color:#4ade80}
.alert-r{background:rgba(239,68,68,0.09);border:1px solid rgba(239,68,68,0.2);color:#f87171}
.alert-b{background:rgba(59,130,246,0.09);border:1px solid rgba(59,130,246,0.2);color:#93c5fd}
.ubar{display:flex;align-items:center;justify-content:space-between;background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.06);padding:10px 16px;gap:10px;flex-wrap:wrap}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}
.pbar-wrap{background:rgba(255,255,255,0.05);border-radius:3px;height:5px;overflow:hidden}
.pbar{height:5px;border-radius:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);transition:width 0.4s}
.lb-row{display:flex;align-items:center;gap:12px;background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 15px;margin-bottom:8px}
.lb-rank{font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;color:rgba(255,255,255,0.25);min-width:26px;text-align:center}
.lb-n{font-size:14px;font-weight:600;color:#e2e8f0}
.lb-d{font-size:11px;color:rgba(255,255,255,0.32);margin-top:2px}
.lb-pct{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:#eab308}
.lb-sub{font-size:11px;color:rgba(255,255,255,0.3)}
.champ-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:7px;max-height:360px;overflow-y:auto;padding-right:2px}
.champ-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 5px;border-radius:10px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);cursor:pointer;transition:all 0.15s;text-align:center}
.champ-btn:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.16)}
.champ-btn.on{border-color:#eab308;background:rgba(234,179,8,0.1)}
.champ-name{font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);line-height:1.2}
.champ-name.on{color:#fde68a}
.table{width:100%;border-collapse:collapse;font-size:12px}
.table th{padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:rgba(255,255,255,0.3);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.07)}
.table td{padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.04);color:rgba(255,255,255,0.7)}
.table tr:last-child td{border-bottom:none}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:9px 18px;font-size:13px;color:#4ade80;z-index:999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,0.4)}
.inp-sm{background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:5px 9px;color:#e2e8f0;font-family:'Barlow',sans-serif;font-size:12px;outline:none;width:100%}
.inp-sm:focus{border-color:rgba(234,179,8,0.35)}
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
.toggle{position:relative;width:44px;height:24px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.slider{position:absolute;inset:0;background:rgba(255,255,255,0.15);border-radius:12px;cursor:pointer;transition:0.3s}
.slider:before{content:'';position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s}
input:checked + .slider{background:#eab308}
input:checked + .slider:before{transform:translateX(20px)}
.user-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#1e293b;border-radius:8px;margin-bottom:6px}
.confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem}
.confirm-box{background:#1e293b;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:1.5rem;max-width:340px;width:100%;text-align:center}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
`;

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
    const saved = knockoutTeams[m.id] || {};
    return { ...m, ...myt, home: saved.home || slotLabel(m.homeSlot, standings), away: saved.away || slotLabel(m.awaySlot, standings) };
  });

  const leaderboard = Object.entries(allUsers).map(([name, data]) => {
    const score = calcScore(data.predictions || {}, results, data.champion, officialChamp);
    return { name, champion: data.champion, pickCount: Object.keys(data.predictions || {}).length, ...score };
  }).sort((a, b) => (a.pct !== null && b.pct !== null) ? b.pct - a.pct : a.pct !== null ? -1 : b.pct !== null ? 1 : b.pickCount - a.pickCount);

  function handleLogin() {
    const name = nameInput.trim();
    if (!name) return;
    if (name.toLowerCase() === "admin") { setView("adminLogin"); return; }
    const isNew = !allUsers[name];
    if (isNew && settings.registrationLocked) {
      showToast("❌ Registration is closed. Contact the admin.");
      return;
    }
    setUsername(name);
    const ex = allUsers[name];
    setPredictions(ex?.predictions || {}); setChampion(ex?.champion || "");
    setTab("schedule"); setView("predict");
  }

  async function handleSave() {
    const upd = { ...allUsers, [username]: { predictions, champion, savedAt: new Date().toISOString() } };
    await saveUsers(upd); setSaved(true); showToast("✓ Predictions saved!");
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteUser(name) {
    const upd = { ...allUsers };
    delete upd[name];
    await saveUsers(upd);
    setConfirmDelete(null);
    showToast(`✓ ${name}'s entry deleted`);
  }

  const getFiltered = () => {
    if (filterStage === "Group Stage") return GROUP_MATCHES;
    return buildKnockout().filter(m => m.stage === filterStage);
  };

  const groupedByDate = ms => {
    const out = {};
    ms.forEach(m => { const k = m.rawDate || m.date; if (!out[k]) out[k] = []; out[k].push(m); });
    return out;
  };

  const done = GROUP_MATCHES.filter(m => predictions[m.id]).length;
  const resultsEntered = Object.keys(results).length;

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🏆</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div>
        {toast && <div className="toast">{toast}</div>}

        {confirmDelete && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#e2e8f0" }}>Delete entry?</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
                This will permanently delete <strong style={{ color: "#e2e8f0" }}>{confirmDelete}</strong>'s predictions. This cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-s" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn btn-r" style={{ flex: 1 }} onClick={() => handleDeleteUser(confirmDelete)}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {view === "home" && (
          <HomeScreen nameInput={nameInput} setNameInput={setNameInput} onLogin={handleLogin}
            isClosed={isClosed} count={Object.keys(allUsers).length} resultsIn={resultsEntered}
            onLB={() => setView("leaderboard")} deadline={DEADLINE} regLocked={settings.registrationLocked} />
        )}

        {view === "adminLogin" && (
          <div style={{ maxWidth: 380, margin: "4rem auto", padding: "1rem" }}>
            <div className="card">
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
                <div className="shead" style={{ marginBottom: 4 }}>Admin Access</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Enter password to manage results</div>
              </div>
              <input type="password" className="inp" value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { if (adminPw === ADMIN_PW) { setView("admin"); setAdminErr(false); } else setAdminErr(true); } }}
                placeholder="Password..." style={{ marginBottom: 10 }} autoFocus />
              {adminErr && <div className="alert alert-r" style={{ marginBottom: 10 }}>Incorrect password</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-s" style={{ flex: 1 }} onClick={() => { setView("home"); setAdminPw(""); setAdminErr(false); }}>← Back</button>
                <button className="btn btn-y" style={{ flex: 1 }} onClick={() => { if (adminPw === ADMIN_PW) { setView("admin"); setAdminErr(false); } else setAdminErr(true); }}>Login</button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center" }}>Default: wc2026admin</div>
            </div>
          </div>
        )}

        {view === "admin" && (
          <AdminPanel
            groupMatches={GROUP_MATCHES} results={results} officialChamp={officialChamp}
            allTeams={ALL_TEAMS} standings={standings} buildKnockout={buildKnockout}
            knockoutTeams={knockoutTeams} settings={settings}
            onSaveResult={async (id, val) => { const r = { ...results, [id]: val }; await saveResults(r); showToast("✓ Result saved"); }}
            onClearResult={async id => { const r = { ...results }; delete r[id]; await saveResults(r); showToast("Result cleared"); }}
            onSaveChamp={async c => { await saveChamp(c); showToast(`✓ Champion: ${c}`); }}
            onSaveKnockout={async (id, home, away) => { const k = { ...knockoutTeams, [id]: { home, away } }; await saveKnockout(k); showToast("✓ Knockout teams saved"); }}
            onToggleReg={async () => { const s = { ...settings, registrationLocked: !settings.registrationLocked }; await saveSettings(s); showToast(s.registrationLocked ? "🔒 Registration locked" : "🔓 Registration open"); }}
            onDeleteUser={name => setConfirmDelete(name)}
            onBack={() => setView("home")} leaderboard={leaderboard} allUsers={allUsers}
          />
        )}

        {view === "leaderboard" && (
          <LeaderboardScreen leaderboard={leaderboard} officialChamp={officialChamp}
            resultsIn={resultsEntered} onBack={() => setView(username ? "predict" : "home")}
            count={Object.keys(allUsers).length} />
        )}

        {view === "predict" && (
          <>
            <div style={{ background: "linear-gradient(160deg,#0d1b3e,#1a0a2e)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.25rem 0" }}>
              <div className="ubar" style={{ background: "transparent", border: "none", padding: "0 0 0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="avatar">{username[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{username}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{done}/72 picks · {Math.round(done / 72 * 100)}%</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-s btn-sm" onClick={() => setView("leaderboard")}>🏅 Board</button>
                  {!isClosed && <button className={`btn btn-sm ${saved ? "btn-g" : "btn-y"}`} onClick={handleSave}>{saved ? "✓ Saved" : "Save"}</button>}
                  <button className="btn btn-s btn-sm" onClick={() => { setView("home"); setUsername(""); setNameInput(""); }}>Exit</button>
                </div>
              </div>
              <div className="pbar-wrap"><div className="pbar" style={{ width: `${Math.round(done / 72 * 100)}%` }} /></div>
            </div>
            <div className="nav">
              {[["schedule","⚽ Predictions"],["champion","🏆 Champion"],["schedule_all","📋 Full Schedule"]].map(([t, l]) => (
                <button key={t} className={`ntab${tab === t ? " on" : ""}`} onClick={() => { setTab(t); if (t !== "champion") setFilterStage("Group Stage"); }}>{l}</button>
              ))}
            </div>
            <div className="wrap">
              {isClosed && <div className="alert alert-y">🔒 Predictions locked — tournament has kicked off!</div>}
              {(tab === "schedule" || tab === "schedule_all") && (
                <>
                  <div className="stabs">
                    {STAGES.map(s => <button key={s} className={`stab${filterStage === s ? " on" : ""}`} style={filterStage === s ? { background: STAGE_COLORS[s] } : {}} onClick={() => setFilterStage(s)}>{s}</button>)}
                  </div>
                  {Object.entries(groupedByDate(getFiltered())).map(([d, ms]) => (
                    <div key={d}>
                      <div className="divider"><div className="div-line" /><div className="div-txt">{ms[0].date}</div><div className="div-line" /></div>
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
    </>
  );
}

function MatchCard({ match, pick, result, onPick, isClosed, isGroup, isAdmin, onAdminPick, onAdminClear }) {
  const hasTBD = !TEAM_FLAGS[match.home] && !TEAM_FLAGS[match.away];
  const pickCorrect = pick && result && pick === result;
  const pickWrong = pick && result && pick !== result;
  const sc = STAGE_COLORS[match.stage] || "#6b7280";
  const resultText = r => r === "home" ? match.home : r === "away" ? match.away : "Draw";
  const short = t => t && t.length > 11 ? t.split(" ")[0] : t;

  return (
    <div className={`mcard${pickCorrect ? " ok" : pickWrong ? " bad" : result && isGroup && !isAdmin ? " settled" : ""}`}>
      <div className="mhdr">
        <span className="badge" style={{ background: sc + "22", color: sc }}>{match.stage}</span>
        <span className="mtime">🕐 {match.time} MYT</span>
      </div>
      <div className="mbody">
        {!hasTBD ? (
          <>
            <div className="trow">
              <div className="tcol">
                <FlagImg team={match.home} size={38} />
                <div className="tname">{match.home}</div>
              </div>
              <div className="vscol">
                <div className="vs">VS</div>
                {pick && !isAdmin && isGroup && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: pick === "home" ? "#60a5fa" : pick === "away" ? "#c084fc" : "#fcd34d" }}>
                    {pick === "draw" ? "—" : pick === "home" ? "←" : "→"}
                  </div>
                )}
              </div>
              <div className="tcol">
                <FlagImg team={match.away} size={38} />
                <div className="tname">{match.away}</div>
              </div>
            </div>
            {isGroup && !isClosed && !isAdmin && (
              <div className="picks">
                {[["home", short(match.home), "ph"], ["draw", "Draw", "pd"], ["away", short(match.away), "pa"]].map(([val, lbl, cls]) => (
                  <button key={val} className={`pbtn${pick === val ? " " + cls : ""}`} onClick={() => onPick(val)}>
                    {pick === val ? "✓ " : ""}{lbl}
                  </button>
                ))}
              </div>
            )}
            {isGroup && isAdmin && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Set result</span>
                  {result && <button className="btn btn-r btn-sm" onClick={() => onAdminClear(match.id)}>Clear</button>}
                </div>
                <div className="picks">
                  {[["home", short(match.home)], ["draw", "Draw"], ["away", short(match.away)]].map(([val, lbl]) => (
                    <button key={val} className={`pbtn${result === val ? " aset" : ""}`} onClick={() => onAdminPick(match.id, val)}>
                      {result === val ? "✓ " : ""}{lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isGroup && !isAdmin && isClosed && (
              <div className="rbar">
                <div><span className="rlabel">Your pick:</span><span className="rval">{pick ? resultText(pick) : "—"}</span></div>
                {result && pick && <span className={`cbadge ${pickCorrect ? "ok" : "bad"}`}>{pickCorrect ? "✓ Correct" : "✗ Wrong"}</span>}
              </div>
            )}
            {result && isGroup && !isAdmin && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 7 }}>
                Result: {resultText(result)}{result !== "draw" ? " win" : ""}
              </div>
            )}
            {!isGroup && !isAdmin && (
              <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", paddingTop: 6 }}>
                Knockout match — teams advance from group stage
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{match.home} vs {match.away}</div>
          </div>
        )}
        <div className="venue">📍 {match.venue}</div>
      </div>
    </div>
  );
}

function ChampionTab({ allTeams, champion, setChampion, isClosed, officialChamp }) {
  const champCorrect = officialChamp && champion && champion === officialChamp;
  return (
    <div>
      <div className="shead">Pick your champion</div>
      {isClosed && champion && (
        <div className={`alert ${champCorrect ? "alert-g" : officialChamp ? "alert-r" : "alert-y"}`} style={{ marginBottom: "1rem" }}>
          {champCorrect ? `🎉 ${champion} won! Your pick is correct!` : officialChamp ? `❌ ${officialChamp} won — your pick (${champion}) was wrong.` : `🔒 You picked ${champion}. Awaiting the final.`}
        </div>
      )}
      {!champion && !isClosed && <div className="alert alert-b" style={{ marginBottom: "1rem" }}>Select the team you think will lift the trophy on July 19</div>}
      {champion && !isClosed && <div className="alert alert-g" style={{ marginBottom: "1rem" }}>Your pick: {champion} — click another to change</div>}
      <div className="champ-grid">
        {allTeams.map(t => (
          <button key={t} className={`champ-btn${champion === t ? " on" : ""}`} onClick={() => setChampion(t)}>
            <FlagImg team={t} size={28} />
            <div className={`champ-name${champion === t ? " on" : ""}`}>{t}</div>
            {champion === t && <div style={{ fontSize: 9, color: "#eab308", fontWeight: 700 }}>YOUR PICK</div>}
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
      <div className="hero">
        <span className="trophy">🏆</span>
        <div className="title">FIFA World Cup <span>2026</span></div>
        <div className="subtitle">Office Prediction Challenge · Malaysia Time</div>
        <div className="stat-row">
          {[["104","Matches"],["48","Nations"],["3","Hosts"],[count || "0","Players"]].map(([v, l]) => (
            <div key={l} className="stat-cell"><div className="stat-n">{v}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="wrap" style={{ maxWidth: 460 }}>
        {resultsIn > 0 && <div className="alert alert-g">📊 {resultsIn} results in — leaderboard is live!</div>}
        {isClosed && <div className="alert alert-r">🔒 Predictions closed — tournament is underway!</div>}
        {regLocked && !isClosed && <div className="alert alert-y">🔒 Registration is currently closed. Contact the admin to join.</div>}
        <div className="card">
          <div className="shead" style={{ fontSize: 14, marginBottom: "0.75rem" }}>Enter your name to play</div>
          <input className="inp" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onLogin()} placeholder='Your name (or "admin" for admin panel)...' style={{ marginBottom: 10 }} autoFocus />
          <button className="btn btn-y btn-full" onClick={onLogin}>{isClosed ? "View my predictions" : "Make my predictions →"}</button>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center" }}>Predictions close: {mytD} MYT</div>
        </div>
        <button className="btn btn-s btn-full" onClick={onLB} style={{ marginBottom: 12 }}>🏅 View Leaderboard</button>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>How to play</div>
          {[["⚽","Pick win / draw / loss for all 72 group stage matches"],["🏆","Pick the ultimate World Cup champion"],["🔒","Predictions lock at first kickoff (Jun 11, 3PM MYT)"],["📊","Admin enters results after each match"],["🥇","Highest accuracy % wins the challenge"]].map(([ic, tx]) => (
            <div key={tx} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{ic}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{tx}</span>
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
      <div style={{ background: "linear-gradient(160deg,#0d1b3e,#1a0a2e)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-s btn-sm" onClick={onBack}>← Exit</button>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>🔐 Admin Panel</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{entered}/72 results · {Object.keys(allUsers).length} participants</div>
            </div>
          </div>
        </div>
      </div>
      <div className="nav">
        {[["results","Results"],["knockout","Knockout"],["standings","Standings"],["players","Players"],["settings","Settings"]].map(([t, l]) => (
          <button key={t} className={`ntab${adminTab === t ? " on" : ""}`} onClick={() => setAdminTab(t)}>{l}</button>
        ))}
      </div>
      <div className="wrap">
        {adminTab === "results" && (
          <>
            <div className="card">
              <div className="shead" style={{ fontSize: 13, marginBottom: 10 }}>🏆 World Cup Champion</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 5, maxHeight: 200, overflowY: "auto" }}>
                {allTeams.map(t => (
                  <button key={t} className={`champ-btn${champInput === t ? " on" : ""}`} onClick={() => setChampInput(t)} style={{ padding: "7px 4px" }}>
                    <FlagImg team={t} size={22} />
                    <div className={`champ-name${champInput === t ? " on" : ""}`} style={{ fontSize: 10 }}>{t}</div>
                  </button>
                ))}
              </div>
              {champInput && <button className="btn btn-g btn-full" style={{ marginTop: 10 }} onClick={() => onSaveChamp(champInput)}>✓ Set {champInput} as Champion</button>}
              {officialChamp && <div className="alert alert-g" style={{ marginTop: 8 }}>Current champion: {officialChamp}</div>}
            </div>
            <div className="stabs">
              {STAGES.map(s => <button key={s} className={`stab${filterStage === s ? " on" : ""}`} style={filterStage === s ? { background: STAGE_COLORS[s] || "#3b82f6" } : {}} onClick={() => setFilterStage(s)}>{s}</button>)}
            </div>
            <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team..." style={{ marginBottom: 10 }} />
            <div className="alert alert-y" style={{ marginBottom: 10 }}>Click a result to save instantly · Green = result entered</div>
            {Object.entries(grouped(getFiltered())).map(([d, ms]) => (
              <div key={d}>
                <div className="divider"><div className="div-line" /><div className="div-txt">{ms[0].date}</div><div className="div-line" /></div>
                {ms.map(m => <MatchCard key={m.id} match={m} pick={null} result={results[m.id]} onPick={() => {}} isClosed={true} isGroup={m.stage.startsWith("Group")} isAdmin={true} onAdminPick={onSaveResult} onAdminClear={onClearResult} />)}
              </div>
            ))}
          </>
        )}

        {adminTab === "knockout" && (
          <>
            <div className="alert alert-b" style={{ marginBottom: 12 }}>Teams auto-populated from group standings. Override manually if needed.</div>
            <div className="stabs">
              {["Round of 32","Round of 16","Quarterfinal","Semifinal","3rd Place","Final"].map(s => (
                <button key={s} className={`stab${filterStage === s ? " on" : ""}`} style={filterStage === s ? { background: STAGE_COLORS[s] } : {}} onClick={() => setFilterStage(s)}>{s}</button>
              ))}
            </div>
            {buildKnockout().filter(m => m.stage === (filterStage === "Group Stage" ? "Round of 32" : filterStage)).map(m => (
              <div key={m.id} className="card" style={{ padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Match #{m.id} · {m.date} · {m.time} MYT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Home</div>
                    <input className="inp-sm" value={koEdits[`${m.id}_h`] !== undefined ? koEdits[`${m.id}_h`] : (knockoutTeams[m.id]?.home || m.home)} onChange={e => setKoEdits(x => ({ ...x, [`${m.id}_h`]: e.target.value }))} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>vs</div>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>Away</div>
                    <input className="inp-sm" value={koEdits[`${m.id}_a`] !== undefined ? koEdits[`${m.id}_a`] : (knockoutTeams[m.id]?.away || m.away)} onChange={e => setKoEdits(x => ({ ...x, [`${m.id}_a`]: e.target.value }))} />
                  </div>
                </div>
                <button className="btn btn-g btn-sm" style={{ marginTop: 8 }} onClick={() => {
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
            <div className="alert alert-b" style={{ marginBottom: 12 }}>Live standings from results. Top 2 auto-advance to knockout rounds.</div>
            {Object.keys(standings).sort().map(g => (
              <div key={g} className="card" style={{ marginBottom: 10 }}>
                <div className="shead" style={{ fontSize: 13, marginBottom: 8 }}>Group {g}</div>
                <table className="table">
                  <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
                  <tbody>
                    {standings[g].map((t, i) => (
                      <tr key={t.team}>
                        <td style={{ color: i < 2 ? "#eab308" : undefined, fontWeight: i < 2 ? 600 : 400 }}>
                          {i < 2 ? "→ " : ""}{t.team}
                        </td>
                        <td>{t.p}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
                        <td style={{ fontWeight: 700, color: i < 2 ? "#eab308" : undefined }}>{t.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {Object.keys(standings).length === 0 && <div className="card" style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "2rem" }}>No results entered yet.</div>}
          </>
        )}

        {adminTab === "players" && (
          <>
            <div className="shead">Manage Players ({Object.keys(allUsers).length})</div>
            <div className="alert alert-y" style={{ marginBottom: 12 }}>Deleting an entry is permanent and cannot be undone.</div>
            {Object.keys(allUsers).length === 0 && <div className="card" style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "2rem" }}>No players yet.</div>}
            {leaderboard.map((u, i) => (
              <div key={u.name} className="user-row">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {u.pickCount}/72 picks · Champion: {u.champion || "—"}
                      {u.pct !== null ? ` · ${u.pct}% accuracy` : ""}
                    </div>
                  </div>
                </div>
                <button className="btn btn-r btn-sm" onClick={() => onDeleteUser(u.name)}>Delete</button>
              </div>
            ))}
          </>
        )}

        {adminTab === "settings" && (
          <>
            <div className="shead">Settings</div>
            <div className="card">
              <div className="toggle-row">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Lock registrations</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {settings.registrationLocked ? "🔒 New players cannot register" : "🔓 New players can register"}
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.registrationLocked} onChange={onToggleReg} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>Admin password</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                To change the admin password, update the <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>ADMIN_PW</code> constant in <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>App.jsx</code> and redeploy.
              </div>
            </div>
          </>
        )}

        {adminTab === "leaderboard" && <LBContent leaderboard={leaderboard} resultsIn={Object.keys(results).length} officialChamp={officialChamp} />}
      </div>
    </>
  );
}

function LeaderboardScreen({ leaderboard, officialChamp, resultsIn, onBack, count }) {
  return (
    <>
      <div style={{ background: "linear-gradient(160deg,#0d1b3e,#1a0a2e)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-s btn-sm" onClick={onBack}>← Back</button>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>🏅 Leaderboard</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{count} players · {resultsIn}/72 results{officialChamp ? ` · Champion: ${officialChamp}` : ""}</div>
          </div>
        </div>
      </div>
      <div className="wrap"><LBContent leaderboard={leaderboard} resultsIn={resultsIn} officialChamp={officialChamp} /></div>
    </>
  );
}

function LBContent({ leaderboard, resultsIn, officialChamp }) {
  if (resultsIn === 0) return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
      <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>No results yet</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Accuracy % appears once admin enters match results</div>
    </div>
  );
  if (!leaderboard.length) return (
    <div className="card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
      <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>No players yet</div>
    </div>
  );
  return (
    <div>
      {leaderboard.map((u, i) => (
        <div key={u.name} className="lb-row" style={{ borderColor: i === 0 && u.pct !== null ? "rgba(234,179,8,0.3)" : undefined, background: i === 0 && u.pct !== null ? "linear-gradient(135deg,#111827,#1a1400)" : undefined }}>
          <div className="lb-rank" style={{ color: i === 0 ? "#eab308" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "rgba(255,255,255,0.25)", fontSize: i < 3 ? 20 : 15 }}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="lb-n">{u.name}</div>
            <div className="lb-d">
              {u.matchCorrect}/{u.matchTotal} matches
              {u.champion ? ` · ${u.champion}${u.champCorrect === 1 ? " ✓" : ""}` : ""}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {u.pct !== null
              ? <><div className="lb-pct" style={{ color: i === 0 ? "#eab308" : "#e2e8f0" }}>{u.pct}%</div><div className="lb-sub">{u.correct}/{u.total} correct</div></>
              : <><div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{u.pickCount}/72 picks</div><div className="lb-sub">awaiting results</div></>}
          </div>
        </div>
      ))}
    </div>
  );
}
