import { z } from 'zod'

// Mumbai station validation - checks against known stations
const mumbaiStations = [
  'CSMT', 'Masjid', 'Sandhurst Road', 'Dockyard Road', 'Reay Road', 'Cotton Green',
  'Sewri', 'Vadala Road', 'Guru Tegh Bahadur Nagar', 'Chembur', 'Tilaknagar', 'Kurla',
  'Vidyavihar', 'Ghatkopar', 'Vikhroli', 'Kanjurmarg', 'Bhandup', 'Nahur', 'Mulund',
  'Thane', 'Kalwa', 'Mumbra', 'Diva Junction', 'Kopar', 'Dombivli', 'Thakurli',
  'Kalyan', 'Vithalwadi', 'Ulhasnagar', 'Ambernath', 'Badlapur', 'Vangani', 'Shelu',
  'Neral', 'Bhivpuri Road', 'Karjat', 'Churchgate', 'Marine Lines', 'Charni Road',
  'Grant Road', 'Mumbai Central', 'Mahalaxmi', 'Lower Parel', 'Elphinstone Road',
  'Dadar', 'Matunga Road', 'Mahim Junction', 'Bandra', 'Khar Road', 'Santacruz',
  'Vile Parle', 'Andheri', 'Jogeshwari', 'Ram Mandir', 'Goregaon', 'Malad', 'Kandivali',
  'Borivali', 'Dahisar', 'Mira Road', 'Bhayandar', 'Naigaon', 'Vasai Road', 'Nallasopara',
  'Virar', 'Panvel', 'Kharghar', 'Belapur', 'Seawoods Darave', 'Nerul', 'Juinagar',
  'Sanpada', 'Vashi', 'Mankhurd', 'Vashi'
] as const

// Create a union type for better type safety
type MumbaiStation = typeof mumbaiStations[number]

// Station name validation with fuzzy matching
const stationNameSchema = z.string()
  .min(2, 'Station name must be at least 2 characters')
  .max(100, 'Station name must be less than 100 characters')
  .refine((val) => {
    const normalizedInput = val.toLowerCase().trim()
    return mumbaiStations.some(station => 
      station.toLowerCase().includes(normalizedInput) || 
      normalizedInput.includes(station.toLowerCase())
    ) || val.toLowerCase().includes('mall') || 
        val.toLowerCase().includes('airport') ||
        val.toLowerCase().includes('bkc')
  }, {
    message: 'Please enter a valid Mumbai station, landmark, or area'
  })

// Location validation (more flexible for landmarks and areas)
const locationSchema = z.string()
  .min(2, 'Location must be at least 2 characters')
  .max(100, 'Location name is too long')
  .regex(/^[a-zA-Z0-9\s\-\(\)\.]+$/, 'Location contains invalid characters')
  .refine((val) => val.trim().length > 0, {
    message: 'Location cannot be empty'
  })

// Journey search form validation schema
export const journeySearchSchema = z.object({
  origin: locationSchema.refine((val) => val.trim().length > 0, {
    message: 'Please select or enter your starting location'
  }),
  destination: locationSchema.refine((val) => val.trim().length > 0, {
    message: 'Please select or enter your destination'
  }),
  maxTransfers: z.number()
    .min(0, 'Transfers cannot be negative')
    .max(5, 'Maximum 5 transfers allowed')
    .default(2),
  timeBuffer: z.number()
    .min(0, 'Time buffer must be positive')
    .max(100, 'Time buffer cannot exceed 100%')
    .default(10),
  travelTime: z.string()
    .regex(/^(now|[0-9]{2}:[0-9]{2})$/, 'Invalid time format')
    .optional()
    .default('now'),
  travelDate: z.date()
    .min(new Date(), 'Cannot plan journey for past dates')
    .max(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'Cannot plan journey more than 30 days ahead')
    .optional()
    .default(new Date())
}).refine((data) => data.origin.toLowerCase() !== data.destination.toLowerCase(), {
  message: 'Origin and destination cannot be the same',
  path: ['destination']
})

// Settings form validation schemas
export const notificationSettingsSchema = z.object({
  delays: z.boolean().default(true),
  crowdUpdates: z.boolean().default(false),
  newRoutes: z.boolean().default(true),
  maintenance: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false)
})

export const journeyPreferencesSchema = z.object({
  defaultTransfers: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: 'Please select a valid transfer option' })
  }).default('2'),
  walkingSpeed: z.enum(['slow', 'normal', 'fast'], {
    errorMap: () => ({ message: 'Please select a valid walking speed' })
  }).default('normal'),
  preferredLines: z.array(z.string()).default([]),
  avoidCrowdedTrains: z.boolean().default(false),
  accessibilityNeeds: z.boolean().default(false)
})

export const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Please select a valid theme' })
  }).default('system'),
  language: z.enum(['english', 'hindi', 'marathi'], {
    errorMap: () => ({ message: 'Please select a valid language' })
  }).default('english'),
  fontSize: z.enum(['small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Please select a valid font size' })
  }).default('medium'),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false)
})

// Profile settings validation
export const profileSettingsSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Display name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional(),
  phoneNumber: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number')
    .optional(),
  defaultLocation: locationSchema.optional(),
  workLocation: locationSchema.optional(),
  homeLocation: locationSchema.optional()
})

// Feedback form validation
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'accessibility'], {
    errorMap: () => ({ message: 'Please select a feedback type' })
  }),
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Please provide more details (at least 10 characters)')
    .max(1000, 'Description must be less than 1000 characters'),
  urgency: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select urgency level' })
  }).default('medium'),
  contactBack: z.boolean().default(false)
})

// Error message formatting utility
export const formatZodError = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    fieldErrors[path] = err.message
  })
  
  return fieldErrors
}

// Validation helper for real-time validation
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown) => {
  try {
    schema.parse(value)
    return { success: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Invalid value' 
      }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Type exports for use in components
export type JourneySearchData = z.infer<typeof journeySearchSchema>
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>
export type JourneyPreferences = z.infer<typeof journeyPreferencesSchema>
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>
export type ProfileSettings = z.infer<typeof profileSettingsSchema>
export type FeedbackData = z.infer<typeof feedbackSchema>

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  tooShort: (min: number) => `Must be at least ${min} characters`,
  tooLong: (max: number) => `Must be less than ${max} characters`,
  invalidLocation: 'Please enter a valid Mumbai location',
  sameLocation: 'Origin and destination cannot be the same',
  pastDate: 'Cannot select a past date',
  futureLimit: 'Cannot select a date more than 30 days ahead'
}