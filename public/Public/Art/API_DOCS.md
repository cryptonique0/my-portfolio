# BitArt Market API Documentation

## Quick Links

- **Interactive API Docs**: `http://localhost:3001/api-docs` (Swagger UI)
- **OpenAPI Spec**: `http://localhost:3001/api-docs.json`
- **API Base URL**: `http://localhost:3001/api`

## Authentication

### MetaMask Wallet Auth

```bash
# 1. Get nonce
curl -X GET "http://localhost:3001/api/auth/nonce?address=0x1234567890123456789012345678901234567890"

# Response:
{
  "address": "0x1234567890123456789012345678901234567890",
  "nonce": "abc123def456",
  "message": "Sign in to BitArt Market\n\nNonce: abc123def456"
}

# 2. Sign message with MetaMask (use message field)
# Use ethers.js or web3.js to sign:
# const signature = await signer.signMessage(message)

# 3. Verify and get JWT
curl -X POST "http://localhost:3001/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "signature": "0x7f7c6b5a..."
  }'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Using JWT Token

All authenticated endpoints require Bearer token:

```bash
curl -X GET "http://localhost:3001/api/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Core Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/nonce` | ❌ | Generate nonce for wallet signature |
| POST | `/verify` | ❌ | Verify signature and issue JWT |
| GET | `/me` | ✅ | Get current user profile |
| GET | `/me/supabase` | ✅ | Get current user (Supabase) |

### Admin (`/api/admin`) - Requires admin role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | List all users (paginated) |
| GET | `/users/:userId/status` | User ban/suspension status |
| POST | `/users/:userId/ban` | Ban user permanently |
| POST | `/users/:userId/suspend` | Suspend user (temporary) |
| POST | `/users/:userId/unban` | Unban user |
| GET | `/moderation` | Pending moderation cases |
| POST | `/moderation/:nftId` | Flag/moderate NFT |
| PUT | `/moderation/:caseId` | Resolve moderation case |
| GET | `/transactions` | Transaction summary |
| GET | `/settings` | Get system settings |
| PUT | `/settings/:key` | Update system setting |
| GET | `/actions` | Admin action history |

**Example: Ban a user**

```bash
curl -X POST "http://localhost:3001/api/admin/users/550e8400-e29b-41d4-a716-446655440000/ban" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violation of platform terms"
  }'
```

### Analytics (`/api/advanced-analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard metrics overview |
| GET | `/market` | Market overview |
| GET | `/volume` | Volume metrics (period: daily/weekly/monthly) |
| GET | `/charts` | Chart data for visualization |
| GET | `/trending` | Trending items (period: daily/weekly/monthly) |
| GET | `/leaderboard` | Leaderboards (type: volume/creators/collectors) |
| GET | `/popular-searches` | Popular search queries |
| POST | `/track-event` | Track analytics event |
| GET | `/export/csv` | Export data as CSV |

**Example: Get dashboard metrics**

```bash
curl -X GET "http://localhost:3001/api/advanced-analytics/dashboard" \
  -H "Authorization: Bearer YOUR_JWT"

# Response:
{
  "totalVolume": 5234500,
  "totalTransactions": 1250,
  "totalNFTsSold": 452,
  "averagePrice": 4187.25,
  "activeUsers": 234
}
```

**Example: Get leaderboard**

```bash
curl -X GET "http://localhost:3001/api/advanced-analytics/leaderboard?type=volume&period=monthly&limit=10" \
  -H "Authorization: Bearer YOUR_JWT"
```

**Example: Export data**

```bash
curl -X GET "http://localhost:3001/api/advanced-analytics/export/csv?dataType=transactions&format=csv" \
  -H "Authorization: Bearer YOUR_JWT" \
  -o transactions.csv
```

### NFTs (`/api/nfts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List NFTs (paginated) |
| GET | `/:id` | Get NFT details |
| POST | `/` | Create NFT (requires creator role) |
| PUT | `/:id` | Update NFT |
| DELETE | `/:id` | Delete NFT |

### Marketplace (`/api/marketplace`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | Get active listings |
| POST | `/listings` | Create listing |
| GET | `/listings/:id` | Get listing details |
| PUT | `/listings/:id` | Update listing price |
| DELETE | `/listings/:id` | Cancel listing |
| POST | `/buy` | Buy NFT |

### Collections (`/api/db/collections`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List collections |
| POST | `/` | Create collection (requires creator role) |
| GET | `/:id` | Get collection details |
| PUT | `/:id` | Update collection |
| GET | `/creator/:creatorId` | Get creator's collections |

## Response Format

All responses follow this format:

```json
{
  "data": {},
  "error": null,
  "status": 200,
  "timestamp": "2026-01-10T11:00:00Z"
}
```

Or on error:

```json
{
  "error": "Invalid request",
  "status": 400,
  "message": "Detailed error message"
}
```

## Rate Limiting

API requests are rate-limited:

- **Standard endpoints**: 100 requests per 15 minutes
- **Upload endpoints**: 20 requests per 1 hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1673352000
```

## Error Codes

| Code | Meaning | Details |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

## Common Use Cases

### Create an NFT

```bash
curl -X POST "http://localhost:3001/api/nfts" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Artwork",
    "description": "A unique digital art piece",
    "imageUrl": "ipfs://QmXxxx",
    "collectionId": "550e8400-e29b-41d4-a716-446655440000",
    "royaltyPercentage": 10
  }'
```

### List NFTs by Creator

```bash
curl -X GET "http://localhost:3001/api/nfts?creator=0x1234567890123456789012345678901234567890&limit=20&offset=0"
```

### Create a Listing

```bash
curl -X POST "http://localhost:3001/api/marketplace/listings" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "550e8400-e29b-41d4-a716-446655440000",
    "price": 2.5,
    "currency": "ETH"
  }'
```

### Get Admin Stats

```bash
curl -X GET "http://localhost:3001/api/admin/stats" \
  -H "Authorization: Bearer ADMIN_JWT"

# Response:
{
  "totalUsers": 1250,
  "bannedUsers": 15,
  "suspendedUsers": 8,
  "moderationCases": 23,
  "totalAdminActions": 156
}
```

## Testing with Swagger UI

1. Go to `http://localhost:3001/api-docs`
2. Click **Authorize** button
3. Enter JWT token: `Bearer YOUR_JWT`
4. Click on endpoint to expand
5. Click **Try it out**
6. Fill in parameters and request body
7. Click **Execute**

## API Development

### Adding New Endpoints

1. Create route handler in `/routes/`
2. Add JSDoc/Swagger comments above handler:

```typescript
/**
 * @swagger
 * /api/example:
 *   get:
 *     tags:
 *       - Example
 *     summary: Brief description
 *     description: Detailed description
 *     parameters:
 *       - in: query
 *         name: param1
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
router.get('/', (req, res) => { ... });
```

3. Add route file path to `config/swagger.ts` in `apis` array
4. Restart server (swagger regenerates automatically)

## Troubleshooting

### 401 Unauthorized

- Token is missing or expired
- Use `/api/auth/verify` to get fresh token
- Check token in `Authorization` header: `Bearer TOKEN`

### 403 Forbidden

- User lacks required role (e.g., admin)
- Check user role in response from `/api/auth/me`

### 429 Too Many Requests

- Rate limit exceeded
- Wait before retrying (see `X-RateLimit-Reset` header)

### 500 Server Error

- Check server logs
- Ensure Supabase environment variables set
- Verify database connection

## Security Best Practices

1. **Never share JWT tokens** - treat like passwords
2. **Token expiry** - implement refresh token flow for long-lived sessions
3. **HTTPS only** - always use HTTPS in production
4. **CORS origin** - set allowed origins in environment config
5. **Rate limiting** - monitor for abuse patterns
6. **Admin access** - restrict to trusted users only
7. **Audit logs** - all admin actions logged to `admin_actions` table

## Support

For issues or questions:
- Check `/api-docs` for interactive documentation
- Review example requests in this guide
- Check backend logs: `docker logs backend`
- Contact team at `support@bitart.market`
