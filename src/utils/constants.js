// Microservice base URLs
export const API_URLS = {
  auth:     import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5114/api',
  resume:   import.meta.env.VITE_RESUME_API_URL || 'http://localhost:5114/api',
  section:  import.meta.env.VITE_SECTION_API_URL || 'http://localhost:5114/api',
  ai:       import.meta.env.VITE_AI_API_URL || 'http://localhost:5114/api',
  export:   import.meta.env.VITE_EXPORT_API_URL || 'http://localhost:5114/api',
  template: import.meta.env.VITE_TEMPLATE_API_URL || 'http://localhost:5114/api',
}


// Token storage keys
export const TOKEN_KEYS = {
  access:  'rai_access_token',
  refresh: 'rai_refresh_token',
}

// Subscription plans
export const PLANS = {
  FREE:    'FREE',
  PREMIUM: 'PREMIUM',
}

// Resume status
export const RESUME_STATUS = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
}

// Section types
export const SECTION_TYPES = [
  'SUMMARY',
  'EXPERIENCE',
  'EDUCATION',
  'SKILLS',
  'CERTIFICATIONS',
  'PROJECTS',
  'LANGUAGES',
  'VOLUNTEER',
  'CUSTOM',
]

// Template categories
export const TEMPLATE_CATEGORIES = [
  'PROFESSIONAL',
  'CREATIVE',
  'MODERN',
  'MINIMALIST',
  'ATS_OPTIMISED',
]
