/**
 * Currency formatting in INR with en-IN locale
 * e.g. ₹50,000 or ₹1,25,000.00
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage (e.g. 0.94 -> "94%" or "94.2%")
 */
export function formatPercentage(val: number, decimals: number = 0): string {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  const pct = val <= 1 ? val * 100 : val;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Format integer with thousand separators (en-IN)
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

/**
 * Format ISO date or date string into readable fintech date
 */
export function formatDate(dateStr: string | Date, includeTime: boolean = false): string {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };
  return new Intl.DateTimeFormat('en-IN', options).format(d);
}
