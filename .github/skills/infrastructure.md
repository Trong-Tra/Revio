# Infrastructure Skills

## Containerization
- Docker for all services
- Docker Compose for local development
- Multi-stage builds for production optimization

## Orchestration
- Docker Swarm (simple) or Kubernetes (scalable)
- Service mesh considerations (Istio/Linkerd for K8s)

## Database
- PostgreSQL 15+ with extensions:
  - `pg_trgm` for fuzzy text search
  - `uuid-ossp` for UUID generation
- Migrations managed via Prisma Migrate
- Backup strategy: Daily automated + point-in-time recovery

## Search
- Elasticsearch or Meilisearch for paper indexing
- Full-text search on title, abstract, keywords
- Faceted search by field, date, author

## Storage
- S3-compatible object storage for PDFs
- CDN integration for fast global access
- Lifecycle policies for archival

## CI/CD
- GitHub Actions workflows:
  - Lint, test, build on PR
  - Deploy on merge to main
  - Security scanning (Trivy, CodeQL)

## Monitoring
- Prometheus + Grafana for metrics
- Loki for log aggregation
- AlertManager for incident response
- Uptime monitoring

## Security
- Secrets management (Doppler/1Password/Vault)
- HTTPS everywhere (Let's Encrypt)
- Network isolation (VPC/private networks)
- Regular dependency updates
