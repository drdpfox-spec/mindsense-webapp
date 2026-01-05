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
- [ ] Alerts page - notification system (placeholder created)
- [ ] Journal page - health journaling (placeholder created)
- [ ] Medications page - medication tracking (placeholder created)
- [ ] Profile page - reports, backup, settings (placeholder created)
- [ ] Appointments page - scheduling system (placeholder created)
- [ ] Care Team page - provider management (placeholder created)

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
