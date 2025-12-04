# CL Blocks - Notion Style Document Editor

A modern, block-based document editor inspired by Notion, built with React and Tailwind CSS. Now with **shareable links** and **real-time collaboration**!

## Features

- **Block-based editing**: Create and manage different types of content blocks
- **Text blocks**: Rich text editing with contentEditable
- **Table blocks**: Display structured data in tables
- **Chart blocks**: Visualize data with line, bar, and pie charts (using Recharts)
- **Drag and drop**: Reorder blocks by dragging
- **Command menu**: Type "/" to quickly add new blocks
- **Auto-save**: Automatically saves your work
- **Shareable Links**: Share reports via unique URLs
- **Real-Time Collaboration**: See edits from other users in real-time
- **No Login Required**: Open access for prototypes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free) - for data storage
- Vercel account (free) - for deployment (optional for local dev)

### Installation

```bash
npm install
```

### Local Development Setup

1. **Set up Supabase** (see `SUPABASE_SETUP.md` for detailed instructions):
   - Create a Supabase project
   - Run the SQL schema to create the `reports` table
   - Get your API keys

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**: Open `http://localhost:5173`

### Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to Vercel.

## Usage

1. Start typing in any text block
2. Type "/" to open the command menu and add new blocks
3. Drag blocks by the handle (appears on hover) to reorder them
4. Click "Share" to get a shareable link
5. Your work is automatically saved and synced in real-time

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Routing**: React Router
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: Supabase Realtime
- **Charts**: Recharts
- **Drag & Drop**: react-beautiful-dnd
- **UI Components**: shadcn/ui, Radix UI

## Project Structure

- `src/App.jsx` - Main application component with routing
- `src/lib/supabase.js` - Supabase client configuration
- `src/lib/reports.js` - Report data management (load/save/subscribe)
- `src/components/` - React components
- `SUPABASE_SETUP.md` - Database setup instructions
- `DEPLOYMENT.md` - Deployment guide

## Shareable Links

Each report has a unique shareable URL:
- Format: `/reports/{report-id}`
- Example: `https://your-app.vercel.app/reports/my-reports-1`

Click the "Share" button to copy the link to your clipboard.

## License

MIT

