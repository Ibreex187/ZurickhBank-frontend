// Shared display formatters, so money and dates look the same on every page
// and do not depend on each visitor's browser locale.

const moneyFormatter = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** 1234.5 -> "₦1,234.50" (negative values keep their sign: "-₦50.00") */
export const formatMoney = (value) => {
  const amount = toNumber(value);
  const formatted = `₦${moneyFormatter.format(Math.abs(amount))}`;
  return amount < 0 ? `-${formatted}` : formatted;
};

/** Amount without the currency symbol, for layouts that draw the ₦ separately: "1,234.50" */
export const formatPlainAmount = (value) => moneyFormatter.format(toNumber(value));

/** Money with an explicit + or - sign, for showing movement: "+₦500.00" */
export const formatSignedMoney = (value) => {
  const amount = toNumber(value);
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}₦${moneyFormatter.format(Math.abs(amount))}`;
};

/** "20 Sep 2026", or "-" when the value is missing or invalid */
export const formatDate = (value) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '-';
};

/** "20 Sep 2026, 14:05", or "-" when the value is missing or invalid */
export const formatDateTime = (value) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '-';
};

/** "14:05", or "-" when the value is missing or invalid */
export const formatTime = (value) => {
  const date = toDate(value);
  return date ? timeFormatter.format(date) : '-';
};
