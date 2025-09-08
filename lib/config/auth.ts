/**
 * Auth Configuration
 * ==================
 * Centralized authentication configuration and constants
 */

export const AUTH_CONFIG = {
  // Rate limits
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    OTP_RESEND_COOLDOWN_SECONDS: 60,
    EMAIL_RESEND_COOLDOWN_SECONDS: 60,
    PASSWORD_RESET_COOLDOWN_SECONDS: 300, // 5 minutes
  },

  // OTP settings
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    RETRY_ATTEMPTS: 3,
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },

  // Session settings
  SESSION: {
    PERSIST: true,
    AUTO_REFRESH: true,
    DETECT_SESSION_IN_URL: true,
  },

  // Redirect paths
  REDIRECTS: {
    AFTER_LOGIN: "/profile",
    AFTER_LOGOUT: "/",
    AFTER_REGISTER: "/auth/verify-email",
    AFTER_EMAIL_CONFIRMATION: "/auth/login?confirmed=true",
    AFTER_PASSWORD_RESET: "/auth/login?reset=true",
    LOGIN_REQUIRED: "/auth/login",
  },

  // Email settings
  EMAIL: {
    CONFIRMATION_REQUIRED: true,
    RESEND_LIMIT_PER_HOUR: 3,
  },

  // Phone settings  
  PHONE: {
    VERIFICATION_REQUIRED: false,
    DEFAULT_COUNTRY: "AE",
    SUPPORTED_COUNTRIES: ["AE", "SA", "KW", "QA", "BH", "OM", "US", "GB"],
  },

  // Feature flags
  FEATURES: {
    PHONE_LOGIN: true,
    EMAIL_LOGIN: true,
    SOCIAL_LOGIN: false,
    TWO_FACTOR_AUTH: false,
    GUEST_CHECKOUT: true,
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;

// Helper function to get redirect URL with origin
export function getAuthRedirectUrl(path: string): string {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${origin}${path}`;
}