/**
 * Test Data Fixtures for E2E Tests
 *
 * Contains reusable test data for authentication, offers, candidates, etc.
 */

// ============================================
// AUTH FIXTURES
// ============================================

export const testUsers = {
  admin: {
    username: "admin@test.com",
    password: "TestPassword123!",
    role: "org_admin",
    firstName: "Admin",
    lastName: "User",
  },
  recruiter: {
    username: "recruiter@test.com",
    password: "TestPassword123!",
    role: "org_recruiter",
    firstName: "Recruiter",
    lastName: "User",
  },
  candidate: {
    username: "candidate@test.com",
    password: "TestPassword123!",
    role: "candidate",
    firstName: "Test",
    lastName: "Candidate",
  },
} as const;

// ============================================
// JOB OFFER FIXTURES
// ============================================

export const testJobOffer = {
  title: "Senior Frontend Developer",
  description: "We are looking for an experienced frontend developer...",
  category: "IT",
  location: "Madrid",
  contractType: "full_time",
  modality: "hybrid",
  isPublic: true,
  requirements: "5+ years of experience with React",
  benefits: "Flexible hours, remote work options",
  salaryMin: 45000,
  salaryMax: 65000,
} as const;

export const testJobOfferMinimal = {
  title: "Junior Developer",
  description: "Entry level position",
  category: "IT",
  location: "Barcelona",
  contractType: "full_time",
  modality: "on_site",
  isPublic: false,
} as const;

// ============================================
// CLIENT FIXTURES
// ============================================

export const testClient = {
  name: "Test Company S.L.",
  email: "contact@testcompany.com",
  phone: "+34 612 345 678",
  address: "Calle Test 123, Madrid",
  notes: "Important client for testing",
} as const;

// ============================================
// CANDIDATE FIXTURES
// ============================================

export const testCandidate = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+34 600 123 456",
  linkedIn: "https://linkedin.com/in/johndoe",
} as const;

// ============================================
// URLS
// ============================================

export const urls = {
  // Public
  home: "/",
  login: "/login",
  register: "/register",
  publicJobs: "/jobs",

  // Dashboard
  dashboard: "/app/dashboard",
  offers: "/app/offers",
  clients: "/app/clients",
  team: "/app/team",
  analytics: "/app/analytics",
  settings: "/app/settings",

  // Candidate Portal
  candidatePortal: "/portal/dashboard",
  candidateProfile: "/portal/profile",
  candidateProcesses: "/portal/processes",

  // Sysadmin
  sysadminLogin: "/sysadmin/login",
  sysadminDashboard: "/sysadmin/dashboard",
} as const;

// ============================================
// SELECTORS
// ============================================

export const selectors = {
  // Auth
  usernameInput: '[data-testid="username-input"]',
  passwordInput: '[data-testid="password-input"]',
  loginButton: '[data-testid="login-button"]',
  logoutButton: '[data-testid="logout-button"]',

  // Navigation
  sidebar: '[data-testid="sidebar"]',
  userMenu: '[data-testid="user-menu"]',

  // Offers
  offerCard: '[data-testid="offer-card"]',
  createOfferButton: '[data-testid="create-offer-button"]',
  offerForm: '[data-testid="offer-form"]',

  // Common
  loadingSpinner: '[data-testid="loading"]',
  errorMessage: '[data-testid="error-message"]',
  successToast: '[data-testid="toast-success"]',
  modal: '[data-testid="modal"]',
} as const;
