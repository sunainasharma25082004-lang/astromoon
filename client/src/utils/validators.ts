export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

export const validatePincode = (pincode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

export const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateBirthDate = (date: string): boolean => {
  const birthDate = new Date(date);
  const today = new Date();
  const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

  return birthDate <= minAge && birthDate >= maxAge;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
