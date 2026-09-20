// Client-side copies of the rules the API enforces (Banknode/validators/validation.rules.js),
// so people see the same limits on screen that the server will apply.

export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 30;
export const OTP_LENGTH = 6;

export const validateName = (value, label = 'Name') => {
  const name = String(value || '').trim();

  if (!name) return `${label} is required`;
  if (name.length < NAME_MIN) return `${label} must be at least ${NAME_MIN} characters`;
  if (name.length > NAME_MAX) return `${label} cannot exceed ${NAME_MAX} characters`;
  if (!/^[A-Za-z]+$/.test(name)) return `${label} can only contain letters`;

  return '';
};

export const validateUserName = (value) => {
  const userName = String(value || '').trim();

  if (!userName) return 'Username is required';
  if (userName.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (userName.length > USERNAME_MAX) return `Username cannot exceed ${USERNAME_MAX} characters`;
  if (!/^[A-Za-z0-9]+$/.test(userName)) return 'Username can only contain letters and numbers';

  return '';
};

export const validateEmail = (value) => {
  const email = String(value || '').trim();

  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address';

  return '';
};

export const validatePassword = (value) => {
  const password = String(value || '');

  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (password.length > PASSWORD_MAX) return `Password cannot exceed ${PASSWORD_MAX} characters`;

  return '';
};

// The rules the server actually enforces, for the on-screen checklist
export const getPasswordRuleChecks = (value) => {
  const password = String(value || '');

  return [
    {
      id: 'length',
      label: `${PASSWORD_MIN} to ${PASSWORD_MAX} characters`,
      met: password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX,
    },
  ];
};

// Advisory only: the server does not require any of this, but it is worth nudging toward
export const getPasswordStrength = (value) => {
  const password = String(value || '');
  let score = 0;

  if (password.length >= PASSWORD_MIN) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
};

export const PASSWORD_STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
