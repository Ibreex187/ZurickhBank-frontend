// Turns whatever a failed auth request produced (an axios error, or the
// { success: false, status, message, error } object from authService) into
// one message that is safe and useful to show a person.

const TOO_MANY_REQUESTS = 'Too many attempts. Please wait a few minutes and try again.';
const NO_CONNECTION = "We couldn't reach the server. Check your connection and try again.";
const SERVER_PROBLEM = 'Something went wrong on our side. Please try again in a moment.';

const isNetworkFailure = (source) =>
  Boolean(
    source?.isNetworkError ||
      source?.code === 'ERR_NETWORK' ||
      source?.code === 'ECONNABORTED' ||
      (source?.isAxiosError && !source?.response)
  );

// The API answers rejected forms with "Validation failed" plus a list of what is wrong
const getValidationDetails = (data) => {
  if (!Array.isArray(data?.errors)) return '';

  const messages = data.errors
    .map((item) => String(item?.message || '').trim())
    .filter(Boolean);

  return [...new Set(messages)].join(' ');
};

export const getAuthErrorMessage = (source, fallback = 'Something went wrong. Please try again.') => {
  const status = source?.response?.status ?? source?.status;
  const data = source?.response?.data ?? source?.error;

  if (isNetworkFailure(source)) return NO_CONNECTION;

  if (status === 429) return data?.message || TOO_MANY_REQUESTS;

  if (status >= 500) return SERVER_PROBLEM;

  const details = getValidationDetails(data);
  if (details) return details;

  if (data?.message) return data.message;

  // Plain Errors thrown by our own code already carry a readable message
  if (source instanceof Error && !source.isAxiosError && source.message) return source.message;

  if (typeof source?.message === 'string' && source.message && source.status !== undefined) {
    return source.message;
  }

  return fallback;
};

// "Please wait 42 seconds before requesting another OTP" -> 42
export const getRetryAfterSeconds = (message) => {
  const match = String(message || '').match(/(\d+)\s*seconds?/i);
  return match ? Number(match[1]) : 0;
};
