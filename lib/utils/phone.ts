/**
 * Phone Utilities
 * ===============
 * Centralized phone number validation and formatting using libphonenumber-js
 */

import { 
  isValidPhoneNumber, 
  parsePhoneNumber, 
  parsePhoneNumberWithError,
  CountryCode,
  PhoneNumber,
  AsYouType
} from "libphonenumber-js";
import { AUTH_CONFIG } from "@/lib/config/auth";

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  international?: string;
  national?: string;
  countryCode?: CountryCode;
  error?: string;
}

/**
 * Validate and format a phone number
 */
export function validatePhoneNumber(
  phone: string, 
  defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode
): PhoneValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const trimmedPhone = phone.trim();
  
  try {
    // First check if it's a valid phone number at all
    if (!isValidPhoneNumber(trimmedPhone, defaultCountry)) {
      return {
        isValid: false,
        error: 'Invalid phone number format'
      };
    }

    // Parse the phone number with error handling
    const phoneNumber = parsePhoneNumberWithError(trimmedPhone, defaultCountry);
    
    return {
      isValid: true,
      formatted: phoneNumber.format('E.164'),
      international: phoneNumber.format('INTERNATIONAL'),
      national: phoneNumber.format('NATIONAL'),
      countryCode: phoneNumber.country
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid phone number'
    };
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(
  phone: string,
  format: 'E.164' | 'INTERNATIONAL' | 'NATIONAL' = 'NATIONAL',
  defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode
): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    if (!phoneNumber) return phone;
    
    return phoneNumber.format(format);
  } catch {
    return phone;
  }
}

/**
 * Get E.164 format (required for Supabase Auth)
 */
export function getE164Format(
  phone: string,
  defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode
): string | null {
  try {
    const phoneNumber = parsePhoneNumberWithError(phone, defaultCountry);
    return phoneNumber.format('E.164');
  } catch {
    return null;
  }
}

/**
 * Check if phone number is from a specific country
 */
export function isPhoneFromCountry(
  phone: string,
  country: CountryCode,
  defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode
): boolean {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    return phoneNumber?.country === country;
  } catch {
    return false;
  }
}

/**
 * Mask phone number for display (e.g., +971******1234)
 */
export function maskPhoneNumber(
  phone: string,
  showLast: number = 4,
  defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode
): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    if (!phoneNumber) return phone;
    
    const formatted = phoneNumber.format('E.164');
    if (formatted.length <= showLast + 1) return formatted;
    
    const countryCode = formatted.substring(0, formatted.length - phoneNumber.nationalNumber.length);
    const lastDigits = formatted.slice(-showLast);
    const maskedLength = formatted.length - countryCode.length - showLast;
    
    return `${countryCode}${'*'.repeat(maskedLength)}${lastDigits}`;
  } catch {
    return phone;
  }
}

/**
 * Real-time phone formatter for input fields
 */
export class PhoneFormatter {
  private formatter: AsYouType;

  constructor(defaultCountry: CountryCode = AUTH_CONFIG.PHONE.DEFAULT_COUNTRY as CountryCode) {
    this.formatter = new AsYouType(defaultCountry);
  }

  format(input: string): string {
    this.formatter.reset();
    return this.formatter.input(input);
  }

  reset(): void {
    this.formatter.reset();
  }

  getPhoneNumber(): PhoneNumber | undefined {
    return this.formatter.getNumber();
  }
}

/**
 * Check if phone number is Egyptian (legacy support)
 */
export function isEgyptianPhoneNumber(phone: string): boolean {
  return isPhoneFromCountry(phone, 'EG');
}

/**
 * Validate Egyptian phone number (legacy support)
 */
export function validateEgyptianPhoneNumber(phone: string): PhoneValidationResult {
  return validatePhoneNumber(phone, 'EG');
}