import api from '../config/api';

const NOTIFICATION_ENDPOINTS = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  markAsRead: '/notifications/:notificationId/read',
  markAllAsRead: '/notifications/read-all',
  preferences: '/notifications/preferences',
};

const normalizeNotificationId = (notificationId) => String(notificationId || '').trim();

export const getNotifications = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    category,
  } = options;

  const params = new URLSearchParams();
  params.append('page', String(Math.max(Number(page) || 1, 1)));
  params.append('limit', String(Math.max(Number(limit) || 20, 1)));

  if (unreadOnly) {
    params.append('unreadOnly', 'true');
  }

  if (category) {
    params.append('category', String(category).trim());
  }

  const response = await api.get(`${NOTIFICATION_ENDPOINTS.list}?${params.toString()}`);
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get(NOTIFICATION_ENDPOINTS.unreadCount);
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const normalizedId = normalizeNotificationId(notificationId);

  if (!normalizedId) {
    throw new Error('notificationId is required');
  }

  const endpoint = NOTIFICATION_ENDPOINTS.markAsRead.replace(':notificationId', normalizedId);
  const response = await api.patch(endpoint);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch(NOTIFICATION_ENDPOINTS.markAllAsRead);
  return response.data;
};

export const getNotificationPreferences = async () => {
  const response = await api.get(NOTIFICATION_ENDPOINTS.preferences);
  return response.data;
};

export const updateNotificationPreferences = async (emailByCategory = {}) => {
  const response = await api.patch(NOTIFICATION_ENDPOINTS.preferences, {
    emailByCategory,
  });
  return response.data;
};

export default {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
};