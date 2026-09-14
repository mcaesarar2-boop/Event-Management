export function formatIDR(amount: number = 0): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatRupiah = formatIDR;

export function formatCompactIDR(amount: number = 0): string {
  if (isNaN(amount)) return 'Rp 0';
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  return formatIDR(amount);
}

const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    // If it starts with YYYY-MM-DD, extract calendar components directly
    // This prevents any UTC vs local timezone midnight shift between SSR and client
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1];
      const monthIndex = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return `${day} ${MONTH_NAMES_ID[monthIndex] || match[2]} ${year}`;
    }

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateDaysUntil(targetDateString?: string): { days: number; label: string } {
  if (!targetDateString) return { days: 0, label: 'N/A' };
  try {
    const match = targetDateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return { days: 0, label: '-' };
    const targetDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { days: diffDays, label: `H-${diffDays} Hari` };
    } else if (diffDays === 0) {
      return { days: 0, label: 'Hari Ini' };
    } else {
      return { days: Math.abs(diffDays), label: `H+${Math.abs(diffDays)} Hari Lalu` };
    }
  } catch {
    return { days: 0, label: '-' };
  }
}
