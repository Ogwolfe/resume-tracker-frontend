# Job Application Tracker

A modern React application for tracking job applications with advanced features and analytics.

## ✨ Features

### 📊 Analytics Dashboard
- **Application Statistics**: Total applications, recent applications (last 30 days), interviews, and rejections
- **Status Distribution**: Visual breakdown of application statuses with color-coded indicators
- **Real-time Updates**: Analytics update automatically as you add/edit applications

### 🔍 Smart Search & Filtering
- **Search**: Find applications by company name, position, or resume used
- **Status Filtering**: Filter by application status (Applied, Interview, Offer, Rejected, etc.)
- **Sorting**: Sort by date applied, company, position, or status
- **Clear Filters**: Easy one-click filter clearing

### 📅 Dual View Modes
- **List View**: Traditional list format with all details
- **Timeline View**: Chronological timeline with visual indicators and hover effects
- **Toggle**: Switch between views with a single click

### 📝 Notes & Reminders
- **Application Notes**: Add detailed notes about each application
- **Follow-up Reminders**: Set dates and descriptions for follow-up actions
- **Rich Text Support**: Full text area for comprehensive notes

### 📤 Data Export
- **CSV Export**: Export to Excel-compatible CSV format
- **JSON Export**: Export as structured JSON data
- **Customizable**: Choose to include/exclude notes and reminders
- **Automatic Naming**: Files named with current date

### 🎨 Enhanced UI/UX
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Color-coded Status**: Visual status indicators with predefined options
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations

### 🔧 Predefined Status Options
- **Applied** (Blue) - Initial application submitted
- **Interview** (Orange) - Interview scheduled or completed
- **Offer** (Green) - Job offer received
- **Rejected** (Red) - Application rejected
- **Withdrawn** (Gray) - Application withdrawn
- **Pending** (Purple) - Awaiting response

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file with your API endpoint:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📱 Usage

### Adding Applications
1. Click "Add New Job" button
2. Fill in company, position, date applied, and status
3. Optionally add resume version used
4. Click "Add Job" to save

### Managing Applications
- **Edit**: Click the edit button to modify application details
- **Notes**: Click the notes button to add notes and reminders
- **Delete**: Click delete and confirm to remove applications

### Viewing Data
- **List View**: See all applications in a compact list format
- **Timeline View**: View applications chronologically with visual timeline
- **Analytics**: View statistics and status distribution at the top

### Exporting Data
1. Click the "Export" button in the header
2. Choose format (CSV or JSON)
3. Select whether to include notes
4. Download your data

## 🛠️ Technical Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: CSS with CSS Variables for theming
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context + useState

## 🎯 Key Improvements

This enhanced version includes several significant improvements over the basic job tracker:

1. **Data Visualization**: Analytics dashboard provides insights into application patterns
2. **Better Organization**: Search, filtering, and sorting make it easy to find specific applications
3. **Enhanced Tracking**: Notes and reminders help with follow-up management
4. **Data Portability**: Export functionality ensures data backup and analysis
5. **Improved UX**: Timeline view and better visual design enhance user experience
6. **Professional Features**: Status tracking and analytics make it suitable for serious job seekers

## 🔮 Future Enhancements

Potential features for future versions:
- Email notifications for reminders
- Integration with job boards
- Resume upload and management
- Interview scheduling
- Company research integration
- Application success rate tracking
- Networking contact management
