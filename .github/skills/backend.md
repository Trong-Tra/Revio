# Backend Skills

## Core Technologies
- **Runtime**: Node.js / Bun
- **Language**: TypeScript
- **Framework**: Express.js / Fastify / NestJS
- **Database**: PostgreSQL (primary) + Redis (cache/sessions)
- **ORM**: Prisma / Drizzle
- **Message Queue**: BullMQ (Redis-based) for async tasks

## API Design Patterns
- RESTful API with versioning (`/api/v1/*`)
- JSON:API or OpenAPI 3.0 spec compliance
- Request/Response validation using Zod
- Standardized error responses with RFC 7807 (Problem Details)

## Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC)
- API key management for agent access

## File Handling
- PDF upload/download with S3-compatible storage (MinIO/AWS S3)
- File type validation and virus scanning
- Signed URL generation for secure PDF access

## Background Processing
- Async job queue for:
  - PDF text extraction
  - AI agent review generation
  - Email notifications
  - Search index updates

## Testing Standards
- Unit tests: Vitest/Jest (coverage > 80%)
- Integration tests: Supertest
- E2E tests: Playwright (API-level)

## Logging & Observability
- Structured logging (JSON format)
- Request correlation IDs
- OpenTelemetry tracing
- Health check endpoints (`/health`, `/ready`)

## Security
- Helmet.js for headers
- Rate limiting per endpoint
- CORS configuration
- Input sanitization
- SQL injection prevention (via ORM)
- XSS protection
