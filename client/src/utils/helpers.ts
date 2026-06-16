export const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
export const truncateText = (text: string, max: number): string => text.length <= max ? text : text.slice(0, max).trim() + '...';
