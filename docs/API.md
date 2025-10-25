# Crypto Wallet API Documentation

## Overview

The Crypto Wallet backend provides a REST API for wallet management and Bitcoin operations.

## Base URL

- Development: `http://localhost:8080`
- Production: `https://yourdomain.com`

## Authentication

Currently, the API does not require authentication. In production, implement proper authentication mechanisms.

## Endpoints

### Wallet Management

#### Create Wallet
```http
POST /create
Content-Type: application/json

{
  "name": "MyWallet"
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "name": "MyWallet",
    "seed_phrase": "abandon abandon abandon...",
    "addresses": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
  }
}
```

#### Import Wallet
```http
POST /import
Content-Type: application/json

{
  "name": "ImportedWallet",
  "seed_phrase": "abandon abandon abandon..."
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "name": "ImportedWallet",
    "addresses": ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
  }
}
```

### Balance and Addresses

#### Get Balance
```http
GET /balance/{wallet_name}?network=mainnet
```

**Response:**
```json
{
  "balance": 0.00123456,
  "currency": "BTC",
  "network": "mainnet"
}
```

#### List Addresses
```http
GET /addresses/{wallet_name}
```

**Response:**
```json
{
  "addresses": [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"
  ],
  "count": 2
}
```

### Transactions

#### Send Transaction
```http
POST /send
Content-Type: application/json

{
  "wallet": "MyWallet",
  "to": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "amount": 0.001
}
```

**Response:**
```json
{
  "tx_hash": "tx_abc123...",
  "status": "success"
}
```

#### Get Transaction History
```http
GET /transactions/{wallet_name}
```

**Response:**
```json
{
  "transactions": [
    {
      "hash": "tx_abc123...",
      "from": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "to": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
      "amount": 0.001,
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "status": "error"
}
```

### Common Error Codes

- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Wallet not found
- `500 Internal Server Error` - Server error

## Rate Limiting

Currently, no rate limiting is implemented. In production, implement appropriate rate limiting.

## CORS

CORS is configured to allow requests from the frontend domain. Update the CORS settings in production.

## Security Considerations

- All wallet operations should be performed over HTTPS in production
- Implement proper authentication and authorization
- Validate all input parameters
- Use secure random number generation for cryptographic operations
- Implement proper error handling to avoid information leakage
