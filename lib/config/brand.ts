/**
 * Brand Configuration
 * ===================
 * Centralized brand configuration for Gloria Natural
 */

export const BRAND_CONFIG = {
  APP_NAME: "Gloria Natural",
  APP_NAME_SHORT: "Gloria",
  SUPPORT_EMAIL: "support@glorianaturals.ae",
  SALES_EMAIL: "sales@glorianaturals.ae",
  MARKETING_TAGLINE: "Discover Your Perfect Scent",
  COMPANY_NAME: "Gloria Natural",
  DOMAIN: "glorianaturals.ae",
  
  // Social and contact
  PHONE: "+971-XXX-XXXX", // Update with actual phone
  ADDRESS: "UAE", // Update with actual address
  
  // SEO and meta
  META_TITLE_DEFAULT: "Gloria Natural - Premium Fragrances",
  META_DESCRIPTION: "Discover our exquisite collection of premium perfumes. Fast delivery, 14-day returns, and authentic fragrances from top brands.",
  META_KEYWORDS: "perfumes, fragrances, luxury perfumes, designer perfumes, cologne, eau de parfum, gloria naturals",
  
  // Legal
  TERMS_URL: "/terms",
  PRIVACY_URL: "/privacy",
  
  // URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://glorianaturals.ae",
  
  // Copyright
  COPYRIGHT_YEAR: new Date().getFullYear(),
  COPYRIGHT_TEXT: `© ${new Date().getFullYear()} Gloria Natural. All rights reserved.`,
} as const;

export type BrandConfig = typeof BRAND_CONFIG;