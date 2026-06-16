export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(dateString);
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

export const calculateDiscount = (price: number, originalPrice: number): number => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateStars = (rating: number): { filled: number; half: boolean; empty: number } => {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - filled - (half ? 1 : 0);
  return { filled, half, empty };
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

export const getZodiacFromDate = (month: number, day: number): string => {
  const signs = [
    { name: 'capricorn', end: [1, 19] },
    { name: 'aquarius', end: [2, 18] },
    { name: 'pisces', end: [3, 20] },
    { name: 'aries', end: [4, 19] },
    { name: 'taurus', end: [5, 20] },
    { name: 'gemini', end: [6, 20] },
    { name: 'cancer', end: [7, 22] },
    { name: 'leo', end: [8, 22] },
    { name: 'virgo', end: [9, 22] },
    { name: 'libra', end: [10, 22] },
    { name: 'scorpio', end: [11, 21] },
    { name: 'sagittarius', end: [12, 21] },
    { name: 'capricorn', end: [12, 31] },
  ];

  for (const sign of signs) {
    if (month < sign.end[0] || (month === sign.end[0] && day <= sign.end[1])) {
      return sign.name;
    }
  }
  return 'capricorn';
};
