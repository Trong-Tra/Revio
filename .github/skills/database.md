# Database Skills

## Schema Design

### Papers Table
```sql
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  field VARCHAR(100) NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_storage_key TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_papers_field ON papers(field);
CREATE INDEX idx_papers_keywords ON papers USING GIN(keywords);
CREATE INDEX idx_papers_created ON papers(created_at DESC);
```

### Reviews Table
```sql
CREATE TYPE reviewer_type AS ENUM ('AI', 'HUMAN');

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_type reviewer_type NOT NULL,
  reviewer_id UUID, -- NULL for AI, user_id for human
  content JSONB NOT NULL, -- Structured review content
  is_accepted BOOLEAN, -- NULL = pending/reviewing
  confidence_score DECIMAL(3,2), -- 0.00 - 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_paper ON reviews(paper_id);
CREATE INDEX idx_reviews_type ON reviews(reviewer_type);
```

### AgentConfig Table
```sql
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  skills_markdown TEXT NOT NULL, -- Capabilities definition
  tone VARCHAR(50) NOT NULL DEFAULT 'Academic',
  system_prompt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_configs_active ON agent_configs(is_active);
```

### Users Table (for human reviewers)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'reviewer', -- admin, reviewer, researcher
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Query Patterns
- Full-text search using `to_tsvector` + GIN index
- Pagination with cursor-based (for reviews) or offset (for discovery)
- JSONB queries for flexible metadata
- Soft deletes via `deleted_at` columns (optional)

## Migrations
- Use Prisma Migrate or node-pg-migrate
- Version control all schema changes
- Seed data for development
