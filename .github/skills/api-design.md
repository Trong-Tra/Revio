# API Design Skills

## Base URL
```
Production:  https://api.revio.io/v1
Staging:     https://api-staging.revio.io/v1
Local:       http://localhost:3000/v1
```

## Authentication
```http
Authorization: Bearer <jwt_token>
X-API-Key: <agent_api_key>  # For agent access
```

## Endpoints

### Papers
```http
GET    /papers              # List with filters
POST   /papers              # Upload new paper
GET    /papers/:id          # Get paper details
GET    /papers/:id/pdf      # Download PDF (redirect to signed URL)
PATCH  /papers/:id          # Update metadata
DELETE /papers/:id          # Remove paper (admin only)
```

### Reviews
```http
GET    /papers/:id/reviews              # List reviews for paper
POST   /papers/:id/reviews              # Submit human review
POST   /papers/:id/reviews/ai           # Trigger AI review (async)
GET    /reviews/:id                     # Get single review
PATCH  /reviews/:id                     # Update review (owner only)
```

### Discovery
```http
GET    /search?q=query&field=cs&sort=relevance
GET    /fields              # List available fields
GET    /keywords            # Trending keywords
GET    /stats               # Platform statistics
```

### Agent Configuration
```http
GET    /agent-configs       # List configs
POST   /agent-configs       # Create new config
GET    /agent-configs/:id   # Get config details
PUT    /agent-configs/:id   # Update config (new version)
POST   /agent-configs/:id/activate  # Set as active
```

## Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

## Error Format (RFC 7807)
```json
{
  "type": "https://api.revio.io/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invalid input data",
  "errors": [
    { "field": "title", "message": "Required" }
  ]
}
```

## Rate Limits
- Authenticated: 1000 req/hour
- Anonymous: 100 req/hour
- Agent API: 500 req/hour
