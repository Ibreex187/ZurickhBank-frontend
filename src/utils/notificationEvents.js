export const NOTIFICATIONS_UNREAD_UPDATED_EVENT = 'notifications:unread-updated';
export const NOTIFICATIONS_UNREAD_STORAGE_KEY = 'notifications_unread_count';

export const publishUnreadNotifications = (unreadCount) => {
  const normalizedCount = Math.max(Number(unreadCount) || 0, 0);

  try {
    window.sessionStorage.setItem(NOTIFICATIONS_UNREAD_STORAGE_KEY, String(normalizedCount));
  } catch {
    // no-op if storage is unavailable
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UNREAD_UPDATED_EVENT, {
    detail: { unreadCount: normalizedCount },
  }));
};

export const readStoredUnreadNotifications = () => {
  try {
    const storedValue = window.sessionStorage.getItem(NOTIFICATIONS_UNREAD_STORAGE_KEY);
    const parsedValue = Number(storedValue);
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
  } catch {
    return 0;
  }
};