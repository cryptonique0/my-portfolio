# Supabase Integration Setup Guide

## Overview
This guide walks through setting up the Supabase database integration for BitArt Market.

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Node.js 16+ installed
- BitArt Market backend running locally

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: bitart-market
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing**: Select Free tier

4. Wait for project to initialize (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings → API**
2. Copy the following:
   - **Project URL**: `https://[project-id].supabase.co`
   - **anon key**: Public anonymous key
   - **service_role key**: Private admin key

## Step 3: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `backend/src/database/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for all tables to be created (should see green checkmarks)

## Step 4: Environment Variables

1. Update `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Other existing vars...
```

2. Update `frontend/.env`:

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Other existing vars...
```

## Step 5: Install Dependencies

Backend:
```bash
cd backend
npm install @supabase/supabase-js
npm install
```

Frontend:
```bash
cd frontend
npm install @supabase/supabase-js
npm install
```

## Step 6: Verify Setup

Test the database connection:

```bash
cd backend
npm run dev
```

Check the logs for:
```
✓ Supabase connection successful
✓ Database health check passed
```

## API Endpoints

### Users
- `GET /api/db/users/:userId` - Get user profile
- `GET /api/db/users/wallet/:walletAddress` - Get user by wallet
- `POST /api/db/users/profile` - Create/update profile
- `GET /api/db/users/:userId/followers` - Get followers
- `POST /api/db/users/:userId/follow` - Follow user

### NFTs
- `GET /api/db/nfts` - List NFTs
- `GET /api/db/nfts/:nftId` - Get NFT details
- `POST /api/db/nfts` - Create NFT
- `POST /api/db/nfts/:nftId/list` - List NFT for sale
- `POST /api/db/nfts/:nftId/purchase` - Buy NFT

### Auctions
- `GET /api/db/auctions` - List active auctions
- `GET /api/db/auctions/:auctionId` - Get auction details
- `POST /api/db/auctions` - Create auction
- `POST /api/db/auctions/:auctionId/bid` - Place bid

### Transactions
- `GET /api/db/transactions` - Get recent transactions
- `GET /api/db/transactions/user/:userId` - Get user transactions
- `GET /api/db/transactions/stats/volume` - Get platform volume

### Collections
- `GET /api/db/collections` - List collections
- `GET /api/db/collections/:collectionId` - Get collection details
- `POST /api/db/collections` - Create collection

### Notifications
- `GET /api/db/notifications/:userId` - Get user notifications
- `PUT /api/db/notifications/:notificationId/read` - Mark as read

### Analytics
- `POST /api/db/analytics/track` - Track event
- `GET /api/db/analytics/stats` - Get platform stats

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled. Configure policies:

1. Go to **Authentication → Policies** in Supabase
2. For each table, set:
   - **SELECT**: Users can only read their own data
   - **INSERT**: Users can only insert their own data
   - **UPDATE**: Users can only update their own data
   - **DELETE**: Only creators/admins can delete

### Example RLS Policy for Users Table:
```sql
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);
```

## Database Backup

1. Go to **Project Settings → Backups**
2. Enable automatic daily backups
3. Configure retention period

## Monitoring

1. Go to **Project Settings → Database Usage**
2. Monitor:
   - Query count
   - Bandwidth usage
   - Storage usage
3. Set up alerts for quota warnings

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED
```
- Verify `SUPABASE_URL` is correct
- Check network connectivity
- Verify API keys are not expired

### Authentication Error
```
Error: 401 Unauthorized
```
- Verify `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- Check RLS policies are correct
- Verify user has proper permissions

### Query Error
```
Error: relation "table_name" does not exist
```
- Run migration script again
- Verify all tables were created
- Check for case sensitivity issues

## Next Steps

1. ✅ Create Supabase project
2. ✅ Deploy database schema
3. ✅ Set environment variables
4. ✅ Install dependencies
5. ➡️ Implement frontend integration (see FRONTEND_INTEGRATION.md)
6. ➡️ Set up authentication (see AUTH_SETUP.md)
7. ➡️ Configure real-time subscriptions
8. ➡️ Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Authentication](https://supabase.com/docs/guides/auth)

## Support

For issues:
1. Check [Supabase Documentation](https://supabase.com/docs)
2. Review logs in Supabase Dashboard
3. Check GitHub issues
4. Ask community on Discord/Forum
