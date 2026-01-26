# API Reference

## Base URL
```
http://localhost:3001/api
```

## Authentication
Some endpoints require wallet signature verification. Include `x-creator-address`, `x-seller-address`, or `x-buyer-address` headers.

## Response Format
All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "error": "Error type",
  "status": 400,
  "message": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## NFT Endpoints

### List NFTs
```
GET /api/nfts
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |
| category | string | - | Filter by category |
| sortBy | string | createdAt | Sort field (createdAt, name) |

**Response:**
```json
{
  "success": true,
  "nfts": [
    {
      "id": 1,
      "name": "My NFT",
      "description": "Description",
      "image": "https://...",
      "imageHash": "sha256hash",
      "category": "art",
      "royaltyPercentage": 10,
      "creator": "ST...",
      "owner": "ST...",
      "metadataHash": "Qm...",
      "metadataUri": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get NFT by ID
```
GET /api/nfts/:id
```

**Response:**
```json
{
  "success": true,
  "nft": { ... }
}
```

### Create NFT
```
POST /api/nfts
Content-Type: multipart/form-data
```

**Headers:**
- `x-creator-address` - Creator's Stacks address (required)

**Form Data:**
| Field | Type | Required | Max Size | Description |
|-------|------|----------|----------|-------------|
| name | string | Yes | 256 | NFT name |
| description | string | Yes | 1024 | NFT description |
| imageFile | file | Yes | 10MB | Image file (JPEG, PNG, GIF, WebP) |
| category | string | Yes | 64 | Category tag |
| royaltyPercentage | number | Yes | - | Creator royalty (0-25) |

**Response:**
```json
{
  "success": true,
  "nft": {
    "id": 1,
    "name": "My NFT",
    ...
  },
  "message": "NFT created successfully. Ready to mint on blockchain."
}
```

### Get NFT History
```
GET /api/nfts/:id/history
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "type": "created",
      "from": "ST...",
      "to": "ST...",
      "timestamp": "2024-01-01T00:00:00Z",
      "txHash": "0x..."
    }
  ]
}
```

### Get Categories
```
GET /api/nfts/meta/categories
```

**Response:**
```json
{
  "success": true,
  "categories": [
    "art",
    "collectibles",
    "sports",
    "digital-items",
    "music",
    "video"
  ]
}
```

---

## Marketplace Endpoints

### List Listings
```
GET /api/marketplace/listings
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |
| sortBy | string | price | Sort field (price, date) |
| order | string | asc | Sort order (asc, desc) |
| minPrice | number | 0 | Minimum price filter |
| maxPrice | number | - | Maximum price filter |

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "id": 1,
      "nftId": 1,
      "seller": "ST...",
      "price": 1000000,
      "quantity": 5,
      "listedAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-31T00:00:00Z",
      "status": "active"
    }
  ],
  "pagination": { ... }
}
```

### Get Listing
```
GET /api/marketplace/listings/:id
```

### Create Listing
```
POST /api/marketplace/listings
```

**Headers:**
- `x-seller-address` - Seller's Stacks address (required)

**Body:**
```json
{
  "nftId": 1,
  "price": 1000000,
  "quantity": 5,
  "duration": 2592000
}
```

**Response:**
```json
{
  "success": true,
  "listing": { ... },
  "message": "Listing created successfully"
}
```

### Update Listing
```
PUT /api/marketplace/listings/:id
```

**Headers:**
- `x-seller-address` - Seller's address (must match seller)

**Body:**
```json
{
  "price": 2000000
}
```

### Cancel Listing
```
DELETE /api/marketplace/listings/:id
```

**Headers:**
- `x-seller-address` - Seller's address (must match seller)

### Buy NFT
```
POST /api/marketplace/buy
```

**Headers:**
- `x-buyer-address` - Buyer's Stacks address (required)

**Body:**
```json
{
  "listingId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx-1234567890",
    "listingId": 1,
    "nftId": 1,
    "buyer": "ST...",
    "seller": "ST...",
    "quantity": 2,
    "pricePerUnit": 1000000,
    "totalPrice": 2000000,
    "platformFee": 50000,
    "sellerAmount": 1950000,
    "timestamp": "2024-01-01T00:00:00Z",
    "status": "pending"
  },
  "message": "Purchase initiated. Awaiting blockchain confirmation."
}
```

---

## User Endpoints

### Get User Profile
```
GET /api/users/:address
```

**Response:**
```json
{
  "success": true,
  "user": {
    "address": "ST...",
    "bio": "Digital artist",
    "avatar": "https://...",
    "banner": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "stats": {
      "nftsCreated": 10,
      "nftsOwned": 25,
      "totalSales": 50000,
      "followers": 150,
      "following": 50
    },
    "social": {
      "twitter": "@username",
      "instagram": "username",
      "website": "https://..."
    },
    "verified": true
  }
}
```

### Update User Profile
```
PUT /api/users/:address
```

**Body:**
```json
{
  "bio": "Updated bio",
  "social": {
    "twitter": "@newtwitterhandle",
    "instagram": "newinstagram"
  }
}
```

### Get User NFTs
```
GET /api/users/:address/nfts
```

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| page | number | 1 |
| limit | number | 20 |

**Response:**
```json
{
  "success": true,
  "nfts": [ ... ],
  "pagination": { ... }
}
```

### Get User Collections
```
GET /api/users/:address/collections
```

**Response:**
```json
{
  "success": true,
  "collections": [
    {
      "id": 1,
      "name": "My Collection",
      "description": "Description",
      "image": "https://...",
      "nftCount": 5,
      "floorPrice": 1000000,
      "volume": 5000000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get User Sales
```
GET /api/users/:address/sales
```

**Response:**
```json
{
  "success": true,
  "sales": [
    {
      "id": 1,
      "nftId": 1,
      "buyer": "ST...",
      "price": 1000000,
      "timestamp": "2024-01-01T00:00:00Z",
      "txHash": "0x..."
    }
  ],
  "pagination": { ... }
}
```

### Get User Favorites
```
GET /api/users/:address/favorites
```

**Response:**
```json
{
  "success": true,
  "favorites": [ ... ]
}
```

---

## Analytics Endpoints

### Get Marketplace Stats
```
GET /api/analytics/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalVolume": 1500.5,
    "totalNfts": 2345,
    "totalUsers": 567,
    "totalListings": 234,
    "averagePrice": 0.64,
    "floorPrice": 0.1,
    "totalSales": 892,
    "uniqueBuyers": 234,
    "uniqueSellers": 156,
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

### Get Top Creators
```
GET /api/analytics/top-creators
```

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| limit | number | 10 |

**Response:**
```json
{
  "success": true,
  "creators": [
    {
      "address": "ST...",
      "username": "artist",
      "avatar": "https://...",
      "nftsCreated": 45,
      "totalVolume": 234.5,
      "averagePrice": 5.2,
      "followers": 1234,
      "verified": true
    }
  ]
}
```

### Get Top Buyers
```
GET /api/analytics/top-buyers
```

**Response:**
```json
{
  "success": true,
  "buyers": [
    {
      "address": "ST...",
      "username": "collector",
      "avatar": "https://...",
      "nftsPurchased": 156,
      "totalSpent": 567.8,
      "averageBid": 3.64,
      "portfolio": 156,
      "followers": 543
    }
  ]
}
```

### Get Trending NFTs
```
GET /api/analytics/trending
```

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| limit | number | 20 |

**Response:**
```json
{
  "success": true,
  "nfts": [
    {
      "id": 1,
      "name": "Trending NFT",
      "image": "https://...",
      "creator": "artist",
      "views24h": 1234,
      "sales24h": 45,
      "volume24h": 234.5,
      "floorPrice": 5.2
    }
  ]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Not authorized for action |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

API uses rate limiting to prevent abuse:
- General endpoints: 100 requests per 15 minutes
- Upload endpoints: 20 requests per hour

Rate limit headers:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Reset time (unix timestamp)

---

## Webhooks (Future)

Coming soon:
- NFT minted
- Listed for sale
- Purchase completed
- Offer received
- Auction ended
