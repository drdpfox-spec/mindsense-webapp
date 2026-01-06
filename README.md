# MindSense

> Mental health biomarker tracking and analysis platform with real-time monitoring

MindSense is a comprehensive web application designed to help individuals and healthcare providers track, analyze, and understand mental health biomarkers over time. The platform combines real-time data collection with advanced visualization and AI-powered insights to support better mental health outcomes.

## ✨ Features

### Core Functionality
- **Multi-Biomarker Tracking**: Monitor 5 key biomarkers (CRP, IL-6, Leptin, Proinsulin, BDNF)
- **Real-Time Visualization**: Interactive Chart.js charts with multi-biomarker comparison
- **Time Range Filtering**: View trends over 7, 30, or 90-day periods
- **Baseline Values**: Reference ranges displayed for each biomarker
- **Data Export**: Export biomarker data as CSV or comprehensive PDF reports

### User Experience
- **Demo Mode**: Explore the platform with sample data before signing in
- **OAuth Authentication**: Secure login via Manus authentication
- **Responsive Design**: Mobile-first design with bottom navigation
- **Empty States**: Clear messaging when no data is available

### Technical Features
- **Type-Safe API**: End-to-end type safety with tRPC
- **Real-Time Updates**: Optimistic UI updates for instant feedback
- **Database Integration**: MySQL/TiDB with Drizzle ORM
- **Comprehensive Testing**: 14 Playwright E2E tests with CI/CD integration

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with modern hooks
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Chart.js** - Interactive data visualization
- **Wouter** - Lightweight routing
- **jsPDF** - PDF generation for reports

### Backend
- **Node.js 22** - JavaScript runtime
- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Type-safe database queries
- **MySQL/TiDB** - Relational database
- **Superjson** - Enhanced JSON serialization

### Testing & DevOps
- **Playwright** - End-to-end testing
- **Vitest** - Unit testing
- **GitHub Actions** - CI/CD automation
- **TypeScript** - Static type checking

## 📦 Installation

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL or TiDB database

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/drdpfox-spec/mindsense-webapp.git
   cd mindsense-webapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   The following environment variables are automatically injected by the Manus platform:
   - `DATABASE_URL` - MySQL/TiDB connection string
   - `JWT_SECRET` - Session cookie signing secret
   - `VITE_APP_ID` - Manus OAuth application ID
   - `OAUTH_SERVER_URL` - Manus OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL` - Manus login portal URL

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Testing

### Run E2E Tests
```bash
pnpm test:e2e
```

### Run Unit Tests
```bash
pnpm test
```

### View Test Report
```bash
pnpm exec playwright show-report
```

### Test Coverage
- ✅ Bottom navigation (9 pages)
- ✅ Biomarker display with baseline values
- ✅ Trends page filters and multi-biomarker mode
- ✅ Chart visualization
- ✅ Empty states
- ✅ Export functionality

## 📊 Database Schema

The application uses a comprehensive schema with 14 tables:

- **users** - User accounts and profiles
- **biomarker_readings** - Biomarker measurements over time
- **mood_assessments** - PHQ-9, GAD-7, and mood tracking
- **journal_entries** - User journal and notes
- **medications** - Medication tracking and reminders
- **appointments** - Healthcare appointments
- **care_team_members** - Healthcare provider information
- **alerts** - System notifications and alerts
- **devices** - Connected monitoring devices
- **insights** - AI-generated insights
- **relapse_risk_scores** - Risk assessment data
- **medication_logs** - Medication adherence tracking
- **access_tokens** - API access tokens
- **provider_patients** - Provider-patient relationships

## 🚀 Deployment

This application is designed to be deployed on the Manus platform, which provides:

- Automatic environment variable injection
- Built-in hosting with custom domains
- Database provisioning and management
- OAuth authentication
- S3 storage integration

### Manual Deployment

For deployment outside of Manus, you'll need to:

1. Set up a MySQL/TiDB database
2. Configure OAuth provider
3. Set up S3 or compatible storage
4. Configure all required environment variables
5. Run `pnpm build` to create production build
6. Deploy to your hosting provider

## 📖 Project Structure

```
mindsense-webapp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   └── _core/             # Framework plumbing
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── e2e/                   # Playwright E2E tests
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

## 🔒 Security

- OAuth 2.0 authentication via Manus
- JWT-based session management
- Secure HTTP-only cookies
- SQL injection protection via Drizzle ORM
- Type-safe API with tRPC
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Built with [Manus](https://manus.im) - AI-powered web development platform
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Testing with [Playwright](https://playwright.dev/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This application requires a Manus account for OAuth authentication and database access. Visit [manus.im](https://manus.im) to learn more.
