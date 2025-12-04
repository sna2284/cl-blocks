# Deployment Guide

## Quick Start

This app is now set up for sharing via shareable links using Supabase (serverless) and Vercel.

## Prerequisites

1. **Supabase Account** (free): [https://supabase.com](https://supabase.com)
2. **Vercel Account** (free): [https://vercel.com](https://vercel.com)
3. **GitHub Account** (optional, for easy deployment)

## Step-by-Step Deployment

### 1. Set Up Supabase

Follow the instructions in `SUPABASE_SETUP.md` to:
- Create a Supabase project
- Set up the database table
- Get your API keys

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

#### Option B: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### 4. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. You should see the app load
3. Click "Share" button to get a shareable link
4. Open the link in a new tab/window to test sharing

## Shareable Links

Each report now has a unique shareable link:
- Format: `https://your-app.vercel.app/reports/{report-id}`
- Example: `https://your-app.vercel.app/reports/my-reports-1`

### How It Works

1. **Editable Reports**: Users can edit and changes are saved to Supabase
2. **Read-Only Reports**: Users can view but not edit
3. **Real-Time Updates**: Changes made by one user are visible to others in real-time
4. **No Authentication**: Anyone with the link can access (prototype mode)

## Features

✅ **Shareable Links**: Each report has a unique URL  
✅ **Real-Time Collaboration**: Edits sync across all users  
✅ **No Login Required**: Open access for prototypes  
✅ **Persistent Storage**: Data stored in Supabase  
✅ **Auto-Save**: Changes saved automatically  

## Cost

- **Vercel**: Free (Hobby plan)
  - Unlimited requests
  - 100GB bandwidth
  - Perfect for prototypes

- **Supabase**: Free tier
  - 500MB database
  - 2GB bandwidth/month
  - Real-time included

**Total: $0/month** for prototype usage

## Troubleshooting

### "Table doesn't exist"
- Make sure you ran the SQL in `SUPABASE_SETUP.md`
- Check that the table was created in Supabase dashboard

### "Real-time not working"
- Enable real-time replication in Supabase: Database → Replication
- Check that the `reports` table is enabled

### "CORS errors"
- Supabase allows all origins by default for anon key
- If issues persist, check Supabase project settings

### "Environment variables not working"
- Make sure variables are set in Vercel dashboard
- Redeploy after adding environment variables
- Variables must start with `VITE_` to be exposed to frontend

## Next Steps

1. **Custom Domain** (optional): Add your domain in Vercel settings
2. **Analytics** (optional): Add Vercel Analytics for usage tracking
3. **Production Setup**: For production, consider:
   - Adding authentication
   - Restricting RLS policies
   - Using service role key for server-side operations

## Support

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- React Router Docs: [https://reactrouter.com](https://reactrouter.com)

