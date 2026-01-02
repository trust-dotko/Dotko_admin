# DOTKO.IN Admin Portal

A Next.js-based admin dashboard for managing the DOTKO.IN MSME Trust Platform.

## Features

### 🏠 Dashboard
- **Overview Statistics**: Total users, reports, pending/resolved counts
- **Real-time Data**: Live stats from Firebase Firestore
- **Recent Activity**: Timeline of latest users, reports, and notifications
- **Quick Navigation**: Easy access to all management pages

### 👥 User Management
- **Complete User List**: View all registered businesses
- **Search & Filter**: Search by name, email, GST, mobile number
- **User Status**: Track onboarding completion status
- **Detailed Information**: View business details, contact info, GST/PAN

### 📄 Reports Management
- **All Reports**: Comprehensive list of filed reports
- **Status Filtering**: Filter by pending, resolved, published, etc.
- **Search Functionality**: Find reports by customer, supplier, invoice
- **Amount Tracking**: Monitor payment disputes and amounts

### 🔔 Notifications
- **System Notifications**: View all app notifications
- **Read/Unread Status**: Track notification status
- **Type Filtering**: Filter by notification type
- **Complete Details**: Customer names, emails, GST numbers

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Access to DOTKO.IN Firebase project

### Installation

1. Navigate to the admin portal directory:
```bash
cd /Users/anishakumari/Desktop/Work/dtk-admin
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3001
```

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
dtk-admin/
├── app/
│   ├── page.tsx              # Dashboard home
│   ├── users/
│   │   └── page.tsx          # User management
│   ├── reports/
│   │   └── page.tsx          # Reports management
│   ├── notifications/
│   │   └── page.tsx          # Notifications view
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── firebase.ts           # Firebase configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Firebase Configuration

The admin portal connects to the same Firebase project as the mobile app:
- **Project ID**: dotko-b2543
- **Collections Used**: `users`, `reports`, `notifications`

## Features by Page

### Dashboard (`/`)
- Total users count
- Total reports count
- Pending reports count
- Resolved reports count
- Recent activity feed
- Navigation cards to all sections

### Users (`/users`)
- Searchable user table
- Stats: Total users, completed onboarding, pending onboarding
- User details: Business name, email, mobile, GST, PAN, entity type
- Status indicators

### Reports (`/reports`)
- Searchable reports table
- Filter by status
- Stats: Total, pending, resolved, published
- Report details: Customer, supplier, amount, invoice, status, date

### Notifications (`/notifications`)
- All system notifications
- Filter by type
- Stats: Total, unread, report alerts
- Notification details: Recipient, customer, message, timestamp

## Color Scheme

- **Primary**: Blue (#1E40AF)
- **Success**: Green (#22C55E)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

## Access URL

**Local Development**: http://localhost:3001

## Notes

- The portal runs on port 3001 (mobile app Expo runs on 8081, 19000, 19001)
- All data is read-only from Firebase (no write/delete operations implemented for safety)
- Real-time updates require page refresh (no live listeners implemented)
- Mobile-responsive design with Tailwind CSS

## Future Enhancements

Possible additions:
- Authentication/login for admin access
- Real-time data updates with Firebase listeners
- Export data to CSV/Excel
- Analytics charts and graphs
- User/report management actions (approve, delete, etc.)
- Email notifications
- Activity logs and audit trail
