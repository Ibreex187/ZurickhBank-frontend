// Utility to format numbers with commas as thousand separators
export function formatWithCommas(value) {
  if (value === '' || value === null || value === undefined) return '';
  const parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Utility to remove commas from formatted string
export function unformatCommas(value) {
  return value.replace(/,/g, '');
}
