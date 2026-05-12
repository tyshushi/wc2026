import { useState, useEffect } from 'react';
import { storageGet, storageSet } from './supabase';

// ─── FLAGS ────────────────────────────────────────────────────────────────────
const FLAG_CODE = {
  Mexico: 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  Czechia: 'cz',
  Canada: 'ca',
  'Bosnia & Herzegovina': 'ba',
  USA: 'us',
  Paraguay: 'py',
  Qatar: 'qa',
  Switzerland: 'ch',
  Brazil: 'br',
  Morocco: 'ma',
  Haiti: 'ht',
  Scotland: 'gb-sct',
  Australia: 'au',
  Türkiye: 'tr',
  Germany: 'de',
  Curaçao: 'cw',
  Netherlands: 'nl',
  Japan: 'jp',
  'Ivory Coast': 'ci',
  Ecuador: 'ec',
  Sweden: 'se',
  Tunisia: 'tn',
  Spain: 'es',
  'Cape Verde': 'cv',
  Belgium: 'be',
  Egypt: 'eg',
  'Saudi Arabia': 'sa',
  Uruguay: 'uy',
  Iran: 'ir',
  'New Zealand': 'nz',
  France: 'fr',
  Senegal: 'sn',
  Iraq: 'iq',
  Norway: 'no',
  Argentina: 'ar',
  Algeria: 'dz',
  Austria: 'at',
  Jordan: 'jo',
  Portugal: 'pt',
  'DR Congo': 'cd',
  England: 'gb-eng',
  Croatia: 'hr',
  Ghana: 'gh',
  Panama: 'pa',
  Uzbekistan: 'uz',
  Colombia: 'co',
};
const EMOJI = {
  Mexico: '🇲🇽',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  Czechia: '🇨🇿',
  Canada: '🇨🇦',
  'Bosnia & Herzegovina': '🇧🇦',
  USA: '🇺🇸',
  Paraguay: '🇵🇾',
  Qatar: '🇶🇦',
  Switzerland: '🇨🇭',
  Brazil: '🇧🇷',
  Morocco: '🇲🇦',
  Haiti: '🇭🇹',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Australia: '🇦🇺',
  Türkiye: '🇹🇷',
  Germany: '🇩🇪',
  Curaçao: '🇨🇼',
  Netherlands: '🇳🇱',
  Japan: '🇯🇵',
  'Ivory Coast': '🇨🇮',
  Ecuador: '🇪🇨',
  Sweden: '🇸🇪',
  Tunisia: '🇹🇳',
  Spain: '🇪🇸',
  'Cape Verde': '🇨🇻',
  Belgium: '🇧🇪',
  Egypt: '🇪🇬',
  'Saudi Arabia': '🇸🇦',
  Uruguay: '🇺🇾',
  Iran: '🇮🇷',
  'New Zealand': '🇳🇿',
  France: '🇫🇷',
  Senegal: '🇸🇳',
  Iraq: '🇮🇶',
  Norway: '🇳🇴',
  Argentina: '🇦🇷',
  Algeria: '🇩🇿',
  Austria: '🇦🇹',
  Jordan: '🇯🇴',
  Portugal: '🇵🇹',
  'DR Congo': '🇨🇩',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Croatia: '🇭🇷',
  Ghana: '🇬🇭',
  Panama: '🇵🇦',
  Uzbekistan: '🇺🇿',
  Colombia: '🇨🇴',
};
function Flag({ team, size = 28 }) {
  const [err, setErr] = useState(false);
  const code = FLAG_CODE[team];
  if (!code || err)
    return (
      <span style={{ fontSize: size * 0.78, lineHeight: 1 }}>
        {EMOJI[team] || '⚽'}
      </span>
    );
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/${code}.svg`}
      alt={team}
      onError={() => setErr(true)}
      style={{
        width: Math.round(size * 1.45),
        height: size,
        objectFit: 'cover',
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

// ─── TIME ─────────────────────────────────────────────────────────────────────
function etToMYT(dateStr, timeStr) {
  const isPM = timeStr.includes('p.m.'),
    isAM = timeStr.includes('a.m.');
  const clean = timeStr.replace(/\s?(a\.m\.|p\.m\.)/, '').trim();
  let [h, m] = clean.includes(':')
    ? clean.split(':').map(Number)
    : [parseInt(clean), 0];
  if (isNaN(m)) m = 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  const mytMin = h * 60 + m + 4 * 60 + 8 * 60;
  const dayOver = Math.floor(mytMin / 1440),
    tod = ((mytMin % 1440) + 1440) % 1440;
  const mh = Math.floor(tod / 60),
    mm = tod % 60;
  const disp = `${mh % 12 === 0 ? 12 : mh % 12}:${mm
    .toString()
    .padStart(2, '0')} ${mh >= 12 ? 'PM' : 'AM'}`;
  const [y, mo, d] = dateStr.split('-').map(Number);
  const base = new Date(Date.UTC(y, mo - 1, d + dayOver));
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    time: disp,
    date: `${days[base.getUTCDay()]}, ${
      months[base.getUTCMonth()]
    } ${base.getUTCDate()}`,
    rawDate: dateStr,
  };
}

// ─── GROUP MATCHES ────────────────────────────────────────────────────────────
const GROUP_RAW = [
  {
    id: 1,
    grp: 'A',
    date: '2026-06-11',
    et: '3 p.m.',
    home: 'Mexico',
    away: 'South Africa',
    venue: 'Mexico City',
  },
  {
    id: 2,
    grp: 'A',
    date: '2026-06-11',
    et: '10 p.m.',
    home: 'South Korea',
    away: 'Czechia',
    venue: 'Guadalajara',
  },
  {
    id: 3,
    grp: 'B',
    date: '2026-06-12',
    et: '3 p.m.',
    home: 'Canada',
    away: 'Bosnia & Herzegovina',
    venue: 'Toronto',
  },
  {
    id: 4,
    grp: 'D',
    date: '2026-06-12',
    et: '9 p.m.',
    home: 'USA',
    away: 'Paraguay',
    venue: 'Los Angeles',
  },
  {
    id: 5,
    grp: 'B',
    date: '2026-06-13',
    et: '3 p.m.',
    home: 'Qatar',
    away: 'Switzerland',
    venue: 'San Francisco Bay Area',
  },
  {
    id: 6,
    grp: 'C',
    date: '2026-06-13',
    et: '6 p.m.',
    home: 'Brazil',
    away: 'Morocco',
    venue: 'New York / New Jersey',
  },
  {
    id: 7,
    grp: 'C',
    date: '2026-06-13',
    et: '9 p.m.',
    home: 'Haiti',
    away: 'Scotland',
    venue: 'Boston',
  },
  {
    id: 8,
    grp: 'D',
    date: '2026-06-14',
    et: '12 p.m.',
    home: 'Australia',
    away: 'Türkiye',
    venue: 'Vancouver',
  },
  {
    id: 9,
    grp: 'E',
    date: '2026-06-14',
    et: '1 p.m.',
    home: 'Germany',
    away: 'Curaçao',
    venue: 'Houston',
  },
  {
    id: 10,
    grp: 'F',
    date: '2026-06-14',
    et: '4 p.m.',
    home: 'Netherlands',
    away: 'Japan',
    venue: 'Dallas',
  },
  {
    id: 11,
    grp: 'E',
    date: '2026-06-14',
    et: '7 p.m.',
    home: 'Ivory Coast',
    away: 'Ecuador',
    venue: 'Philadelphia',
  },
  {
    id: 12,
    grp: 'F',
    date: '2026-06-14',
    et: '10 p.m.',
    home: 'Sweden',
    away: 'Tunisia',
    venue: 'Monterrey',
  },
  {
    id: 13,
    grp: 'H',
    date: '2026-06-15',
    et: '12 p.m.',
    home: 'Spain',
    away: 'Cape Verde',
    venue: 'Atlanta',
  },
  {
    id: 14,
    grp: 'G',
    date: '2026-06-15',
    et: '3 p.m.',
    home: 'Belgium',
    away: 'Egypt',
    venue: 'Seattle',
  },
  {
    id: 15,
    grp: 'H',
    date: '2026-06-15',
    et: '6 p.m.',
    home: 'Saudi Arabia',
    away: 'Uruguay',
    venue: 'Miami',
  },
  {
    id: 16,
    grp: 'G',
    date: '2026-06-15',
    et: '9 p.m.',
    home: 'Iran',
    away: 'New Zealand',
    venue: 'Los Angeles',
  },
  {
    id: 17,
    grp: 'I',
    date: '2026-06-16',
    et: '3 p.m.',
    home: 'France',
    away: 'Senegal',
    venue: 'New York / New Jersey',
  },
  {
    id: 18,
    grp: 'I',
    date: '2026-06-16',
    et: '6 p.m.',
    home: 'Iraq',
    away: 'Norway',
    venue: 'Boston',
  },
  {
    id: 19,
    grp: 'J',
    date: '2026-06-16',
    et: '9 p.m.',
    home: 'Argentina',
    away: 'Algeria',
    venue: 'Kansas City',
  },
  {
    id: 20,
    grp: 'J',
    date: '2026-06-17',
    et: '12 a.m.',
    home: 'Austria',
    away: 'Jordan',
    venue: 'San Francisco Bay Area',
  },
  {
    id: 21,
    grp: 'K',
    date: '2026-06-17',
    et: '1 p.m.',
    home: 'Portugal',
    away: 'DR Congo',
    venue: 'Houston',
  },
  {
    id: 22,
    grp: 'L',
    date: '2026-06-17',
    et: '4 p.m.',
    home: 'England',
    away: 'Croatia',
    venue: 'Dallas',
  },
  {
    id: 23,
    grp: 'L',
    date: '2026-06-17',
    et: '7 p.m.',
    home: 'Ghana',
    away: 'Panama',
    venue: 'Toronto',
  },
  {
    id: 24,
    grp: 'K',
    date: '2026-06-17',
    et: '10 p.m.',
    home: 'Uzbekistan',
    away: 'Colombia',
    venue: 'Mexico City',
  },
  {
    id: 25,
    grp: 'A',
    date: '2026-06-18',
    et: '12 p.m.',
    home: 'Czechia',
    away: 'South Africa',
    venue: 'Atlanta',
  },
  {
    id: 26,
    grp: 'B',
    date: '2026-06-18',
    et: '3 p.m.',
    home: 'Switzerland',
    away: 'Bosnia & Herzegovina',
    venue: 'Los Angeles',
  },
  {
    id: 27,
    grp: 'B',
    date: '2026-06-18',
    et: '6 p.m.',
    home: 'Canada',
    away: 'Qatar',
    venue: 'Vancouver',
  },
  {
    id: 28,
    grp: 'A',
    date: '2026-06-18',
    et: '9 p.m.',
    home: 'Mexico',
    away: 'South Korea',
    venue: 'Guadalajara',
  },
  {
    id: 29,
    grp: 'D',
    date: '2026-06-19',
    et: '3 p.m.',
    home: 'USA',
    away: 'Australia',
    venue: 'Seattle',
  },
  {
    id: 30,
    grp: 'C',
    date: '2026-06-19',
    et: '6 p.m.',
    home: 'Scotland',
    away: 'Morocco',
    venue: 'Boston',
  },
  {
    id: 31,
    grp: 'C',
    date: '2026-06-19',
    et: '8:30 p.m.',
    home: 'Brazil',
    away: 'Haiti',
    venue: 'Philadelphia',
  },
  {
    id: 32,
    grp: 'D',
    date: '2026-06-19',
    et: '11 p.m.',
    home: 'Türkiye',
    away: 'Paraguay',
    venue: 'San Francisco Bay Area',
  },
  {
    id: 33,
    grp: 'F',
    date: '2026-06-20',
    et: '1 p.m.',
    home: 'Netherlands',
    away: 'Sweden',
    venue: 'Houston',
  },
  {
    id: 34,
    grp: 'E',
    date: '2026-06-20',
    et: '4 p.m.',
    home: 'Germany',
    away: 'Ivory Coast',
    venue: 'Toronto',
  },
  {
    id: 35,
    grp: 'E',
    date: '2026-06-20',
    et: '8 p.m.',
    home: 'Ecuador',
    away: 'Curaçao',
    venue: 'Kansas City',
  },
  {
    id: 36,
    grp: 'F',
    date: '2026-06-21',
    et: '12 a.m.',
    home: 'Tunisia',
    away: 'Japan',
    venue: 'Monterrey',
  },
  {
    id: 37,
    grp: 'H',
    date: '2026-06-21',
    et: '12 p.m.',
    home: 'Spain',
    away: 'Saudi Arabia',
    venue: 'Atlanta',
  },
  {
    id: 38,
    grp: 'G',
    date: '2026-06-21',
    et: '3 p.m.',
    home: 'Belgium',
    away: 'Iran',
    venue: 'Los Angeles',
  },
  {
    id: 39,
    grp: 'H',
    date: '2026-06-21',
    et: '6 p.m.',
    home: 'Uruguay',
    away: 'Cape Verde',
    venue: 'Miami',
  },
  {
    id: 40,
    grp: 'G',
    date: '2026-06-21',
    et: '9 p.m.',
    home: 'New Zealand',
    away: 'Egypt',
    venue: 'Vancouver',
  },
  {
    id: 41,
    grp: 'J',
    date: '2026-06-22',
    et: '1 p.m.',
    home: 'Argentina',
    away: 'Austria',
    venue: 'Dallas',
  },
  {
    id: 42,
    grp: 'I',
    date: '2026-06-22',
    et: '5 p.m.',
    home: 'France',
    away: 'Iraq',
    venue: 'Philadelphia',
  },
  {
    id: 43,
    grp: 'I',
    date: '2026-06-22',
    et: '8 p.m.',
    home: 'Norway',
    away: 'Senegal',
    venue: 'New York / New Jersey',
  },
  {
    id: 44,
    grp: 'J',
    date: '2026-06-22',
    et: '11 p.m.',
    home: 'Jordan',
    away: 'Algeria',
    venue: 'San Francisco Bay Area',
  },
  {
    id: 45,
    grp: 'K',
    date: '2026-06-23',
    et: '1 p.m.',
    home: 'Portugal',
    away: 'Uzbekistan',
    venue: 'Houston',
  },
  {
    id: 46,
    grp: 'L',
    date: '2026-06-23',
    et: '4 p.m.',
    home: 'England',
    away: 'Ghana',
    venue: 'Boston',
  },
  {
    id: 47,
    grp: 'L',
    date: '2026-06-23',
    et: '7 p.m.',
    home: 'Panama',
    away: 'Croatia',
    venue: 'Toronto',
  },
  {
    id: 48,
    grp: 'K',
    date: '2026-06-23',
    et: '10 p.m.',
    home: 'Colombia',
    away: 'DR Congo',
    venue: 'Guadalajara',
  },
  {
    id: 49,
    grp: 'B',
    date: '2026-06-24',
    et: '3 p.m.',
    home: 'Switzerland',
    away: 'Canada',
    venue: 'Vancouver',
  },
  {
    id: 50,
    grp: 'B',
    date: '2026-06-24',
    et: '3 p.m.',
    home: 'Bosnia & Herzegovina',
    away: 'Qatar',
    venue: 'Seattle',
  },
  {
    id: 51,
    grp: 'C',
    date: '2026-06-24',
    et: '6 p.m.',
    home: 'Scotland',
    away: 'Brazil',
    venue: 'Miami',
  },
  {
    id: 52,
    grp: 'C',
    date: '2026-06-24',
    et: '6 p.m.',
    home: 'Morocco',
    away: 'Haiti',
    venue: 'Atlanta',
  },
  {
    id: 53,
    grp: 'A',
    date: '2026-06-24',
    et: '9 p.m.',
    home: 'Czechia',
    away: 'Mexico',
    venue: 'Mexico City',
  },
  {
    id: 54,
    grp: 'A',
    date: '2026-06-24',
    et: '9 p.m.',
    home: 'South Africa',
    away: 'South Korea',
    venue: 'Monterrey',
  },
  {
    id: 55,
    grp: 'E',
    date: '2026-06-25',
    et: '4 p.m.',
    home: 'Curaçao',
    away: 'Ivory Coast',
    venue: 'Philadelphia',
  },
  {
    id: 56,
    grp: 'E',
    date: '2026-06-25',
    et: '4 p.m.',
    home: 'Ecuador',
    away: 'Germany',
    venue: 'New York / New Jersey',
  },
  {
    id: 57,
    grp: 'F',
    date: '2026-06-25',
    et: '7 p.m.',
    home: 'Japan',
    away: 'Sweden',
    venue: 'Dallas',
  },
  {
    id: 58,
    grp: 'F',
    date: '2026-06-25',
    et: '7 p.m.',
    home: 'Tunisia',
    away: 'Netherlands',
    venue: 'Kansas City',
  },
  {
    id: 59,
    grp: 'D',
    date: '2026-06-25',
    et: '10 p.m.',
    home: 'Türkiye',
    away: 'USA',
    venue: 'Los Angeles',
  },
  {
    id: 60,
    grp: 'D',
    date: '2026-06-25',
    et: '10 p.m.',
    home: 'Paraguay',
    away: 'Australia',
    venue: 'San Francisco Bay Area',
  },
  {
    id: 61,
    grp: 'I',
    date: '2026-06-26',
    et: '3 p.m.',
    home: 'Norway',
    away: 'France',
    venue: 'Boston',
  },
  {
    id: 62,
    grp: 'I',
    date: '2026-06-26',
    et: '3 p.m.',
    home: 'Senegal',
    away: 'Iraq',
    venue: 'Toronto',
  },
  {
    id: 63,
    grp: 'H',
    date: '2026-06-26',
    et: '8 p.m.',
    home: 'Cape Verde',
    away: 'Saudi Arabia',
    venue: 'Houston',
  },
  {
    id: 64,
    grp: 'H',
    date: '2026-06-26',
    et: '8 p.m.',
    home: 'Uruguay',
    away: 'Spain',
    venue: 'Guadalajara',
  },
  {
    id: 65,
    grp: 'G',
    date: '2026-06-26',
    et: '11 p.m.',
    home: 'Egypt',
    away: 'Iran',
    venue: 'Seattle',
  },
  {
    id: 66,
    grp: 'G',
    date: '2026-06-26',
    et: '11 p.m.',
    home: 'New Zealand',
    away: 'Belgium',
    venue: 'Vancouver',
  },
  {
    id: 67,
    grp: 'L',
    date: '2026-06-27',
    et: '5 p.m.',
    home: 'Panama',
    away: 'England',
    venue: 'New York / New Jersey',
  },
  {
    id: 68,
    grp: 'L',
    date: '2026-06-27',
    et: '5 p.m.',
    home: 'Croatia',
    away: 'Ghana',
    venue: 'Philadelphia',
  },
  {
    id: 69,
    grp: 'K',
    date: '2026-06-27',
    et: '7:30 p.m.',
    home: 'Colombia',
    away: 'Portugal',
    venue: 'Miami',
  },
  {
    id: 70,
    grp: 'K',
    date: '2026-06-27',
    et: '7:30 p.m.',
    home: 'DR Congo',
    away: 'Uzbekistan',
    venue: 'Atlanta',
  },
  {
    id: 71,
    grp: 'J',
    date: '2026-06-27',
    et: '10 p.m.',
    home: 'Algeria',
    away: 'Austria',
    venue: 'Kansas City',
  },
  {
    id: 72,
    grp: 'J',
    date: '2026-06-27',
    et: '10 p.m.',
    home: 'Jordan',
    away: 'Argentina',
    venue: 'Dallas',
  },
];

// ─── KNOCKOUT BRACKET ─────────────────────────────────────────────────────────
const KO_DEF = [
  {
    id: 73,
    stage: 'R32',
    date: '2026-06-28',
    et: '3 p.m.',
    homeSlot: { type: 'runner', grp: 'A' },
    awaySlot: { type: 'runner', grp: 'B' },
    venue: 'Los Angeles',
  },
  {
    id: 74,
    stage: 'R32',
    date: '2026-06-29',
    et: '1 p.m.',
    homeSlot: { type: 'winner', grp: 'E' },
    awaySlot: { type: 'best3rd', groups: ['A', 'B', 'C', 'D', 'F'] },
    venue: 'Boston',
  },
  {
    id: 75,
    stage: 'R32',
    date: '2026-06-29',
    et: '4:30 p.m.',
    homeSlot: { type: 'winner', grp: 'F' },
    awaySlot: { type: 'runner', grp: 'C' },
    venue: 'Monterrey',
  },
  {
    id: 76,
    stage: 'R32',
    date: '2026-06-29',
    et: '9 p.m.',
    homeSlot: { type: 'winner', grp: 'C' },
    awaySlot: { type: 'runner', grp: 'F' },
    venue: 'Houston',
  },
  {
    id: 77,
    stage: 'R32',
    date: '2026-06-30',
    et: '5 p.m.',
    homeSlot: { type: 'winner', grp: 'I' },
    awaySlot: { type: 'best3rd', groups: ['C', 'D', 'F', 'G', 'H'] },
    venue: 'New York / New Jersey',
  },
  {
    id: 78,
    stage: 'R32',
    date: '2026-06-30',
    et: '1 p.m.',
    homeSlot: { type: 'runner', grp: 'E' },
    awaySlot: { type: 'runner', grp: 'I' },
    venue: 'Dallas',
  },
  {
    id: 79,
    stage: 'R32',
    date: '2026-06-30',
    et: '9 p.m.',
    homeSlot: { type: 'winner', grp: 'A' },
    awaySlot: { type: 'best3rd', groups: ['C', 'E', 'F', 'H', 'I'] },
    venue: 'Mexico City',
  },
  {
    id: 80,
    stage: 'R32',
    date: '2026-07-01',
    et: '12 p.m.',
    homeSlot: { type: 'winner', grp: 'L' },
    awaySlot: { type: 'best3rd', groups: ['E', 'H', 'I', 'J', 'K'] },
    venue: 'Atlanta',
  },
  {
    id: 81,
    stage: 'R32',
    date: '2026-07-01',
    et: '8 p.m.',
    homeSlot: { type: 'winner', grp: 'D' },
    awaySlot: { type: 'best3rd', groups: ['B', 'E', 'F', 'I', 'J'] },
    venue: 'San Francisco Bay Area',
  },
  {
    id: 82,
    stage: 'R32',
    date: '2026-07-01',
    et: '4 p.m.',
    homeSlot: { type: 'winner', grp: 'G' },
    awaySlot: { type: 'best3rd', groups: ['A', 'E', 'H', 'I', 'J'] },
    venue: 'Seattle',
  },
  {
    id: 83,
    stage: 'R32',
    date: '2026-07-02',
    et: '7 p.m.',
    homeSlot: { type: 'runner', grp: 'K' },
    awaySlot: { type: 'runner', grp: 'L' },
    venue: 'Toronto',
  },
  {
    id: 84,
    stage: 'R32',
    date: '2026-07-02',
    et: '3 p.m.',
    homeSlot: { type: 'winner', grp: 'H' },
    awaySlot: { type: 'runner', grp: 'J' },
    venue: 'Los Angeles',
  },
  {
    id: 85,
    stage: 'R32',
    date: '2026-07-02',
    et: '11 p.m.',
    homeSlot: { type: 'winner', grp: 'B' },
    awaySlot: { type: 'best3rd', groups: ['E', 'F', 'G', 'I', 'J'] },
    venue: 'Vancouver',
  },
  {
    id: 86,
    stage: 'R32',
    date: '2026-07-03',
    et: '6 p.m.',
    homeSlot: { type: 'winner', grp: 'J' },
    awaySlot: { type: 'runner', grp: 'H' },
    venue: 'Miami',
  },
  {
    id: 87,
    stage: 'R32',
    date: '2026-07-03',
    et: '9:30 p.m.',
    homeSlot: { type: 'winner', grp: 'K' },
    awaySlot: { type: 'best3rd', groups: ['D', 'E', 'I', 'J', 'L'] },
    venue: 'Kansas City',
  },
  {
    id: 88,
    stage: 'R32',
    date: '2026-07-03',
    et: '2 p.m.',
    homeSlot: { type: 'runner', grp: 'D' },
    awaySlot: { type: 'runner', grp: 'G' },
    venue: 'Dallas',
  },
  {
    id: 89,
    stage: 'R16',
    date: '2026-07-04',
    et: '1 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 74 },
    awaySlot: { type: 'winnerOf', matchId: 77 },
    venue: 'Philadelphia',
  },
  {
    id: 90,
    stage: 'R16',
    date: '2026-07-04',
    et: '5 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 73 },
    awaySlot: { type: 'winnerOf', matchId: 75 },
    venue: 'Houston',
  },
  {
    id: 91,
    stage: 'R16',
    date: '2026-07-05',
    et: '4 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 76 },
    awaySlot: { type: 'winnerOf', matchId: 78 },
    venue: 'New York / New Jersey',
  },
  {
    id: 92,
    stage: 'R16',
    date: '2026-07-05',
    et: '8 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 79 },
    awaySlot: { type: 'winnerOf', matchId: 80 },
    venue: 'Mexico City',
  },
  {
    id: 93,
    stage: 'R16',
    date: '2026-07-06',
    et: '3 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 83 },
    awaySlot: { type: 'winnerOf', matchId: 84 },
    venue: 'Dallas',
  },
  {
    id: 94,
    stage: 'R16',
    date: '2026-07-06',
    et: '8 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 81 },
    awaySlot: { type: 'winnerOf', matchId: 82 },
    venue: 'Seattle',
  },
  {
    id: 95,
    stage: 'R16',
    date: '2026-07-07',
    et: '5 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 86 },
    awaySlot: { type: 'winnerOf', matchId: 88 },
    venue: 'Atlanta',
  },
  {
    id: 96,
    stage: 'R16',
    date: '2026-07-07',
    et: '1 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 85 },
    awaySlot: { type: 'winnerOf', matchId: 87 },
    venue: 'Vancouver',
  },
  {
    id: 97,
    stage: 'QF',
    date: '2026-07-09',
    et: '4 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 89 },
    awaySlot: { type: 'winnerOf', matchId: 90 },
    venue: 'Boston',
  },
  {
    id: 98,
    stage: 'QF',
    date: '2026-07-10',
    et: '3 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 93 },
    awaySlot: { type: 'winnerOf', matchId: 94 },
    venue: 'Los Angeles',
  },
  {
    id: 99,
    stage: 'QF',
    date: '2026-07-11',
    et: '5 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 91 },
    awaySlot: { type: 'winnerOf', matchId: 92 },
    venue: 'Miami',
  },
  {
    id: 100,
    stage: 'QF',
    date: '2026-07-11',
    et: '9 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 95 },
    awaySlot: { type: 'winnerOf', matchId: 96 },
    venue: 'Kansas City',
  },
  {
    id: 101,
    stage: 'SF',
    date: '2026-07-14',
    et: '3 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 97 },
    awaySlot: { type: 'winnerOf', matchId: 98 },
    venue: 'Dallas',
  },
  {
    id: 102,
    stage: 'SF',
    date: '2026-07-15',
    et: '3 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 99 },
    awaySlot: { type: 'winnerOf', matchId: 100 },
    venue: 'Atlanta',
  },
  // 3rd place: losers of both SFs — pick the winner for 3rd place
  {
    id: 103,
    stage: '3P',
    date: '2026-07-18',
    et: '5 p.m.',
    homeSlot: { type: 'loserOf', matchId: 101 },
    awaySlot: { type: 'loserOf', matchId: 102 },
    venue: 'Miami',
  },
  {
    id: 104,
    stage: 'F',
    date: '2026-07-19',
    et: '3 p.m.',
    homeSlot: { type: 'winnerOf', matchId: 101 },
    awaySlot: { type: 'winnerOf', matchId: 102 },
    venue: 'New York / New Jersey',
  },
];

const BEST3RD_MATCHES = KO_DEF.filter((m) => m.awaySlot?.type === 'best3rd');
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const GROUP_MATCHES = GROUP_RAW.map((m) => ({
  ...m,
  stage: `Group ${m.grp}`,
  ...etToMYT(m.date, m.et),
}));
const STAGE_LABEL = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinal',
  SF: 'Semifinal',
  '3P': '3rd Place',
  F: 'Final',
};
const STAGE_COL = {
  R32: '#7c3aed',
  R16: '#b45309',
  QF: '#b45309',
  SF: '#dc2626',
  '3P': '#4b5563',
  F: '#1d4ed8',
};

// ─── STANDINGS ────────────────────────────────────────────────────────────────
function computeStandings(preds) {
  const groups = {};
  GROUP_MATCHES.forEach((m) => {
    if (!groups[m.grp]) groups[m.grp] = {};
    [m.home, m.away].forEach((t) => {
      if (!groups[m.grp][t])
        groups[m.grp][t] = {
          team: t,
          p: 0,
          w: 0,
          d: 0,
          l: 0,
          gf: 0,
          ga: 0,
          pts: 0,
        };
    });
    const r = preds[m.id];
    if (!r) return;
    const H = groups[m.grp][m.home],
      A = groups[m.grp][m.away];
    H.p++;
    A.p++;
    if (r === 'home') {
      H.w++;
      H.pts += 3;
      A.l++;
      H.gf++;
      A.ga++;
    } else if (r === 'away') {
      A.w++;
      A.pts += 3;
      H.l++;
      A.gf++;
      H.ga++;
    } else {
      H.d++;
      A.d++;
      H.pts++;
      A.pts++;
      H.gf++;
      A.gf++;
      H.ga++;
      A.ga++;
    }
  });
  const out = {};
  Object.keys(groups).forEach((g) => {
    out[g] = Object.values(groups[g]).sort(
      (a, b) =>
        b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || b.w - a.w
    );
  });
  return out;
}

// ─── RESOLVE TEAM ─────────────────────────────────────────────────────────────
// b3picks: { "b3_ABCDF": "Morocco", ... }  koWinners: { "w_73": "Brazil", ... }
function resolveTeam(slot, standings, b3picks, koWinners) {
  if (!slot) return null;
  if (slot.type === 'winner') return standings[slot.grp]?.[0]?.team || null;
  if (slot.type === 'runner') return standings[slot.grp]?.[1]?.team || null;
  if (slot.type === 'best3rd')
    return b3picks[`b3_${slot.groups.join('')}`] || null;
  if (slot.type === 'winnerOf') return koWinners[`w_${slot.matchId}`] || null;
  if (slot.type === 'loserOf') {
    const matchDef = KO_DEF.find((x) => x.id === slot.matchId);
    if (!matchDef) return null;
    const winner = koWinners[`w_${slot.matchId}`];
    if (!winner) return null;
    const h = resolveTeam(matchDef.homeSlot, standings, b3picks, koWinners);
    const a = resolveTeam(matchDef.awaySlot, standings, b3picks, koWinners);
    if (winner === h) return a;
    if (winner === a) return h;
    return null;
  }
  return null;
}

function buildKO(standings, b3picks, koWinners) {
  return KO_DEF.map((m) => ({
    ...m,
    ...etToMYT(m.date, m.et),
    home: resolveTeam(m.homeSlot, standings, b3picks, koWinners),
    away: resolveTeam(m.awaySlot, standings, b3picks, koWinners),
  }));
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const USERS_KEY = 'wc2026_users';
const RESULTS_KEY = 'wc2026_results';
const SETTINGS_KEY = 'wc2026_settings';
const ADMIN_PW = 'wc2026admin';
const DEFAULT_SETTINGS = {
  registrationLocked: false,
  deadline: '2026-06-11T07:00:00Z',
};

// ─── SCORING ──────────────────────────────────────────────────────────────────
function calcScore(
  userGroupPreds,
  userB3,
  userKOW,
  resultGroup,
  resultB3,
  resultKOW
) {
  let correct = 0,
    total = 0;
  GROUP_MATCHES.forEach((m) => {
    if (userGroupPreds[m.id] && resultGroup[m.id]) {
      total++;
      if (userGroupPreds[m.id] === resultGroup[m.id]) correct++;
    }
  });
  // best3rd picks scored: correct team in correct slot
  BEST3RD_MATCHES.forEach((m) => {
    const key = `b3_${m.awaySlot.groups.join('')}`;
    if (userB3[key] && resultB3[key]) {
      total++;
      if (userB3[key] === resultB3[key]) correct++;
    }
  });
  // knockout winners
  KO_DEF.forEach((m) => {
    if (userKOW[`w_${m.id}`] && resultKOW[`w_${m.id}`]) {
      total++;
      if (userKOW[`w_${m.id}`] === resultKOW[`w_${m.id}`]) correct++;
    }
  });
  return {
    correct,
    total,
    pct: total > 0 ? Math.round((correct / total) * 100) : null,
  };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const c = {
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    color: '#111827',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  wrap: { maxWidth: 680, margin: '0 auto', padding: '0 1rem 4rem' },
  wrapN: { maxWidth: 460, margin: '0 auto', padding: '0 1rem 4rem' },
  hero: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '2rem 1.5rem 0',
    textAlign: 'center',
  },
  statRow: {
    display: 'flex',
    borderTop: '1px solid #f3f4f6',
    marginTop: '1.5rem',
  },
  statCell: { flex: 1, padding: '12px 8px', textAlign: 'center' },
  // nav
  navBar: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    overflowX: 'auto',
  },
  navTab: {
    flex: 1,
    minWidth: 80,
    padding: '11px 6px',
    fontSize: 11,
    fontWeight: 600,
    border: 'none',
    background: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  navOn: { color: '#2563eb', borderBottomColor: '#2563eb' },
  subNav: {
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    overflowX: 'auto',
    paddingLeft: 12,
  },
  subTab: {
    padding: '8px 14px',
    fontSize: 11,
    fontWeight: 600,
    border: 'none',
    background: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  subOn: { color: '#2563eb', borderBottomColor: '#2563eb' },
  // common
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    marginBottom: 10,
  },
  cardSm: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  inp: {
    width: '100%',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '9px 13px',
    color: '#111827',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '9px 16px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  btnP: { background: '#2563eb', color: '#fff' },
  btnG: {
    background: '#dcfce7',
    color: '#15803d',
    border: '1px solid #86efac',
  },
  btnR: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  },
  btnQ: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  btnSm: { padding: '5px 11px', fontSize: 11 },
  btnFull: { width: '100%' },
  aY: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#92400e',
    marginBottom: 10,
  },
  aG: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#15803d',
    marginBottom: 10,
  },
  aR: {
    background: '#fff5f5',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#b91c1c',
    marginBottom: 10,
  },
  aB: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    color: '#1d4ed8',
    marginBottom: 10,
  },
  pbarWrap: { height: 3, background: '#f3f4f6' },
  pbar: { height: 3, background: '#2563eb', transition: 'width 0.4s' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    color: '#2563eb',
    flexShrink: 0,
  },
  dateDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '16px 0 8px',
  },
  dateLine: { flex: 1, height: 1, background: '#f3f4f6' },
  dateText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  th: {
    padding: '5px 7px',
    textAlign: 'left',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#9ca3af',
    fontWeight: 600,
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '6px 7px',
    borderBottom: '1px solid #f9fafb',
    color: '#374151',
  },
  toast: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111827',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13,
    color: '#fff',
    zIndex: 999,
    whiteSpace: 'nowrap',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  confirmBox: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.5rem',
    maxWidth: 340,
    width: '100%',
    textAlign: 'center',
  },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('home');
  const [username, setUsername] = useState('');
  const [nameInput, setNameInput] = useState('');
  // user predictions
  const [groupPreds, setGroupPreds] = useState({}); // {id: "home"|"away"|"draw"}
  const [userB3, setUserB3] = useState({}); // {"b3_ABCDF": "Morocco"}
  const [userKOW, setUserKOW] = useState({}); // {"w_73": "Brazil"}
  // shared data
  const [allUsers, setAllUsers] = useState({});
  const [resultGroup, setResultGroup] = useState({});
  const [resultB3, setResultB3] = useState({});
  const [resultKOW, setResultKOW] = useState({});
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  // UI
  const [mainTab, setMainTab] = useState('predictions');
  const [subTab, setSubTab] = useState('group');
  const [saved, setSaved] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const [adminErr, setAdminErr] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const deadline = new Date(settings.deadline || DEFAULT_SETTINGS.deadline);
  const isClosed = new Date() >= deadline;

  useEffect(() => {
    (async () => {
      try {
        const u = await storageGet(USERS_KEY);
        if (u?.value) setAllUsers(JSON.parse(u.value));
      } catch {}
      try {
        const r = await storageGet(RESULTS_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          setResultGroup(d.group || {});
          setResultB3(d.b3 || {});
          setResultKOW(d.ko || {});
        }
      } catch {}
      try {
        const s = await storageGet(SETTINGS_KEY);
        if (s?.value)
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s.value) });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };
  const saveUsers = async (u) => {
    await storageSet(USERS_KEY, JSON.stringify(u));
    setAllUsers(u);
  };
  const saveResults = async (grp, b3, ko) => {
    await storageSet(RESULTS_KEY, JSON.stringify({ group: grp, b3, ko }));
    setResultGroup(grp);
    setResultB3(b3);
    setResultKOW(ko);
  };
  const saveSettings = async (s) => {
    await storageSet(SETTINGS_KEY, JSON.stringify(s));
    setSettings(s);
  };

  const userStandings = computeStandings(groupPreds);
  const userKOMatches = buildKO(userStandings, userB3, userKOW);

  const totalPicks = (() => {
    const groupDone = GROUP_MATCHES.filter((m) => groupPreds[m.id]).length;
    const b3Done = BEST3RD_MATCHES.filter(
      (m) => userB3[`b3_${m.awaySlot.groups.join('')}`]
    ).length;
    const koDone = KO_DEF.filter((m) => userKOW[`w_${m.id}`]).length;
    const total = 72 + BEST3RD_MATCHES.length + KO_DEF.length;
    return { done: groupDone + b3Done + koDone, total };
  })();

  const leaderboard = Object.entries(allUsers)
    .map(([name, data]) => {
      const score = calcScore(
        data.groupPreds || {},
        data.userB3 || {},
        data.userKOW || {},
        resultGroup,
        resultB3,
        resultKOW
      );
      return {
        name,
        pickCount:
          Object.keys(data.groupPreds || {}).length +
          Object.keys(data.userB3 || {}).length +
          Object.keys(data.userKOW || {}).length,
        ...score,
      };
    })
    .sort((a, b) =>
      a.pct !== null && b.pct !== null
        ? b.pct - a.pct
        : a.pct !== null
        ? -1
        : b.pct !== null
        ? 1
        : b.pickCount - a.pickCount
    );

  function handleLogin() {
    const name = nameInput.trim();
    if (!name) return;
    if (name.toLowerCase() === 'admin') {
      setView('adminLogin');
      return;
    }
    if (!allUsers[name] && settings.registrationLocked) {
      showToast('Registration is closed.');
      return;
    }
    setUsername(name);
    const ex = allUsers[name];
    setGroupPreds(ex?.groupPreds || {});
    setUserB3(ex?.userB3 || {});
    setUserKOW(ex?.userKOW || {});
    setMainTab('predictions');
    setSubTab('group');
    setView('predict');
  }

  async function handleSave() {
    const upd = {
      ...allUsers,
      [username]: {
        groupPreds,
        userB3,
        userKOW,
        savedAt: new Date().toISOString(),
      },
    };
    await saveUsers(upd);
    setSaved(true);
    showToast('Predictions saved!');
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteUser(name) {
    const upd = { ...allUsers };
    delete upd[name];
    await saveUsers(upd);
    setConfirmDelete(null);
    showToast(`${name}'s entry deleted`);
  }

  const setGroupPick = (id, val) => {
    if (!isClosed) setGroupPreds((p) => ({ ...p, [id]: val }));
  };
  const setB3Pick = (key, val) => {
    if (!isClosed) setUserB3((p) => ({ ...p, [key]: val }));
  };
  const setKOPick = (matchId, team) => {
    if (!isClosed) setUserKOW((p) => ({ ...p, [`w_${matchId}`]: team }));
  };

  function handleFeelingLucky() {
    if (isClosed) return;
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 1. Fill all unpicked group matches
    const newGroupPreds = { ...groupPreds };
    GROUP_MATCHES.forEach((m) => {
      if (!newGroupPreds[m.id])
        newGroupPreds[m.id] = rand(['home', 'draw', 'away']);
    });

    // 2. Compute standings from the now-complete group picks
    const newStandings = computeStandings(newGroupPreds);

    // 3. Fill unpicked best-3rd slots using eligible teams from standings
    const newB3 = { ...userB3 };
    BEST3RD_MATCHES.forEach((m) => {
      const groups = m.awaySlot.groups;
      const key = `b3_${groups.join('')}`;
      if (!newB3[key]) {
        const eligible = groups
          .map((g) => newStandings[g]?.[2]?.team)
          .filter(Boolean);
        if (eligible.length > 0) newB3[key] = rand(eligible);
      }
    });

    // 4. Fill knockout picks round by round so each round has teams resolved
    const newKOW = { ...userKOW };
    const KO_STAGE_ORDER = ['R32', 'R16', 'QF', 'SF', '3P', 'F'];
    KO_STAGE_ORDER.forEach((stage) => {
      KO_DEF.filter((m) => m.stage === stage).forEach((m) => {
        if (!newKOW[`w_${m.id}`]) {
          const home = resolveTeam(m.homeSlot, newStandings, newB3, newKOW);
          const away = resolveTeam(m.awaySlot, newStandings, newB3, newKOW);
          const candidates = [home, away].filter(Boolean);
          if (candidates.length > 0) newKOW[`w_${m.id}`] = rand(candidates);
        }
      });
    });

    setGroupPreds(newGroupPreds);
    setUserB3(newB3);
    setUserKOW(newKOW);
    showToast('🍀 Lucky picks filled in! Review and save.');
  }

  if (loading)
    return (
      <div
        style={{
          ...c.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 40 }}>🏆</div>
        <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
      </div>
    );

  return (
    <div style={c.page}>
      {toast && <div style={c.toast}>{toast}</div>}
      {confirmDelete && (
        <div style={c.overlay}>
          <div style={c.confirmBox}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              Delete entry?
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Permanently deletes <strong>{confirmDelete}</strong>'s
              predictions.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...c.btn, ...c.btnQ, flex: 1 }}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...c.btn, ...c.btnR, flex: 1 }}
                onClick={() => handleDeleteUser(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'home' && (
        <HomeScreen
          nameInput={nameInput}
          setNameInput={setNameInput}
          onLogin={handleLogin}
          isClosed={isClosed}
          count={Object.keys(allUsers).length}
          resultsIn={Object.keys(resultGroup).length}
          onLB={() => setView('leaderboard')}
          deadline={deadline}
          regLocked={settings.registrationLocked}
        />
      )}

      {view === 'adminLogin' && (
        <div style={{ ...c.wrapN, paddingTop: '3rem' }}>
          <div style={c.card}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Admin access
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Enter password to manage results
              </div>
            </div>
            <input
              type="password"
              style={{ ...c.inp, marginBottom: 10 }}
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (adminPw === ADMIN_PW) {
                    setView('admin');
                    setAdminErr(false);
                  } else setAdminErr(true);
                }
              }}
              placeholder="Password..."
              autoFocus
            />
            {adminErr && (
              <div style={{ ...c.aR, marginBottom: 10 }}>
                Incorrect password
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...c.btn, ...c.btnQ, flex: 1 }}
                onClick={() => {
                  setView('home');
                  setAdminPw('');
                  setAdminErr(false);
                }}
              >
                ← Back
              </button>
              <button
                style={{ ...c.btn, ...c.btnP, flex: 1 }}
                onClick={() => {
                  if (adminPw === ADMIN_PW) {
                    setView('admin');
                    setAdminErr(false);
                  } else setAdminErr(true);
                }}
              >
                Login
              </button>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: '#9ca3af',
                textAlign: 'center',
              }}
            >
              Default: wc2026admin
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <AdminPanel
          resultGroup={resultGroup}
          resultB3={resultB3}
          resultKOW={resultKOW}
          settings={settings}
          allUsers={allUsers}
          leaderboard={leaderboard}
          onSaveResults={saveResults}
          onSaveSettings={saveSettings}
          onDeleteUser={(name) => setConfirmDelete(name)}
          onBack={() => setView('home')}
          showToast={showToast}
        />
      )}

      {view === 'leaderboard' && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          resultsIn={Object.keys(resultGroup).length}
          onBack={() => setView(username ? 'predict' : 'home')}
          count={Object.keys(allUsers).length}
        />
      )}

      {view === 'predict' && (
        <>
          <div style={c.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={c.avatar}>{username[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{username}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {totalPicks.done}/{totalPicks.total} picks ·{' '}
                  {Math.round((totalPicks.done / totalPicks.total) * 100)}% done
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                style={{ ...c.btn, ...c.btnQ, ...c.btnSm }}
                onClick={() => setView('leaderboard')}
              >
                Board
              </button>
              {!isClosed && (
                <button
                  style={{
                    ...c.btn,
                    ...c.btnSm,
                    background: '#fef9c3',
                    color: '#854d0e',
                    border: '1px solid #fde68a',
                  }}
                  onClick={handleFeelingLucky}
                >
                  🍀 Lucky
                </button>
              )}
              {!isClosed && (
                <button
                  style={{ ...c.btn, ...(saved ? c.btnG : c.btnP), ...c.btnSm }}
                  onClick={handleSave}
                >
                  {saved ? '✓ Saved' : 'Save'}
                </button>
              )}
              <button
                style={{ ...c.btn, ...c.btnQ, ...c.btnSm }}
                onClick={() => {
                  setView('home');
                  setUsername('');
                  setNameInput('');
                }}
              >
                Exit
              </button>
            </div>
          </div>
          <div style={c.pbarWrap}>
            <div
              style={{
                ...c.pbar,
                width: `${Math.round(
                  (totalPicks.done / totalPicks.total) * 100
                )}%`,
              }}
            />
          </div>

          {/* Top nav */}
          <div style={c.navBar}>
            {[
              ['predictions', 'My Predictions'],
              ['standings', 'Predicted Standings'],
              ['leaderboard_tab', 'Leaderboard'],
            ].map(([t, l]) => (
              <button
                key={t}
                style={{ ...c.navTab, ...(mainTab === t ? c.navOn : {}) }}
                onClick={() => {
                  setMainTab(t);
                  if (t === 'leaderboard_tab') setView('leaderboard');
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Sub nav for My Predictions */}
          {mainTab === 'predictions' && (
            <div style={c.subNav}>
              {[
                ['group', 'Group Stage'],
                ['third', 'Top 8 Third Place'],
                ['bracket', 'Bracket (R32 → Final)'],
              ].map(([t, l]) => (
                <button
                  key={t}
                  style={{ ...c.subTab, ...(subTab === t ? c.subOn : {}) }}
                  onClick={() => setSubTab(t)}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={c.wrap}>
            {isClosed && (
              <div style={{ ...c.aY, marginTop: '1rem' }}>
                🔒 Predictions are locked — tournament has kicked off!
              </div>
            )}

            {mainTab === 'predictions' && subTab === 'group' && (
              <GroupStageTab
                groupPreds={groupPreds}
                onPick={setGroupPick}
                isClosed={isClosed}
                resultGroup={resultGroup}
              />
            )}
            {mainTab === 'predictions' && subTab === 'third' && (
              <ThirdPlaceTab
                userStandings={userStandings}
                groupPreds={groupPreds}
                userB3={userB3}
                setB3Pick={setB3Pick}
                isClosed={isClosed}
                resultB3={resultB3}
              />
            )}
            {mainTab === 'predictions' && subTab === 'bracket' && (
              <BracketTab
                userKOMatches={userKOMatches}
                userKOW={userKOW}
                setKOPick={setKOPick}
                isClosed={isClosed}
                resultKOW={resultKOW}
                userStandings={userStandings}
                userB3={userB3}
              />
            )}
            {mainTab === 'standings' && (
              <StandingsTab standings={userStandings} groupPreds={groupPreds} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({
  nameInput,
  setNameInput,
  onLogin,
  isClosed,
  count,
  resultsIn,
  onLB,
  deadline,
  regLocked,
}) {
  const mytD = deadline.toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <>
      <div style={c.hero}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: -0.3,
          }}
        >
          World Cup 2026 Prediction Challenge
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
          FIFA World Cup 2026 · All times in Malaysia Time (MYT)
        </div>
        <div style={c.statRow}>
          {[
            ['104', 'Matches'],
            ['48', 'Nations'],
            ['3', 'Hosts'],
            [count || '0', 'Players'],
          ].map(([v, l], i) => (
            <div
              key={l}
              style={{
                ...c.statCell,
                borderRight: i < 3 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
              <div
                style={{
                  fontSize: 10,
                  color: '#9ca3af',
                  marginTop: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...c.wrapN, paddingTop: '1.5rem' }}>
        {resultsIn > 0 && (
          <div style={c.aG}>
            📊 {resultsIn} results entered — leaderboard is live!
          </div>
        )}
        {isClosed && (
          <div style={c.aR}>
            🔒 Predictions closed — tournament is underway!
          </div>
        )}
        {regLocked && !isClosed && (
          <div style={c.aY}>🔒 Registration is closed. Contact the admin.</div>
        )}
        <div style={c.card}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 10,
            }}
          >
            Enter your name to play
          </div>
          <input
            style={{ ...c.inp, marginBottom: 10 }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLogin()}
            placeholder='Your name — or "admin" for admin panel'
            autoFocus
          />
          <button
            style={{ ...c.btn, ...c.btnP, ...c.btnFull }}
            onClick={onLogin}
          >
            {isClosed ? 'View my predictions' : 'Make my predictions →'}
          </button>
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: '#9ca3af',
              textAlign: 'center',
            }}
          >
            Predictions close: {mytD} MYT
          </div>
        </div>
        <button
          style={{ ...c.btn, ...c.btnQ, ...c.btnFull, marginBottom: 14 }}
          onClick={onLB}
        >
          View Leaderboard
        </button>
        <div style={c.card}>
          <div style={c.cardTitle}>How to play</div>
          {[
            ['⚽', 'Pick all 72 group stage matches (win / draw / loss)'],
            [
              '3️⃣',
              'Pick the 8 best 3rd-place teams that advance to the knockout rounds',
            ],
            [
              '🏆',
              'Fill in the full bracket from R32 all the way to the Final',
            ],
            ['🔒', 'All picks lock at first kickoff — Jun 11, 3PM MYT'],
            ['🥇', 'Highest accuracy % across all 104 matches wins'],
          ].map(([ic, tx]) => (
            <div
              key={tx}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                marginBottom: 9,
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{ic}</span>
              <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                {tx}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── GROUP STAGE TAB ──────────────────────────────────────────────────────────
function GroupStageTab({ groupPreds, onPick, isClosed, resultGroup }) {
  const [activeGrp, setActiveGrp] = useState('A');
  const matches = GROUP_MATCHES.filter((m) => m.grp === activeGrp);
  const done = GROUP_MATCHES.filter((m) => groupPreds[m.id]).length;

  return (
    <div style={{ paddingTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        {GROUPS.map((g) => {
          const gDone = GROUP_MATCHES.filter(
            (m) => m.grp === g && groupPreds[m.id]
          ).length;
          const gTotal = GROUP_MATCHES.filter((m) => m.grp === g).length;
          const complete = gDone === gTotal;
          return (
            <button
              key={g}
              onClick={() => setActiveGrp(g)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${
                  activeGrp === g ? '#2563eb' : complete ? '#86efac' : '#e5e7eb'
                }`,
                background:
                  activeGrp === g ? '#2563eb' : complete ? '#f0fdf4' : '#fff',
                color:
                  activeGrp === g ? '#fff' : complete ? '#15803d' : '#374151',
                cursor: 'pointer',
              }}
            >
              {g} {complete ? '✓' : `${gDone}/${gTotal}`}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '0.75rem' }}>
        {done}/72 group picks complete
      </div>
      {matches.map((m) => (
        <GroupCard
          key={m.id}
          match={m}
          pick={groupPreds[m.id]}
          result={resultGroup[m.id]}
          onPick={(v) => onPick(m.id, v)}
          isClosed={isClosed}
        />
      ))}
    </div>
  );
}

function GroupCard({ match, pick, result, onPick, isClosed }) {
  const ok = pick && result && pick === result,
    bad = pick && result && pick !== result;
  const rt = (r) =>
    r === 'home' ? match.home : r === 'away' ? match.away : 'Draw';
  const sh = (t) => (t && t.length > 12 ? t.split(' ')[0] : t);
  return (
    <div
      style={{
        background: ok ? '#f0fdf4' : bad ? '#fff5f5' : '#fff',
        border: `1px solid ${
          ok ? '#86efac' : bad ? '#fca5a5' : result ? '#fde68a' : '#e5e7eb'
        }`,
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 12px',
          background: '#f9fafb',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
          }}
        >
          Group {match.grp}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {match.time} MYT · {match.venue}
        </span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 36px 1fr',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
          }}
        >
          {[match.home, null, match.away].map((t, i) =>
            i === 1 ? (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#d1d5db',
                }}
              >
                vs
              </div>
            ) : (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Flag team={t} size={26} />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#111827',
                    textAlign: 'center',
                  }}
                >
                  {t}
                </div>
              </div>
            )
          )}
        </div>
        {!isClosed && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 5,
            }}
          >
            {[
              ['home', sh(match.home), '#eff6ff', '#bfdbfe', '#1d4ed8'],
              ['draw', 'Draw', '#fffbeb', '#fde68a', '#92400e'],
              ['away', sh(match.away), '#f5f3ff', '#ddd6fe', '#6d28d9'],
            ].map(([val, lbl, bg, border, col]) => (
              <button
                key={val}
                onClick={() => onPick(val)}
                style={{
                  padding: '7px 4px',
                  borderRadius: 7,
                  border: `1px solid ${pick === val ? border : '#e5e7eb'}`,
                  background: pick === val ? bg : '#f9fafb',
                  color: pick === val ? col : '#6b7280',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {pick === val ? '✓ ' : ''}
                {lbl}
              </button>
            ))}
          </div>
        )}
        {isClosed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              Your pick:{' '}
              <strong style={{ color: '#111827' }}>
                {pick ? rt(pick) : '—'}
              </strong>
            </span>
            {result && pick && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: ok ? '#dcfce7' : '#fee2e2',
                  color: ok ? '#15803d' : '#b91c1c',
                }}
              >
                {ok ? '✓ Correct' : '✗ Wrong'}
              </span>
            )}
          </div>
        )}
        {result && (
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 5 }}>
            Result: {rt(result)}
            {result !== 'draw' ? ' win' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOP 8 THIRD PLACE TAB ────────────────────────────────────────────────────
function ThirdPlaceTab({
  userStandings,
  groupPreds,
  userB3,
  setB3Pick,
  isClosed,
  resultB3,
}) {
  const groupsDone = GROUP_MATCHES.filter((m) => groupPreds[m.id]).length;
  return (
    <div style={{ paddingTop: '1rem' }}>
      <div style={c.aB}>
        Pick which 3rd-place team advances into each of the 8 bracket slots.
        Each slot has specific eligible groups per FIFA rules. Teams shown with
        their predicted record from your group picks.
      </div>
      {groupsDone < 72 && (
        <div style={{ ...c.aY, marginBottom: 12 }}>
          {72 - groupsDone} group matches still unpicked — standings shown are
          partial.
        </div>
      )}
      {BEST3RD_MATCHES.map((m) => (
        <Best3rdCard
          key={m.id}
          matchDef={m}
          userStandings={userStandings}
          groupPreds={groupPreds}
          userB3={userB3}
          setB3Pick={setB3Pick}
          isClosed={isClosed}
          resultB3={resultB3}
        />
      ))}
    </div>
  );
}

function Best3rdCard({
  matchDef,
  userStandings,
  groupPreds,
  userB3,
  setB3Pick,
  isClosed,
  resultB3,
}) {
  const groups = matchDef.awaySlot.groups;
  const key = `b3_${groups.join('')}`;
  const selected = userB3[key];
  const actualResult = resultB3[key];
  const myt = etToMYT(matchDef.date, matchDef.et);

  const eligibleTeams = groups
    .map((g) => {
      const table = userStandings[g];
      if (!table || table.length < 3) return null;
      const teamRow = table[2];
      if (!teamRow) return null;
      const grpMatches = GROUP_MATCHES.filter((m) => m.grp === g);
      let w = 0,
        d = 0,
        l = 0;
      grpMatches.forEach((m) => {
        const pick = groupPreds[m.id];
        if (!pick) return;
        const isHome = m.home === teamRow.team;
        if (pick === 'draw') d++;
        else if ((pick === 'home' && isHome) || (pick === 'away' && !isHome))
          w++;
        else l++;
      });
      return { ...teamRow, grp: g, w, d, l };
    })
    .filter(Boolean);

  return (
    <div style={{ ...c.card, marginBottom: 10 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
          marginBottom: 2,
        }}
      >
        Match {matchDef.id} · {STAGE_LABEL[matchDef.stage]} · {myt.date} ·{' '}
        {myt.time} MYT
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
        vs Best 3rd from Groups {groups.join('/')} · {matchDef.venue}
      </div>
      {eligibleTeams.length === 0 && (
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          Pick group stage matches to see eligible teams here.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {eligibleTeams.map((t) => {
          const isSel = selected === t.team;
          const ok = selected && actualResult && selected === actualResult;
          const bad = selected && actualResult && selected !== actualResult;
          return (
            <button
              key={t.team}
              onClick={() => !isClosed && setB3Pick(key, t.team)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                border: `1px solid ${
                  isSel
                    ? ok
                      ? '#86efac'
                      : bad
                      ? '#fca5a5'
                      : '#bfdbfe'
                    : '#e5e7eb'
                }`,
                background: isSel
                  ? ok
                    ? '#f0fdf4'
                    : bad
                    ? '#fff5f5'
                    : '#eff6ff'
                  : '#f9fafb',
                cursor: isClosed ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Flag team={t.team} size={26} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: isSel ? 600 : 500,
                    color: isSel ? '#1d4ed8' : '#111827',
                  }}
                >
                  {t.team}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                  Group {t.grp} 3rd · {t.pts} pts · W{t.w} D{t.d} L{t.l}
                </div>
              </div>
              {isSel && (
                <span
                  style={{
                    fontSize: 11,
                    color: ok ? '#15803d' : bad ? '#b91c1c' : '#2563eb',
                    fontWeight: 600,
                  }}
                >
                  {ok ? '✓ Correct' : bad ? '✗ Wrong' : '✓ Selected'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── BRACKET TAB ──────────────────────────────────────────────────────────────
function BracketTab({
  userKOMatches,
  userKOW,
  setKOPick,
  isClosed,
  resultKOW,
  userStandings,
  userB3,
}) {
  const STAGE_ORDER = ['R32', 'R16', 'QF', 'SF', 'F'];
  const byStage = {};
  userKOMatches
    .filter((m) => m.stage !== '3P')
    .forEach((m) => {
      if (!byStage[m.stage]) byStage[m.stage] = [];
      byStage[m.stage].push(m);
    });

  // Match heights per round (each R32 is 56px, each subsequent round doubles)
  const MH = { R32: 56, R16: 112, QF: 224, SF: 448, F: 896 };
  const TOTAL_H = 16 * 56; // 896px

  // 3rd place match
  const m103 = userKOMatches.find((m) => m.id === 103);

  return (
    <div style={{ paddingTop: '1rem' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '0.75rem' }}>
        Scroll right to see the full bracket. Click a team name to pick them as
        winner.
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            gap: 2,
            minWidth: STAGE_ORDER.length * 142,
          }}
        >
          {STAGE_ORDER.map((stage, si) => {
            const matches = byStage[stage] || [];
            const mh = MH[stage] || 56;
            return (
              <div key={stage} style={{ width: 138 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    textAlign: 'center',
                    paddingBottom: 8,
                  }}
                >
                  {STAGE_LABEL[stage]}
                </div>
                <div
                  style={{
                    height: TOTAL_H,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {matches.map((m) => {
                    const winner = userKOW[`w_${m.id}`];
                    const actualW = resultKOW[`w_${m.id}`];
                    return (
                      <div
                        key={m.id}
                        style={{
                          height: mh,
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            overflow: 'hidden',
                            margin: '0 1px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              color: '#9ca3af',
                              padding: '2px 6px',
                              borderBottom: '1px solid #f3f4f6',
                              background: '#f9fafb',
                            }}
                          >
                            {m.time} MYT
                          </div>
                          {[m.home, m.away].map((team, ti) => {
                            const isW = winner === team;
                            const isL = winner && winner !== team;
                            const correct =
                              actualW && winner && winner === actualW;
                            const wrong =
                              actualW && winner && winner !== actualW;
                            return (
                              <div
                                key={ti}
                                onClick={() =>
                                  !isClosed && team && setKOPick(m.id, team)
                                }
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '4px 6px',
                                  borderBottom:
                                    ti === 0 ? '1px solid #f3f4f6' : 'none',
                                  background: isW
                                    ? correct
                                      ? '#f0fdf4'
                                      : wrong
                                      ? '#fff5f5'
                                      : '#eff6ff'
                                    : 'transparent',
                                  cursor:
                                    !isClosed && team ? 'pointer' : 'default',
                                  opacity: isL ? 0.4 : 1,
                                  transition: 'background 0.12s',
                                }}
                              >
                                {team ? (
                                  <Flag team={team} size={14} />
                                ) : (
                                  <div
                                    style={{
                                      width: 20,
                                      height: 14,
                                      background: '#f3f4f6',
                                      borderRadius: 2,
                                    }}
                                  />
                                )}
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: isW ? 600 : 400,
                                    color: isW
                                      ? '#1d4ed8'
                                      : team
                                      ? '#111827'
                                      : '#9ca3af',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                  }}
                                >
                                  {team
                                    ? team.length > 11
                                      ? team.split(' ')[0]
                                      : team
                                    : 'TBD'}
                                </span>
                                {isW && (
                                  <span
                                    style={{
                                      fontSize: 9,
                                      color: correct
                                        ? '#15803d'
                                        : wrong
                                        ? '#b91c1c'
                                        : '#2563eb',
                                    }}
                                  >
                                    {correct ? '✓' : wrong ? '✗' : '✓'}
                                  </span>
                                )}
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
      </div>

      {/* 3rd Place — scoreable pick */}
      {m103 && (
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#4b5563',
              marginBottom: 6,
            }}
          >
            3rd Place Match — pick the winner (scored)
          </div>
          <div
            style={{
              background: '#fff',
              border: `1px solid ${
                userKOW[`w_${m103.id}`] ? '#bfdbfe' : '#e5e7eb'
              }`,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 12px',
                background: '#f9fafb',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#4b5563',
                  textTransform: 'uppercase',
                }}
              >
                3rd Place · Match 103
              </span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                {m103.time} MYT · {m103.venue}
              </span>
            </div>
            <div style={{ padding: '12px 14px' }}>
              {m103.home && m103.away ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 36px 1fr',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    {[m103.home, null, m103.away].map((t, i) =>
                      i === 1 ? (
                        <div
                          key={i}
                          style={{
                            textAlign: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#d1d5db',
                          }}
                        >
                          vs
                        </div>
                      ) : (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Flag team={t} size={26} />
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#111827',
                              textAlign: 'center',
                            }}
                          >
                            {t}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {!isClosed && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 6,
                      }}
                    >
                      {[m103.home, m103.away].map((team) => {
                        const isW = userKOW[`w_${m103.id}`] === team;
                        return (
                          <button
                            key={team}
                            onClick={() => setKOPick(m103.id, team)}
                            style={{
                              padding: '7px 8px',
                              borderRadius: 7,
                              border: `1px solid ${
                                isW ? '#bfdbfe' : '#e5e7eb'
                              }`,
                              background: isW ? '#eff6ff' : '#f9fafb',
                              color: isW ? '#1d4ed8' : '#6b7280',
                              fontSize: 12,
                              fontWeight: isW ? 600 : 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <Flag team={team} size={14} />
                            {isW ? '✓ ' : ''}
                            {team.length > 13 ? team.split(' ')[0] : team}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {isClosed && userKOW[`w_${m103.id}`] && (
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      Your pick:{' '}
                      <strong style={{ color: '#111827' }}>
                        {userKOW[`w_${m103.id}`]}
                      </strong>{' '}
                      wins 3rd place
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    textAlign: 'center',
                    padding: '6px 0',
                  }}
                >
                  Teams determined by your semifinal picks — pick both SF
                  winners first
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STANDINGS TAB ────────────────────────────────────────────────────────────
function StandingsTab({ standings, groupPreds }) {
  const done = GROUP_MATCHES.filter((m) => groupPreds[m.id]).length;
  return (
    <div style={{ paddingTop: '1rem' }}>
      {done < 72 && (
        <div style={c.aY}>
          {72 - done} group matches still unpicked — standings are partial.
        </div>
      )}
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '1rem' }}>
        Your predicted group standings. Green rows advance to Round of 32.
      </div>
      {GROUPS.map((g) => {
        const table = standings[g];
        if (!table || table.length === 0) return null;
        return (
          <div key={g} style={{ ...c.cardSm, marginBottom: 10 }}>
            <div style={c.cardTitle}>Group {g}</div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  <th style={c.th}>Team</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>P</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>W</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>D</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>L</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>GD</th>
                  <th style={{ ...c.th, textAlign: 'center' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((t, i) => (
                  <tr
                    key={t.team}
                    style={{ background: i < 2 ? '#f0fdf4' : 'transparent' }}
                  >
                    <td style={{ ...c.td, fontWeight: i < 2 ? 600 : 400 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {i < 2 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#15803d',
                              fontWeight: 700,
                            }}
                          >
                            →
                          </span>
                        )}
                        <Flag team={t.team} size={14} />
                        <span
                          style={{
                            color:
                              i < 2
                                ? '#15803d'
                                : i === 2
                                ? '#6b7280'
                                : '#374151',
                          }}
                        >
                          {t.team}
                        </span>
                        {i === 2 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#6b7280',
                              marginLeft: 2,
                            }}
                          >
                            (3rd)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...c.td, textAlign: 'center' }}>{t.p}</td>
                    <td style={{ ...c.td, textAlign: 'center' }}>{t.w}</td>
                    <td style={{ ...c.td, textAlign: 'center' }}>{t.d}</td>
                    <td style={{ ...c.td, textAlign: 'center' }}>{t.l}</td>
                    <td style={{ ...c.td, textAlign: 'center' }}>
                      {t.gf - t.ga > 0 ? '+' : ''}
                      {t.gf - t.ga}
                    </td>
                    <td
                      style={{
                        ...c.td,
                        textAlign: 'center',
                        fontWeight: 700,
                        color:
                          i < 2 ? '#15803d' : i === 2 ? '#6b7280' : '#374151',
                      }}
                    >
                      {t.pts}
                    </td>
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
function AdminPanel({
  resultGroup,
  resultB3,
  resultKOW,
  settings,
  allUsers,
  leaderboard,
  onSaveResults,
  onSaveSettings,
  onDeleteUser,
  onBack,
  showToast,
}) {
  const [adminTab, setAdminTab] = useState('group');
  const [activeGrp, setActiveGrp] = useState('A');
  const [activeKOStage, setActiveKOStage] = useState('R32');
  const [localSettings, setLocalSettings] = useState(settings);
  const [localB3, setLocalB3] = useState(resultB3);
  const [localKOW, setLocalKOW] = useState(resultKOW);

  const adminStandings = computeStandings(resultGroup);
  const adminKOMatches = buildKO(adminStandings, localB3, localKOW);

  async function saveGrpResult(id, val) {
    const r = { ...resultGroup, [id]: val };
    await onSaveResults(r, localB3, localKOW);
    showToast('Result saved');
  }
  async function clearGrpResult(id) {
    const r = { ...resultGroup };
    delete r[id];
    await onSaveResults(r, localB3, localKOW);
    showToast('Cleared');
  }
  async function saveB3(key, team) {
    const nb = { ...localB3, [key]: team };
    setLocalB3(nb);
    await onSaveResults(resultGroup, nb, localKOW);
    showToast('3rd place team set');
  }
  async function saveKOResult(matchId, team) {
    const nk = { ...localKOW, [`w_${matchId}`]: team };
    setLocalKOW(nk);
    await onSaveResults(resultGroup, localB3, nk);
    showToast('Result saved');
  }
  async function clearKOResult(matchId) {
    const nk = { ...localKOW };
    delete nk[`w_${matchId}`];
    setLocalKOW(nk);
    await onSaveResults(resultGroup, localB3, nk);
    showToast('Cleared');
  }
  async function handleSaveSettings() {
    await onSaveSettings(localSettings);
    showToast('Settings saved');
  }

  const grpMatches = GROUP_MATCHES.filter((m) => m.grp === activeGrp);
  const koMatches = adminKOMatches.filter((m) => m.stage === activeKOStage);

  return (
    <>
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button style={{ ...c.btn, ...c.btnQ, ...c.btnSm }} onClick={onBack}>
          ← Exit
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {Object.keys(resultGroup).length}/72 group ·{' '}
            {Object.keys(localKOW).length} knockout ·{' '}
            {Object.keys(allUsers).length} players
          </div>
        </div>
      </div>
      <div style={c.navBar}>
        {[
          ['group', 'Group Results'],
          ['b3', 'Best 3rd Slots'],
          ['knockout', 'Knockout Results'],
          ['standings', 'Standings'],
          ['players', 'Players'],
          ['settings', 'Settings'],
        ].map(([t, l]) => (
          <button
            key={t}
            style={{ ...c.navTab, ...(adminTab === t ? c.navOn : {}) }}
            onClick={() => setAdminTab(t)}
          >
            {l}
          </button>
        ))}
      </div>
      <div style={c.wrap}>
        {/* GROUP RESULTS */}
        {adminTab === 'group' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={c.aY}>
              Click a result to save instantly. Green = entered.
            </div>
            <div
              style={{
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {GROUPS.map((g) => {
                const done = GROUP_MATCHES.filter(
                  (m) => m.grp === g && resultGroup[m.id]
                ).length;
                const total = GROUP_MATCHES.filter((m) => m.grp === g).length;
                return (
                  <button
                    key={g}
                    onClick={() => setActiveGrp(g)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${
                        activeGrp === g
                          ? '#2563eb'
                          : done === total
                          ? '#86efac'
                          : '#e5e7eb'
                      }`,
                      background:
                        activeGrp === g
                          ? '#2563eb'
                          : done === total
                          ? '#f0fdf4'
                          : '#fff',
                      color:
                        activeGrp === g
                          ? '#fff'
                          : done === total
                          ? '#15803d'
                          : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    {g} {done}/{total}
                  </button>
                );
              })}
            </div>
            {grpMatches.map((m) => (
              <div key={m.id} style={c.cardSm}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {m.date} · {m.time} MYT · {m.venue}
                  </div>
                  {resultGroup[m.id] && (
                    <button
                      style={{ ...c.btn, ...c.btnR, ...c.btnSm }}
                      onClick={() => clearGrpResult(m.id)}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Flag team={m.home} size={18} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {m.home}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>vs</span>
                  <Flag team={m.away} size={18} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {m.away}
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 5,
                  }}
                >
                  {[
                    ['home', m.home],
                    ['draw', 'Draw'],
                    ['away', m.away],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => saveGrpResult(m.id, val)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: 6,
                        border: `1px solid ${
                          resultGroup[m.id] === val ? '#86efac' : '#e5e7eb'
                        }`,
                        background:
                          resultGroup[m.id] === val ? '#f0fdf4' : '#f9fafb',
                        color:
                          resultGroup[m.id] === val ? '#15803d' : '#6b7280',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {resultGroup[m.id] === val ? '✓ ' : ''}
                      {lbl.length > 12 ? lbl.split(' ')[0] : lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BEST 3RD SLOTS — admin assigns actual qualifying teams */}
        {adminTab === 'b3' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={c.aB}>
              After group stage, assign which 3rd-place team actually qualified
              into each bracket slot. This unlocks knockout result entry for
              matches with best-3rd slots.
            </div>
            {BEST3RD_MATCHES.map((m) => {
              const groups = m.awaySlot.groups;
              const key = `b3_${groups.join('')}`;
              const selected = localB3[key];
              const myt = etToMYT(m.date, m.et);
              const eligible = groups
                .map((g) => {
                  const table = adminStandings[g];
                  if (!table || table.length < 3) return null;
                  const t = table[2];
                  if (!t) return null;
                  return { ...t, grp: g };
                })
                .filter(Boolean);
              return (
                <div key={m.id} style={{ ...c.card, marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 2,
                    }}
                  >
                    Match {m.id} · {myt.date} · {myt.time} MYT
                  </div>
                  <div
                    style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}
                  >
                    Best 3rd from Groups {groups.join('/')} · {m.venue}
                  </div>
                  {eligible.length === 0 && (
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      Enter group results first to see eligible teams.
                    </div>
                  )}
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
                  >
                    {eligible.map((t) => {
                      const isSel = selected === t.team;
                      return (
                        <button
                          key={t.team}
                          onClick={() => saveB3(key, t.team)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${
                              isSel ? '#86efac' : '#e5e7eb'
                            }`,
                            background: isSel ? '#f0fdf4' : '#f9fafb',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <Flag team={t.team} size={22} />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: isSel ? 600 : 500,
                                color: isSel ? '#15803d' : '#111827',
                              }}
                            >
                              {t.team}
                            </div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>
                              Group {t.grp} 3rd · {t.pts} pts
                            </div>
                          </div>
                          {isSel && (
                            <span
                              style={{
                                fontSize: 11,
                                color: '#15803d',
                                fontWeight: 600,
                              }}
                            >
                              ✓ Assigned
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* KNOCKOUT RESULTS */}
        {adminTab === 'knockout' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={c.aB}>
              Teams auto-populate from group results and best-3rd assignments.
              Enter the actual match winner.
            </div>
            <div
              style={{
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                marginBottom: '1rem',
              }}
            >
              {['R32', 'R16', 'QF', 'SF', '3P', 'F'].map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveKOStage(s)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    border: `1px solid ${
                      activeKOStage === s ? STAGE_COL[s] : '#e5e7eb'
                    }`,
                    background: activeKOStage === s ? STAGE_COL[s] : '#fff',
                    color: activeKOStage === s ? '#fff' : '#374151',
                    cursor: 'pointer',
                  }}
                >
                  {STAGE_LABEL[s]}
                </button>
              ))}
            </div>
            {koMatches.map((m) => {
              const actualW = localKOW[`w_${m.id}`];
              const is3P = m.stage === '3P';
              return (
                <div key={m.id} style={c.cardSm}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      Match {m.id} · {m.date} · {m.time} MYT · {m.venue}
                    </div>
                    {actualW && !is3P && (
                      <button
                        style={{ ...c.btn, ...c.btnR, ...c.btnSm }}
                        onClick={() => clearKOResult(m.id)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {m.home && m.away ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <Flag team={m.home} size={16} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {m.home}
                        </span>
                        <span style={{ color: '#9ca3af' }}>vs</span>
                        <Flag team={m.away} size={16} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {m.away}
                        </span>
                      </div>
                      {is3P ? (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            fontStyle: 'italic',
                          }}
                        >
                          3rd place match — enter winner below
                        </div>
                      ) : null}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 5,
                          marginTop: is3P ? 6 : 0,
                        }}
                      >
                        {[m.home, m.away].map((team) => (
                          <button
                            key={team}
                            onClick={() => saveKOResult(m.id, team)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: `1px solid ${
                                actualW === team ? '#86efac' : '#e5e7eb'
                              }`,
                              background:
                                actualW === team ? '#f0fdf4' : '#f9fafb',
                              color: actualW === team ? '#15803d' : '#6b7280',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              justifyContent: 'center',
                            }}
                          >
                            <Flag team={team} size={14} />
                            {actualW === team ? '✓ ' : ''}
                            {team.length > 13 ? team.split(' ')[0] : team}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      Teams TBD — enter previous round results first
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* STANDINGS */}
        {adminTab === 'standings' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={c.aB}>Live standings from actual results entered.</div>
            {GROUPS.map((g) => {
              const table = adminStandings[g];
              if (!table || table.length === 0)
                return (
                  <div
                    key={g}
                    style={{ ...c.cardSm, color: '#9ca3af', fontSize: 12 }}
                  >
                    Group {g} — no results yet
                  </div>
                );
              return (
                <div key={g} style={{ ...c.cardSm, marginBottom: 10 }}>
                  <div style={c.cardTitle}>Group {g}</div>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={c.th}>Team</th>
                        <th style={{ ...c.th, textAlign: 'center' }}>P</th>
                        <th style={{ ...c.th, textAlign: 'center' }}>W</th>
                        <th style={{ ...c.th, textAlign: 'center' }}>D</th>
                        <th style={{ ...c.th, textAlign: 'center' }}>L</th>
                        <th style={{ ...c.th, textAlign: 'center' }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.map((t, i) => (
                        <tr
                          key={t.team}
                          style={{
                            background: i < 2 ? '#f0fdf4' : 'transparent',
                          }}
                        >
                          <td
                            style={{ ...c.td, fontWeight: i < 2 ? 600 : 400 }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              {i < 2 && (
                                <span
                                  style={{ fontSize: 10, color: '#15803d' }}
                                >
                                  →
                                </span>
                              )}
                              <Flag team={t.team} size={14} />
                              <span
                                style={{
                                  color: i < 2 ? '#15803d' : '#374151',
                                  fontSize: 12,
                                }}
                              >
                                {t.team}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...c.td, textAlign: 'center' }}>
                            {t.p}
                          </td>
                          <td style={{ ...c.td, textAlign: 'center' }}>
                            {t.w}
                          </td>
                          <td style={{ ...c.td, textAlign: 'center' }}>
                            {t.d}
                          </td>
                          <td style={{ ...c.td, textAlign: 'center' }}>
                            {t.l}
                          </td>
                          <td
                            style={{
                              ...c.td,
                              textAlign: 'center',
                              fontWeight: 700,
                              color: i < 2 ? '#15803d' : '#374151',
                            }}
                          >
                            {t.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* PLAYERS */}
        {adminTab === 'players' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              Players ({Object.keys(allUsers).length})
            </div>
            <div style={c.aY}>
              Deleting an entry is permanent and cannot be undone.
            </div>
            {leaderboard.length === 0 && (
              <div
                style={{
                  ...c.card,
                  textAlign: 'center',
                  color: '#9ca3af',
                  padding: '2rem',
                }}
              >
                No players yet.
              </div>
            )}
            {leaderboard.map((u) => (
              <div
                key={u.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: 8,
                  marginBottom: 6,
                  border: '1px solid #f3f4f6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={c.avatar}>{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {u.pickCount} picks
                      {u.pct !== null ? ` · ${u.pct}% accuracy` : ''}
                    </div>
                  </div>
                </div>
                <button
                  style={{ ...c.btn, ...c.btnR, ...c.btnSm }}
                  onClick={() => onDeleteUser(u.name)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {adminTab === 'settings' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={c.card}>
              <div style={c.cardTitle}>Prediction deadline</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                Enter in UTC — displayed to users in MYT (UTC+8).
              </div>
              <input
                type="datetime-local"
                style={{ ...c.inp, marginBottom: 8 }}
                value={
                  localSettings.deadline
                    ? localSettings.deadline.slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    deadline: e.target.value + ':00Z',
                  }))
                }
              />
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                MYT:{' '}
                {localSettings.deadline
                  ? new Date(localSettings.deadline).toLocaleString('en-MY', {
                      timeZone: 'Asia/Kuala_Lumpur',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }) + ' MYT'
                  : 'Not set'}
              </div>
            </div>
            <div style={c.card}>
              <div style={c.cardTitle}>Registration</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Lock new registrations
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {localSettings.registrationLocked
                      ? 'New players cannot join'
                      : 'Anyone can register'}
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    width: 44,
                    height: 24,
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={localSettings.registrationLocked || false}
                    onChange={(e) =>
                      setLocalSettings((s) => ({
                        ...s,
                        registrationLocked: e.target.checked,
                      }))
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: localSettings.registrationLocked
                        ? '#2563eb'
                        : '#d1d5db',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: 18,
                        width: 18,
                        left: localSettings.registrationLocked ? 23 : 3,
                        bottom: 3,
                        background: '#fff',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>
            <div style={c.card}>
              <div style={c.cardTitle}>Admin password</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Update the{' '}
                <code
                  style={{
                    background: '#f3f4f6',
                    padding: '1px 5px',
                    borderRadius: 3,
                    fontSize: 12,
                  }}
                >
                  ADMIN_PW
                </code>{' '}
                constant in App.jsx and redeploy.
              </div>
            </div>
            <button
              style={{ ...c.btn, ...c.btnP, ...c.btnFull }}
              onClick={handleSaveSettings}
            >
              Save settings
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardScreen({ leaderboard, resultsIn, onBack, count }) {
  return (
    <>
      <div style={c.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <button style={{ ...c.btn, ...c.btnQ, ...c.btnSm }} onClick={onBack}>
            ← Back
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Leaderboard</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              {count} players · {resultsIn}/72 group results entered
            </div>
          </div>
        </div>
      </div>
      <div style={c.wrap}>
        {resultsIn === 0 ? (
          <div
            style={{
              ...c.card,
              textAlign: 'center',
              padding: '2.5rem',
              marginTop: '1.25rem',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              No results yet
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Accuracy % appears once admin enters match results
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            style={{
              ...c.card,
              textAlign: 'center',
              padding: '2.5rem',
              marginTop: '1.25rem',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 600, color: '#374151' }}>
              No players yet
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '1.25rem' }}>
            {leaderboard.map((u, i) => (
              <div
                key={u.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: i === 0 && u.pct !== null ? '#eff6ff' : '#fff',
                  border: `1px solid ${
                    i === 0 && u.pct !== null ? '#93c5fd' : '#e5e7eb'
                  }`,
                  borderRadius: 10,
                  padding: '11px 13px',
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    fontSize: i < 3 ? 18 : 13,
                    fontWeight: 700,
                    color:
                      i === 0
                        ? '#2563eb'
                        : i === 1
                        ? '#6b7280'
                        : i === 2
                        ? '#92400e'
                        : '#9ca3af',
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {i === 0
                    ? '🥇'
                    : i === 1
                    ? '🥈'
                    : i === 2
                    ? '🥉'
                    : `#${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    {u.pickCount} picks made
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {u.pct !== null ? (
                    <>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: i === 0 ? '#2563eb' : '#111827',
                        }}
                      >
                        {u.pct}%
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        {u.correct}/{u.total} correct
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          fontWeight: 600,
                        }}
                      >
                        {u.pickCount} picks
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                        awaiting results
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
