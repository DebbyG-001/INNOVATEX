export function formatNaira(amount: number, hideDecimals = false): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: hideDecimals ? 0 : 2,
    maximumFractionDigits: hideDecimals ? 0 : 2,
  })
    .format(amount)
    .replace('NGN', '₦')
    .trim();
}

export function formatCompactNaira(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }
  return `₦${amount.toLocaleString()}`;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeOfDay = 'Good evening';
  if (hour < 12) {
    timeOfDay = 'Good morning';
  } else if (hour < 17) {
    timeOfDay = 'Good afternoon';
  }
  return `${timeOfDay}, ${name}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
