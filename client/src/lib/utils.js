import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShort(amount) {
  const abs = Math.abs(amount);
  if (abs >= 1e9) return (amount / 1e9).toFixed(1) + 'M';
  if (abs >= 1e6) return (amount / 1e6).toFixed(1) + 'jt';
  if (abs >= 1e3) return (amount / 1e3).toFixed(0) + 'rb';
  return amount;
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('id-ID', defaultOptions);
}

export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

export function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '??';
}

export const CAT_COLORS = [
  '#4338ca',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#be185d',
];

export const CATEGORIES = {
  INCOME: ['Gaji', 'Investasi', 'Freelance', 'Hadiah', 'Lain-lain'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lain-lain'],
};