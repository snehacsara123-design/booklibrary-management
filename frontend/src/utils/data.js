export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.books)) return value.books;
  if (Array.isArray(value?.borrows)) return value.borrows;
  if (Array.isArray(value?.users)) return value.users;
  return [];
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

export function isOverdue(borrow) {
  return borrow?.dueDate && borrow.status !== 'returned' && new Date(borrow.dueDate) < new Date();
}
