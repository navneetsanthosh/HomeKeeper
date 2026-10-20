export function daysUntil(dateValue) {
  if (!dateValue) return null;

  const [year, month, day] = dateValue.split('-').map(Number);
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const expiryUtc = Date.UTC(year, month - 1, day);

  return Math.round((expiryUtc - todayUtc) / 86400000);
}

export function isActiveProduct(product) {
  return ['owned', 'missing', 'lent'].includes(product.status);
}

export const statusLabels = {
  owned: 'Owned',
  missing: 'Missing',
  lent: 'Lent out',
  sold: 'Sold',
  disposed: 'Disposed',
};
