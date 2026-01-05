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
- [ ] Trends page - biomarker charts with multi-selection (placeholder created)
- [ ] Device page - Bluetooth pairing UI (placeholder created)
- [ ] Alerts page - notification system (placeholder created)
- [ ] Journal page - health journaling (placeholder created)
- [ ] Medications page - medication tracking (placeholder created)
- [ ] Insights page - AI-powered analysis (placeholder created)
- [ ] Profile page - reports, backup, settings (placeholder created)
- [ ] Appointments page - scheduling system (placeholder created)
- [ ] Care Team page - provider management (placeholder created)

## Phase 4: Backend Integration
- [x] tRPC routers for all features
- [x] Database query helpers
- [ ] AI/ML pattern detection
- [ ] Relapse prediction algorithms
- [ ] Export functionality (all formats)
- [ ] Bluetooth device management API

## Phase 5: Testing & Deployment
- [ ] Test all pages and features
- [ ] Create checkpoint
- [ ] Deploy to production
- [ ] Verify both mobile and web versions work

## Notes
- Mobile app (React Native) already exists at /home/ubuntu/mindsense-web
- Web app (React + Vite) created at /home/ubuntu/mindsense-webapp
- FibroSense source code at /home/ubuntu/fibrosense-app
- Core backend infrastructure complete
- Placeholder pages created for all routes
- Full page implementations can be completed iteratively
