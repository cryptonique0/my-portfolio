# Authentication & Authorization for BitArt Market

## Features Implemented
- JWT-based authentication (app-issued tokens)
- MetaMask wallet connection + signature verification
- Supabase-based email/password and OAuth (Google, Twitter) support
- Role-Based Access Control (RBAC) with `user | creator | admin`

## Backend Setup

### 1) Install Dependencies

```bash
# From project root
npm install --workspace backend jsonwebtoken ethers @supabase/supabase-js
```

### 2) Environment Variables

Add to `backend/.env`:

```env
JWT_SECRET=replace_with_strong_secret
ALLOWED_ORIGINS=http://localhost:5173
```

`JWT_SECRET` is required in production. In development, a default is used.

### 3) Database Migration (Supabase)

Run the new auth migration in Supabase SQL Editor:

- File: backend/src/database/migrations/003_auth_schema.sql
- Creates `wallet_nonces` table for MetaMask authentication flow.

### 4) New Backend Files

- `backend/src/middleware/auth.ts` — JWT verification, Supabase token verification, RBAC
- `backend/src/services/auth.service.ts` — Nonce generation, signature verification, token issuing
- `backend/src/routes/auth.ts` — `/api/auth/nonce`, `/api/auth/verify`, `/api/auth/me` endpoints

### 5) Route Integration

`backend/src/index.ts` mounts:

- `/api/auth` — Auth endpoints (MetaMask, current user)

## API Reference

### GET /api/auth/nonce
Generate nonce for wallet sign-in.

Query:
- `address` — Ethereum address

Response:
```json
{
  "address": "0x...",
  "nonce": "abc123...",
  "expiresAt": "2026-01-10T12:34:56.000Z",
  "message": "Sign in to BitArt Market\n\nNonce: abc123..."
}
```

### POST /api/auth/verify
Verify signature and issue app JWT.

Body:
```json
{ "address": "0x...", "signature": "0x..." }
```

Response:
```json
{ "token": "<jwt>", "userId": "<uuid>" }
```

### GET /api/auth/me
Return current user from app JWT.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{ "user": { "id": "<uuid>", "wallet_address": "0x...", "role": "user" } }
```

### GET /api/auth/me/supabase
Return current user from Supabase JWT.

Headers:
- `Authorization: Bearer <supabase_access_token>`

Response:
```json
{ "user": { "id": "<uuid>", "email": "user@example.com", "role": "user" } }
```

## Frontend Setup

### New Files
- `frontend/src/services/authService.ts` — MetaMask connection + sign-in flow
- `frontend/src/hooks/useAuth.ts` — Hooks: `useMetaMaskAuth()`, `useCurrentUser()`
- `frontend/src/components/ConnectWalletButton.tsx` — Button to connect wallet

### Usage

```tsx
import ConnectWalletButton from '../components/ConnectWalletButton';

function Header() {
  return (
    <div className="flex items-center justify-end">
      <ConnectWalletButton />
    </div>
  );
}
```

```tsx
import { useCurrentUser } from '../hooks/useAuth';

function Profile() {
  const { user, loading } = useCurrentUser();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  return <div>Signed in as {user.wallet_address || user.email}</div>;
}
```

## Email/Password & OAuth (Google, Twitter)

Use Supabase Auth directly in the frontend:

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

// Email/password
await supabase.auth.signUp({ email: 'user@example.com', password: 'password123' });
await supabase.auth.signInWithPassword({ email: 'user@example.com', password: 'password123' });

// OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' });
await supabase.auth.signInWithOAuth({ provider: 'twitter' });

// Get access token (use in Authorization header)
const session = await supabase.auth.getSession();
const accessToken = session.data.session?.access_token;
```

Then call backend endpoints with `Authorization: Bearer <accessToken>` for protected routes using `requireSupabaseAuth`.

## RBAC

- Roles are stored in `users.role` (`user`, `creator`, `admin`).
- Use middleware `requireRole(['admin'])` to protect admin routes.

Example:
```ts
import { requireAppJWT, requireRole } from '../middleware/auth';

router.get('/admin/stats', requireAppJWT, requireRole(['admin']), async (req, res) => {
  res.json({ secret: 'admin-only-stat' });
});
```

## Test Commands

```bash
# Backend dev
npm run dev --workspace backend

# Request nonce
curl "http://localhost:3001/api/auth/nonce?address=0x0000000000000000000000000000000000000000"

# Verify signature (example; requires actual signature)
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","signature":"0x..."}'

# Get current user (app JWT)
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer <token>"

# Get current user (Supabase JWT)
curl http://localhost:3001/api/auth/me/supabase -H "Authorization: Bearer <supabase_access_token>"
```

## Notes
- MetaMask flow uses `personal_sign` with a nonce message.
- Nonces expire after 10 minutes and are single-use.
- App JWT expires in 7 days.
- In production, set a strong `JWT_SECRET` and restrict `ALLOWED_ORIGINS`.

## Next Steps
- Add route guards across sensitive endpoints using `requireAppJWT`.
- Optional: Implement SIWE (EIP-4361) for standardized wallet login.
- Optional: Add refresh tokens and logout endpoint.
