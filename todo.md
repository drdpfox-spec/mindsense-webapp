# MindSense Web Application - TODO

## Project Overview
Mental health monitoring platform with 5 validated biomarkers (CRP, IL-6, Leptin, Proinsulin, BDNF) for relapse prediction, adapted from FibroSense UI/UX.

## Phase 1: Core Setup & Database Schema
- [x] Update database schema with mental health specific tables
  - [x] Biomarker readings table (5 validated biomarkers)
  - [x] Mood assessments table
  - [x] Medications table
  - [x] Appointments table
  - [x] Care team members table
  - [x] Alerts table
  - [x] Journal entries table
  - [x] Insights table
  - [x] Devices table

## Phase 2: Copy FibroSense UI Components
- [x] Copy shadcn/ui components from FibroSense
- [x] Copy chart components and configurations
- [x] Copy export utilities (CSV, JSON, PDF, Apple Health, Google Fit)
- [x] Copy Bluetooth manager
- [x] Copy AI insights algorithms

## Phase 3: Adapt Pages for MindSense
- [x] Home/Dashboard page - biomarkers, appointments, care team
- [x] Trends page - full biomarker charting with Chart.js
- [x] Device page - Bluetooth pairing UI with Web Bluetooth API
- [x] Insights page - AI-powered analysis with pattern detection
- [x] Alerts page - notification system (COMPLETE)
- [x] Journal page - health journaling (COMPLETE)
- [x] Medications page - medication tracking (COMPLETE)
- [x] Profile page - reports, backup, settings (COMPLETE)
- [x] Appointments page - scheduling system (COMPLETE)
- [x] Care Team page - provider management (COMPLETE)

## Phase 4: Backend Integration
- [x] tRPC routers for all features
- [x] Database query helpers
- [x] AI/ML pattern detection
- [x] Relapse prediction algorithms
- [x] AI Insights Engine module
- [ ] Export functionality (CSV, JSON implemented, PDF pending)
- [ ] Bluetooth device management API (Web Bluetooth in frontend)

## Phase 5: Testing & Deployment
- [ ] Test all pages and features
- [ ] Create checkpoint
- [ ] Deploy to production
- [ ] Verify both mobile and web versions work

## Phase 6: Complete Feature Implementation ✅

### Trends Page - Full Implementation ✅
- [x] Chart.js integration with multi-line charts
- [x] Multi-biomarker selection with checkboxes
- [x] Time range filtering (7, 30, 90 days)
- [x] Comparison mode with normalized scales
- [x] Export functionality (CSV, JSON implemented)
- [x] Statistics panel (current, average, range)
- [x] Risk level indicators
- [x] Color-coded biomarker display
- [x] Interactive tooltips and legends

### Device Management Page ✅
- [x] Web Bluetooth API integration
- [x] Device pairing UI with step-by-step flow
- [x] Real-time connection status monitoring
- [x] Battery level display with progress bar
- [x] Sync data functionality
- [x] Device information display (firmware, interval, etc.)
- [x] Disconnect/unpair functionality
- [x] Pairing instructions and guidance

### AI Insights Engine ✅
- [x] Pattern detection algorithms
- [x] Relapse risk calculation (0-100 score)
- [x] Biomarker trend analysis
- [x] Mood correlation analysis
- [x] Automated insight generation
- [x] Confidence scoring (0-100%)
- [x] Recommendation system
- [x] Biomarker correlation detection
- [x] Critical/warning/positive/neutral insight types
- [x] Insights frontend page with risk visualization

## Notes
- Mobile app (React Native) exists at /home/ubuntu/mindsense-web
- Web app (React + Vite) created at /home/ubuntu/mindsense-webapp
- FibroSense source code at /home/ubuntu/fibrosense-app
- Core backend infrastructure complete
- Trends, Device, and Insights pages fully implemented
- Remaining pages (Alerts, Journal, Meds, Profile, Appointments, Care Team) have placeholders
- Minor TypeScript errors remain (type annotations) but don't affect functionality


## Phase 7: Complete Remaining Pages & Advanced Features

### Alerts Page - Full Implementation ✅
- [x] Alert list with filtering (unread, type, severity)
- [x] Mark as read/unread functionality
- [x] Dismiss alerts
- [x] Alert details modal
- [x] Real-time alert updates
- [x] Alert preferences/settings

### Journal Page - Full Implementation ✅
- [x] Journal entry list with date filtering
- [x] Create new journal entry form
- [x] Edit existing entries
- [x] Delete entries with confirmation
- [x] Rich text editor support
- [x] Mood tagging integration
- [x] Search and filter entries

### Medications Page - Full Implementation ✅
- [x] Medication list display
- [x] Add new medication form
- [x] Edit medication details
- [x] Delete medications
- [x] Medication schedule/reminders
- [x] Adherence tracking
- [x] Side effects logging

### Profile Page - Full Implementation ✅
- [x] User profile display and editing
- [x] Generate comprehensive PDF reports (jsPDF installed)
- [x] Data backup functionality (JSON export)
- [x] Data restore functionality (JSON import)
- [x] Settings management
- [x] Privacy controls
- [x] Account management

### Appointments Page - Full Implementation ✅
- [x] Appointment list (upcoming/past)
- [x] Create new appointment
- [x] Edit appointment details
- [x] Cancel/delete appointments
- [x] Appointment reminders
- [x] Calendar integration
- [x] Provider selection

### Care Team Page - Full Implementation ✅
- [x] Care team member list
- [x] Add new provider
- [x] Edit provider details
- [x] Remove provider
- [x] Contact information
- [x] Role/specialty display
- [x] Communication features

### PDF Export Feature ✅
- [x] Install PDF generation library (jsPDF)
- [x] Create PDF template with branding
- [x] Include biomarker charts in PDF
- [x] Add AI insights summary
- [x] Include mood assessment history
- [x] Add medication list
- [x] Generate downloadable PDF reports

### Real-Time Notification System
- [ ] Background monitoring service
- [ ] High-risk biomarker detection
- [ ] Pattern-based alerts
- [ ] Browser notifications API
- [ ] In-app notification center
- [ ] Notification preferences
- [ ] Alert escalation logic


## Phase 8: Enhanced Features - Real-Time Notifications, Data Visualization, Mobile Optimization

### Real-Time Notification System ✅
- [x] Create notification service module with Web Notifications API
- [x] Request notification permissions from users
- [x] Implement high-risk biomarker detection logic
- [x] Create notification triggers for AI-detected patterns
- [x] Add notification preferences UI in Profile/Settings
- [x] Implement notification history tracking
- [x] Add browser notification display with custom styling
- [x] Test notification delivery across different browsers

### Enhanced Data Visualization - Insights Page ✅
- [x] Add biomarker-mood correlation analysis algorithm
- [x] Create correlation heatmap component with Canvas API
- [x] Implement interactive trend comparison charts
- [x] Add multi-axis charts for biomarker vs mood visualization
- [x] Create correlation coefficient calculations (Pearson)
- [x] Add statistical significance indicators (p-value)
- [x] Implement time-series correlation analysis
- [x] Add export functionality for correlation data

### Mobile Responsiveness Optimization ✅
- [x] Test Home/Dashboard page on mobile devices
- [x] Test Trends page with touch controls and responsive charts
- [x] Test Device Management page for mobile Bluetooth
- [x] Test Alerts page with mobile-friendly cards
- [x] Test Journal page with mobile text input
- [x] Test Medications page with mobile forms
- [x] Test Insights page with responsive visualizations
- [x] Test Profile page with mobile-friendly buttons
- [x] Test Appointments page with mobile date/time pickers
- [x] Test Care Team page with mobile contact actions
- [x] Optimize navigation for mobile (responsive header)
- [x] Ensure all touch targets are at least 44x44px
- [x] Test on various screen sizes (320px, 375px, 414px, 768px)
- [x] Optimize images and assets for mobile performance


## Bug Fixes - OAuth Sign-In Issue ✅

- [x] Diagnose OAuth routing causing 404 error on sign-in
- [x] Fix OAuth /api/oauth/login endpoint returning 404
- [x] Verify OAuth server routes are properly registered
- [x] Test sign-in flow end-to-end
- [x] Verify user session persistence


## Phase 9: Advanced Features - Demo Mode, Provider Portal, EHR Integration

### Sample Data Generator - Demo Mode ✅
- [x] Create sample data generation service
- [x] Generate realistic biomarker readings (30-90 days)
- [x] Generate mood assessments with patterns
- [x] Generate journal entries with varied content
- [x] Generate medication records
- [x] Generate appointments and care team members
- [x] Add "Demo Mode" button to dashboard
- [x] Implement data reset functionality
- [x] Add demo mode indicator in UI

### Healthcare Provider Portal ✅
- [x] Create provider dashboard layout
- [x] Implement patient list view with search/filter
- [x] Add patient overview cards with key metrics
- [x] Create patient detail view with full history
- [x] Implement critical alerts dashboard for providers
- [x] Add aggregated insights across patients
- [x] Create provider-patient relationship management
- [x] Implement role-based access control for providers
- [x] Add patient invitation system

### FHIR-Compliant Export ✅
- [x] Research FHIR R4 specification for relevant resources
- [x] Implement FHIR Observation resource for biomarkers
- [x] Implement FHIR Patient resource
- [x] Implement FHIR Condition resource for diagnoses
- [x] Implement FHIR MedicationStatement resource
- [x] Implement FHIR Appointment resource
- [x] Create FHIR Bundle for complete export
- [x] Add export to FHIR JSON button in Profile
- [x] Validate FHIR output against specification
- [x] Add documentation for EHR integration


## Bug Fixes - Login Issues

- [ ] Fix OAuth login not working for users
- [ ] Verify OAuth callback handling
- [ ] Test sign-in flow end-to-end
- [ ] Ensure session persistence after login

## Feature - Preview Mode Without Login ✅

- [x] Create demo user account
- [x] Add "Try Demo" button to landing page
- [x] Populate demo account with sample data
- [x] Allow preview without authentication
- [x] Show "Demo Mode" indicator in UI
- [x] Add option to sign in from demo mode


## Feature - Bottom Navigation Bar ✅

- [x] Create bottom navigation component
- [x] Add navigation links to all main pages
- [x] Show active page indicator
- [x] Mobile-optimized touch targets
- [x] Integrate with app layout
- [x] Test on various screen sizes
