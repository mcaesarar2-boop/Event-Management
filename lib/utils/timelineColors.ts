import { MilestoneTag, ProductionMilestone } from '@/lib/types';

export interface MilestoneColorStyle {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  previewBg: string;
}

export const COLOR_PALETTES: Record<string, MilestoneColorStyle> = {
  rose: {
    id: 'rose',
    name: 'Rose / Merah',
    bg: 'bg-rose-950/80',
    text: 'text-rose-300',
    border: 'border-rose-700/60',
    dot: 'bg-rose-500',
    pillBg: 'bg-rose-950/70',
    pillText: 'text-rose-300',
    pillBorder: 'border-rose-800/80',
    previewBg: 'bg-rose-500',
  },
  sky: {
    id: 'sky',
    name: 'Sky / Biru Langit',
    bg: 'bg-sky-950/80',
    text: 'text-sky-300',
    border: 'border-sky-700/60',
    dot: 'bg-sky-400',
    pillBg: 'bg-sky-950/70',
    pillText: 'text-sky-300',
    pillBorder: 'border-sky-800/80',
    previewBg: 'bg-sky-500',
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo / Biru Tua',
    bg: 'bg-indigo-950/80',
    text: 'text-indigo-300',
    border: 'border-indigo-700/60',
    dot: 'bg-indigo-400',
    pillBg: 'bg-indigo-950/70',
    pillText: 'text-indigo-300',
    pillBorder: 'border-indigo-800/80',
    previewBg: 'bg-indigo-500',
  },
  purple: {
    id: 'purple',
    name: 'Purple / Ungu',
    bg: 'bg-purple-950/80',
    text: 'text-purple-300',
    border: 'border-purple-700/60',
    dot: 'bg-purple-400',
    pillBg: 'bg-purple-950/70',
    pillText: 'text-purple-300',
    pillBorder: 'border-purple-800/80',
    previewBg: 'bg-purple-500',
  },
  amber: {
    id: 'amber',
    name: 'Amber / Kuning',
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-700/60',
    dot: 'bg-amber-400',
    pillBg: 'bg-amber-950/70',
    pillText: 'text-amber-300',
    pillBorder: 'border-amber-800/80',
    previewBg: 'bg-amber-500',
  },
  orange: {
    id: 'orange',
    name: 'Orange / Jingga',
    bg: 'bg-orange-950/80',
    text: 'text-orange-300',
    border: 'border-orange-700/60',
    dot: 'bg-orange-400',
    pillBg: 'bg-orange-950/70',
    pillText: 'text-orange-300',
    pillBorder: 'border-orange-800/80',
    previewBg: 'bg-orange-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald / Hijau',
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-700/60',
    dot: 'bg-emerald-400',
    pillBg: 'bg-emerald-950/70',
    pillText: 'text-emerald-300',
    pillBorder: 'border-emerald-800/80',
    previewBg: 'bg-emerald-500',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyan / Biru Toska',
    bg: 'bg-cyan-950/80',
    text: 'text-cyan-300',
    border: 'border-cyan-700/60',
    dot: 'bg-cyan-400',
    pillBg: 'bg-cyan-950/70',
    pillText: 'text-cyan-300',
    pillBorder: 'border-cyan-800/80',
    previewBg: 'bg-cyan-500',
  },
  fuchsia: {
    id: 'fuchsia',
    name: 'Fuchsia / Magenta',
    bg: 'bg-fuchsia-950/80',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-700/60',
    dot: 'bg-fuchsia-400',
    pillBg: 'bg-fuchsia-950/70',
    pillText: 'text-fuchsia-300',
    pillBorder: 'border-fuchsia-800/80',
    previewBg: 'bg-fuchsia-500',
  },
  slate: {
    id: 'slate',
    name: 'Slate / Abu-abu',
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
    pillBg: 'bg-slate-900',
    pillText: 'text-slate-300',
    pillBorder: 'border-slate-700',
    previewBg: 'bg-slate-500',
  },
};

export const COLOR_PALETTE_LIST: MilestoneColorStyle[] = [
  COLOR_PALETTES.rose,
  COLOR_PALETTES.indigo,
  COLOR_PALETTES.purple,
  COLOR_PALETTES.amber,
  COLOR_PALETTES.emerald,
  COLOR_PALETTES.cyan,
  COLOR_PALETTES.fuchsia,
  COLOR_PALETTES.slate,
];

export const DEFAULT_MILESTONE_TAGS: MilestoneTag[] = [
  {
    id: 'tag-show-day',
    label: 'Show Day',
    color: 'rose',
    isDefault: true,
  },
  {
    id: 'tag-load-in',
    label: 'Load-In & Rigging',
    color: 'sky',
    isDefault: true,
  },
  {
    id: 'tag-setup',
    label: 'Setup & Staging',
    color: 'amber',
    isDefault: true,
  },
  {
    id: 'tag-rehearsal',
    label: 'Rehearsal / GR',
    color: 'purple',
    isDefault: true,
  },
  {
    id: 'tag-strike',
    label: 'Strike / Bongkaran',
    color: 'orange',
    isDefault: true,
  },
];

export function getMilestoneColorClasses(colorKey: string): MilestoneColorStyle {
  if (!colorKey) return COLOR_PALETTES.slate;
  const lower = colorKey.toLowerCase();
  return COLOR_PALETTES[lower] || COLOR_PALETTES.indigo;
}

/**
 * Generates a full standard production lifecycle timeline relative to a given Show Day date (D)
 */
export function generateStandardMilestones(
  showDayDateStr: string,
  availableTags: MilestoneTag[] = DEFAULT_MILESTONE_TAGS
): ProductionMilestone[] {
  const base = new Date(showDayDateStr);
  if (isNaN(base.getTime())) return [];

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const getTag = (preferredId: string, fallbackColor: string, fallbackLabel: string): MilestoneTag => {
    const found = availableTags.find((t) => t.id === preferredId || t.label.toLowerCase().includes(fallbackLabel.toLowerCase()));
    if (found) return found;
    return {
      id: preferredId,
      label: fallbackLabel,
      color: fallbackColor,
      isDefault: true,
    };
  };

  const tagLoadIn = getTag('tag-load-in', 'sky', 'Load-In & Rigging');
  const tagSetup = getTag('tag-setup', 'amber', 'Setup & Staging');
  const tagRehearsal = getTag('tag-rehearsal', 'purple', 'Rehearsal / GR');
  const tagShowDay = getTag('tag-show-day', 'rose', 'Show Day');
  const tagStrike = getTag('tag-strike', 'orange', 'Strike / Bongkaran');

  // D-4 Load In
  const dLoadIn = new Date(base.getTime() - 4 * 86400000);
  // D-3 Setup
  const dSetup = new Date(base.getTime() - 3 * 86400000);
  // D-2 Tech Rehearsal
  const dTech = new Date(base.getTime() - 2 * 86400000);
  // D-1 General Rehearsal (GR)
  const dGen = new Date(base.getTime() - 1 * 86400000);
  // D+1 Strike
  const dStrike = new Date(base.getTime() + 1 * 86400000);
  // D+2 Load Out
  const dLoadOut = new Date(base.getTime() + 2 * 86400000);

  return [
    {
      id: `ms-${Date.now()}-1`,
      date: fmt(dLoadIn),
      time: '08:00',
      tagId: tagLoadIn.id,
      tagLabel: tagLoadIn.label,
      tagColor: tagLoadIn.color,
      title: 'Loading dock, genset PLN, konstruksi panggung & rigging truss',
      category: 'LOAD_IN',
      name: 'Load-In Logistik & Rigging Truss',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-2`,
      date: fmt(dSetup),
      time: '09:00',
      tagId: tagSetup.id,
      tagLabel: tagSetup.label,
      tagColor: tagSetup.color,
      title: 'Instalasi sound system FOH, lighting fixtures & LED wall screen',
      category: 'SETUP',
      name: 'Stage, Audio & Lighting System Setup',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-3`,
      date: fmt(dTech),
      time: '14:00',
      tagId: tagRehearsal.id,
      tagLabel: tagRehearsal.label,
      tagColor: tagRehearsal.color,
      title: 'Technical Dry Run, audio delay tuning & lighting focus check',
      category: 'REHEARSAL',
      name: 'Technical Rehearsal (Dry Run) & Soundcheck',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-4`,
      date: fmt(dGen),
      time: '19:00',
      tagId: tagRehearsal.id,
      tagLabel: tagRehearsal.label,
      tagColor: tagRehearsal.color,
      title: 'General Rehearsal (GR) / Geladi Bersih all talent, MC & operator',
      category: 'REHEARSAL',
      name: 'General Rehearsal (GR) / Geladi Bersih',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-5`,
      date: fmt(base),
      time: '14:00',
      tagId: tagShowDay.id,
      tagLabel: tagShowDay.label,
      tagColor: tagShowDay.color,
      title: 'Open Gate, penampilan artis live concert & rundown utama event',
      category: 'SHOW_DAY',
      name: 'SHOW DAY (Event Live / Hari-H)',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-6`,
      date: fmt(dStrike),
      time: '00:00',
      tagId: tagStrike.id,
      tagLabel: tagStrike.label,
      tagColor: tagStrike.color,
      title: 'Bongkaran sound system, penurunan rigging truss & packaging',
      category: 'STRIKE',
      name: 'Strike & Stage Dismantling (Bongkaran)',
      status: 'SCHEDULED',
    },
    {
      id: `ms-${Date.now()}-7`,
      date: fmt(dLoadOut),
      time: '18:00',
      tagId: tagStrike.id,
      tagLabel: tagStrike.label,
      tagColor: tagStrike.color,
      title: 'Load-out logistik via truk kontainer & serah terima kebersihan venue',
      category: 'LOAD_OUT',
      name: 'Load-Out, Pembersihan & Serah Terima Venue',
      status: 'SCHEDULED',
    },
  ];
}

