/**
 * Password Strength Utilities
 * ============================
 * Password validation and strength checking
 */

import { AUTH_CONFIG } from '@/lib/config/auth';

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= AUTH_CONFIG.PASSWORD.MIN_LENGTH,
    hasUppercase: AUTH_CONFIG.PASSWORD.REQUIRE_UPPERCASE ? /[A-Z]/.test(password) : true,
    hasLowercase: AUTH_CONFIG.PASSWORD.REQUIRE_LOWERCASE ? /[a-z]/.test(password) : true,
    hasNumbers: AUTH_CONFIG.PASSWORD.REQUIRE_NUMBERS ? /\d/.test(password) : true,
    hasSpecialChars: AUTH_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
  };

  const feedback: string[] = [];
  let score = 0;

  if (!requirements.minLength) {
    feedback.push(`Password must be at least ${AUTH_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
  } else {
    score += 1;
  }

  if (!requirements.hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!requirements.hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!requirements.hasNumbers) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!requirements.hasSpecialChars) {
    feedback.push('Password must contain at least one special character');
  }

  // Bonus points for length and complexity
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 0.5;

  const isValid = Object.values(requirements).every(req => req);
  
  return {
    isValid,
    score: Math.min(Math.floor(score), 4),
    feedback,
    requirements,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Weak';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-red-500';
  }
}