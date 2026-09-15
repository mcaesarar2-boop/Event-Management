import { Artist, ArtistRiderGearItem } from '@/lib/types';

const COMMON_ERP_KEYWORDS = [
  'digico',
  'yamaha',
  'ampeg',
  'fender',
  'marshall',
  'nord',
  'shure',
  'sennheiser',
  'l-acoustics',
  'pioneer',
  'korg',
  'midas',
  'avid',
  'kemper',
  'aguilar',
  'pearl',
  'roland',
  'vox',
  'd&b',
];

/**
 * Normalizes an artist's technical rider items into structured ArtistRiderGearItem[]
 */
export function normalizeArtistGearList(artist?: Artist | null): ArtistRiderGearItem[] {
  if (!artist) return [];

  const tr = artist.technicalRider;
  if (!tr) return [];

  // If already structured gearList exists, return it
  if (Array.isArray(tr.gearList) && tr.gearList.length > 0) {
    return tr.gearList;
  }

  // Extract from legacy arrays or strings
  const rawList: string[] = [];
  if (Array.isArray(tr.backlineList)) {
    rawList.push(...tr.backlineList);
  } else if (Array.isArray(tr.backline)) {
    rawList.push(...tr.backline);
  }

  if (Array.isArray(tr.microphoneSpec)) {
    rawList.push(...tr.microphoneSpec);
  } else if (Array.isArray(tr.microphones)) {
    rawList.push(...tr.microphones);
  }

  if (typeof tr.audioRequirement === 'string' && tr.audioRequirement.trim()) {
    // If it contains console name, add as a gear item
    rawList.push(tr.audioRequirement);
  }

  if (rawList.length === 0) {
    return [];
  }

  // Deduplicate and map
  const uniqueNames = Array.from(new Set(rawList));
  return uniqueNames.map((name, idx) => {
    const lower = name.toLowerCase();
    const isFromErp = COMMON_ERP_KEYWORDS.some((kw) => lower.includes(kw));

    return {
      id: `gear-${artist.id || 'art'}-${idx + 1}`,
      name,
      isFromErp,
      status: 'PENDING_REVIEW' as const,
      notes: isFromErp ? 'Tersedia di katalog gudang internal' : 'Kebutuhan eksternal / vendor',
    };
  });
}

/**
 * Computes readiness stats for rider gear
 */
export function calculateRiderReadiness(gearList: ArtistRiderGearItem[]) {
  const total = gearList.length;
  const confirmedInternal = gearList.filter((g) => g.status === 'CONFIRMED_INTERNAL').length;
  const confirmedVendor = gearList.filter((g) => g.status === 'CONFIRMED_VENDOR').length;
  const confirmedTotal = confirmedInternal + confirmedVendor;
  const pending = total - confirmedTotal;
  const percentage = total > 0 ? Math.round((confirmedTotal / total) * 100) : 0;

  return {
    total,
    confirmedInternal,
    confirmedVendor,
    confirmedTotal,
    pending,
    percentage,
    isComplete: total > 0 && confirmedTotal === total,
  };
}

