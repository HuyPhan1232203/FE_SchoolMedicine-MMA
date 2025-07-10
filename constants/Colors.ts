/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2B7A78'; // Medical teal
const tintColorDark = '#17525F';  // Darker medical teal

export const Colors = {
  light: {
    text: '#2F3E46',
    background: '#FEFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#84A98C',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#CAD2C5',
    background: '#2F3E46',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#84A98C',
    tabIconSelected: tintColorDark,
  },
};

// Medical School Color Palette
export const MedicalColors = {
  // Primary Colors (Medical Theme)
  primary: '#2B7A78',        // Medical Teal - Professional, trustworthy
  primaryLight: '#52C4C2',   // Light Teal - Friendly, approachable  
  primaryDark: '#17525F',    // Dark Teal - Authority, seriousness
  
  // Secondary Colors (Health & Care)
  secondary: '#84A98C',      // Sage Green - Calming, health
  secondaryLight: '#A8DADC', // Light Blue Green - Peaceful
  secondaryDark: '#52796F',  // Forest Green - Stability
  
  // Accent Colors (School Environment)
  accent: '#457B9D',         // School Blue - Educational, professional
  accentLight: '#A8DADC',    // Light Blue - Open, welcoming
  warning: '#F1C40F',        // Medical Yellow - Attention, caution
  
  // Status Colors
  success: '#27AE60',        // Medical Green - Healthy, approved
  error: '#E74C3C',          // Medical Red - Alert, emergency
  info: '#3498DB',           // Medical Blue - Information, guidance
  
  // Background & Text
  background: '#FEFFFF',     // Clean White - Sterile, clean
  backgroundSecondary: '#F1FAEE', // Light Green Tint - Soft, medical
  backgroundCard: '#FFFFFF', // Pure White - Clean cards
  
  // Text Colors
  textPrimary: '#2F3E46',    // Dark Gray Green - Professional
  textSecondary: '#354F52',  // Medium Gray Green - Secondary info
  textMuted: '#84A98C',      // Sage - Subtle text
  textLight: '#CAD2C5',      // Light Gray Green - Disabled text
  
  // Role-Based Colors
  parent: '#A8DADC',         // Light Blue - Caring, nurturing
  medicalStaff: '#2B7A78',   // Medical Teal - Professional medical
  administrator: '#457B9D',   // School Blue - Authority, management
  
  // Border & Divider
  border: '#E9F5F5',         // Very Light Teal - Subtle borders
  borderMedium: '#CAD2C5',   // Medium - Normal borders
  borderDark: '#84A98C',     // Dark - Emphasized borders
  
  // Input & Form Colors
  inputBackground: '#FEFFFF',
  inputBorder: '#CAD2C5',
  inputBorderFocus: '#2B7A78',
  inputBorderError: '#E74C3C',
  inputBorderSuccess: '#27AE60',
  
  // Shadow Colors
  shadowLight: 'rgba(43, 122, 120, 0.1)',
  shadowMedium: 'rgba(43, 122, 120, 0.2)',
  shadowDark: 'rgba(43, 122, 120, 0.3)',
};

// User Role Colors
export const RoleColors = {
  parent: {
    primary: MedicalColors.parent,
    background: '#F8FFFE',
    text: MedicalColors.textPrimary,
    icon: '👨‍👩‍👧‍👦',
  },
  medical_staff: {
    primary: MedicalColors.medicalStaff,
    background: '#F1FAEE',
    text: MedicalColors.textPrimary,
    icon: '👩‍⚕️',
  },
  administrator: {
    primary: MedicalColors.administrator,
    background: '#F6FFFE',
    text: MedicalColors.textPrimary,
    icon: '👨‍💼',
  },
};

// Medical Status Colors
export const MedicalStatusColors = {
  healthy: '#27AE60',        // Green - Good health
  attention: '#F39C12',      // Orange - Needs attention
  urgent: '#E74C3C',         // Red - Urgent medical attention
  pending: '#95A5A6',        // Gray - Pending review
  approved: '#2ECC71',       // Light Green - Approved
  rejected: '#E67E22',       // Orange Red - Rejected
};

// Common Medical Icons (Unicode)
export const MedicalIcons = {
  // Health & Medical
  health: '🏥',
  doctor: '👩‍⚕️',
  nurse: '👨‍⚕️',
  stethoscope: '🩺',
  medicine: '💊',
  thermometer: '🌡️',
  syringe: '💉',
  bandage: '🩹',
  
  // School & Education
  school: '🏫',
  student: '👨‍🎓',
  teacher: '👩‍🏫',
  book: '📚',
  bell: '🔔',
  
  // Family & Parents
  family: '👨‍👩‍👧‍👦',
  parent: '👨‍👩‍👧',
  child: '👶',
  
  // Status & Actions
  check: '✅',
  warning: '⚠️',
  alert: '🚨',
  info: 'ℹ️',
  calendar: '📅',
  report: '📋',
  notification: '🔔',
  
  // Admin & System
  profile: '👤',
  security: '🔒',
  language: '🌐',
  users: '👥',
  approval: '✅',
  settings: '⚙️',
  import: '📥',
  logs: '📄',
  backup: '💾',
  records: '📁',
  emergency: '🚨',
};
