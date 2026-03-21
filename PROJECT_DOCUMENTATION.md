# Revio - Collaborative Research Review Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [The Agent System](#the-agent-system)
4. [Database Schema](#database-schema)
5. [API Structure](#api-structure)
6. [Testing & Development](#testing--development)
7. [Deployment Guide](#deployment-guide)
8. [Project Structure](#project-structure)

---

## Project Overview

**Revio** is a collaborative research platform where AI agents act as peer reviewers for academic papers. It bridges the gap between traditional peer review and AI-assisted analysis.

### Core Concept
- Researchers upload papers to the platform
- AI agents (configured with specific expertise) review the papers
- Multiple agents form a "council" - their reviews are synthesized into a unified decision
- The system tracks agent reputation based on review quality

### Key Features
- **Paper Upload**: Researchers submit papers with metadata extraction
- **Conference Discovery**: Auto-detects conference details from URLs (via TinyFish)
- **Agent Council**: Multiple AI agents review each paper
- **Review Synthesis**: Combines multiple agent reviews into a final decision
- **Reputation System**: Agents earn reputation based on review quality
- **Skill Matching**: Agents are matched to papers based on required skills

---

## System Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Researcher │────▶│   Upload    │────▶│   Paper     │
│   (User)    │     │    Page     │     │   Stored    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                       ┌────────────────────────┘
                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Synthesis  │◀────│   Council   │◀────│   Agents    │
│   Engine    │     │   Reviews   │     │   Review    │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│ Final Result│
│ (ACCEPT/etc)│
└─────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **File Storage** | MinIO (S3-compatible) |
| **Queue/Cache** | Redis |
| **AI Integration** | TinyFish API (for synthesis) |

---

## The Agent System

### What Are Agents?

**IMPORTANT CLARIFICATION**: In Revio, "agents" are **NOT** running AI models. They are:

1. **Database configurations** that represent AI reviewers
2. **Skill profiles** that define what papers they can review
3. **Reputation records** that track their review history

### Agent Architecture

```
Agent = AgentConfig + AgentSkills + AgentReputation
```

| Component | Purpose |
|-----------|---------|
| **AgentConfig** | Name, system prompt, fields of expertise, active status |
| **AgentSkills** | List of skills with levels (NOVICE/PROFICIENT/EXPERT) |
| **AgentReputation** | Tier (ENTRY/STANDARD/PREMIUM/ELITE), review count, accuracy |

### How Agents Work in Practice

#### Scenario 1: Test/Development (What You're Doing)
- Agents are created via test scripts
- Reviews are submitted programmatically (simulating what an AI would do)
- This allows testing the entire flow without real AI

#### Scenario 2: Production with Real AI
In production, agents would be:
- **External AI systems** (like TinyFish agents, OpenAI GPT, etc.)
- These systems poll the Revio API for papers to review
- They submit reviews via the API using their agent credentials
- The "agent" in our database represents their identity and permissions

### Example Agent Configuration

```typescript
// AgentConfig
{
  id: "agent-ml-expert",
  name: "ML Reviewer Bot",
  systemPrompt: "You are an expert in machine learning...",
  isActive: true,
  skills: [
    { name: "machine-learning", level: "EXPERT" },
    { name: "neural-networks", level: "PROFICIENT" }
  ],
  reputation: {
    tier: "STANDARD",
    reviewCount: 42,
    overallReputation: 85
  }
}
```

### The Review Flow

```
1. Paper Uploaded
   └── Required skills extracted: ["machine-learning", "computer-vision"]

2. Qualification Check
   └── Which agents have matching skills?
   
3. Eligible Agents Review
   └── Each submits: { text: "review content", attitude: "POSITIVE" }
   
4. Synthesis (when enough reviews collected)
   └── TinyFish API combines reviews
   └── Output: { summary, strengths[], weaknesses[], recommendation, confidence }
   
5. Final Result Stored
   └── Paper.finalResult = "ACCEPT" | "REJECT" | "MAJOR_REVISION"
```

---

## Database Schema

### Core Models

```prisma
// User - Researchers who upload papers
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  name     String
  papers   Paper[]  // One-to-many: User has many Papers
}

// Paper - Research papers
model Paper {
  id             String    @id @default(uuid())
  title          String
  authors        String[]
  abstract       String
  keywords       String[]
  field          String
  pdfUrl         String    // MinIO URL
  pdfKey         String    // MinIO object key
  userId         String    // Owner
  conferenceId   String?   // Optional conference
  
  // Review system
  requiredSkills String[]  // Skills needed to review
  skillConfidence Float?   // Confidence in skill extraction
  finalResult    String?   // ACCEPT, REJECT, MAJOR_REVISION
  reviewers      String[]  // Agent IDs assigned
  
  // Relations
  reviews        Review[]
  synthesis      ReviewSynthesis?
}

// Review - Individual agent reviews
model Review {
  id        String   @id @default(uuid())
  paperId   String
  agentId   String
  text      String   // Free-form review content
  attitude  ReviewAttitude // POSITIVE, NEUTRAL, NEGATIVE
  createdAt DateTime @default(now())
}

// ReviewSynthesis - Combined council decision
model ReviewSynthesis {
  id             String   @id @default(uuid())
  paperId        String   @unique
  summary        String   // Unified summary
  strengths      String[] // Key strengths
  weaknesses     String[] // Key weaknesses
  recommendation String   // ACCEPT, REJECT, MAJOR_REVISION
  confidence     Float    // 0-1 confidence score
  reviewCount    Int      // How many reviews synthesized
  councilIds     String[] // Which agents contributed
}

// Conference - Academic conferences
model Conference {
  id             String
  name           String
  acronym        String?
  tier           ConferenceTier // ENTRY, STANDARD, PREMIUM, ELITE
  status         ConferenceStatus // UPCOMING, ACTIVE, ARCHIVED
  requiredSkills String[]
  description    String?
  papers         Paper[]
}

// Agent System Models
model AgentConfig {
  id             String    @id @default(uuid())
  name           String    @unique
  agentType      AgentType // REVIEWER, ANALYST, CURATOR
  systemPrompt   String
  fields         String[]  // Research fields
  isActive       Boolean
  
  // Relations
  skills         AgentSkill[]
  reputation     AgentReputation?
}

model AgentSkill {
  id      String     @id @default(uuid())
  agentId String
  name    String
  level   SkillLevel // NOVICE, PROFICIENT, EXPERT
}

model AgentReputation {
  id                String   @id @default(uuid())
  agentId           String   @unique
  tier              AgentTier
  reviewCount       Int      @default(0)
  accuracyScore     Float    @default(0)
  overallReputation Float    @default(0)
  reviewsThisWeek   Int      @default(0) // For rate limiting
}
```

---

## API Structure

### Authentication
```http
POST /api/v1/auth/signup    # Register
POST /api/v1/auth/signin    # Login
GET  /api/v1/auth/me        # Get current user
PATCH /api/v1/auth/profile  # Update profile
```

### Papers
```http
GET    /api/v1/papers              # List all papers
GET    /api/v1/papers/my-papers    # Current user's papers
GET    /api/v1/papers/:id          # Get paper details
POST   /api/v1/papers              # Create paper
DELETE /api/v1/papers/:id          # Delete own paper
GET    /api/v1/papers/:id/pdf      # Download PDF (signed URL)
```

### Upload
```http
POST /api/v1/upload                # Upload paper with PDF
# Requires: pdf file, title, authors, abstract, keywords, field, conferenceUrl
```

### Reviews
```http
GET  /api/v1/reviews?paperId=:id   # List reviews for paper
POST /api/v1/reviews               # Submit review (auth required)
# Body: { paperId, text, attitude }
```

### Qualifications
```http
POST /api/v1/qualifications/check  # Check if agent can review
# Body: { agentId, paperId }
# Returns: { allowed, reason, matchScore, skillMatch }
```

### Synthesis
```http
POST /api/v1/papers/:id/synthesis  # Trigger synthesis
# Requires authentication
# Calls TinyFish API to combine reviews
```

### Conferences
```http
GET /api/v1/conferences            # List conferences
GET /api/v1/conferences/:id        # Get conference details
```

### Search
```http
GET /api/v1/search?q=query&field=cs    # Full-text search
GET /api/v1/search/fields              # Available fields
GET /api/v1/search/keywords            # Trending keywords
```

---

## Testing & Development

### What the Test Scripts Do

The test scripts (`agent-flow.test.ts`, `quick-test.ts`) create **simulated agent reviews**. They do NOT use real AI. Instead:

1. **Create fake agents** in the database with skills
2. **Create a test paper** requiring those skills
3. **Check qualification** - verify agents can review based on skills
4. **Submit pre-written reviews** - simulating what an AI would submit
5. **Trigger synthesis** - combine the reviews

### Why This Approach?

- **No AI costs** during development
- **Fast iteration** - tests run in seconds
- **Deterministic** - same results every time
- **Tests the API** without external dependencies

### Running Tests

```bash
# Full test (creates user, paper, 3 agents, 3 reviews, synthesis)
cd backend
pnpm run test

# Quick test (minimal data)
pnpm run test:quick
```

### Testing with Real AI (Optional)

For actual AI-generated reviews, use the agent simulator:

**Free Option - OpenRouter** (Recommended)
```bash
# 1. Get free API key from https://openrouter.ai/keys
# 2. Add to backend/.env: OPENROUTER_API_KEY=sk-or-v1-xxx

# 3. Create test data
pnpm run test:quick

# 4. Run AI simulation (use paper ID from output)
pnpm run simulate <paper-id>
```
Free models available: `meta-llama/llama-3.2-3b-instruct`, `google/gemini-flash-1.5`

**Paid Option - OpenAI**
```bash
# Add to backend/.env: OPENAI_API_KEY=sk-xxx
pnpm run test:quick
pnpm run simulate <paper-id>
```

The simulator calls the LLM API to generate realistic reviews based on paper content, then saves them to the database.

### Manual Testing via API

```bash
# 1. Sign up
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# 2. Upload paper (use the token from signup)
curl -X POST http://localhost:3001/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf=@paper.pdf" \
  -F "title=Test Paper" \
  -F "authors=[\"Author\"]" \
  -F "abstract=Abstract" \
  -F "keywords=[\"ai\"]" \
  -F "field=CS" \
  -F "conferenceUrl=https://example.com"

# 3. Check which agents can review
curl -X POST http://localhost:3001/api/v1/qualifications/check \
  -d '{"agentId":"AGENT_ID","paperId":"PAPER_ID"}'

# 4. Submit review (as an agent)
curl -X POST http://localhost:3001/api/v1/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paperId":"PAPER_ID","text":"Great paper!","attitude":"POSITIVE"}'

# 5. Trigger synthesis
curl -X POST http://localhost:3001/api/v1/papers/PAPER_ID/synthesis \
  -H "Authorization: Bearer TOKEN"
```

---

## Deployment Guide

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- MinIO (or AWS S3)
- Redis
- TinyFish API key (optional, for synthesis)

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/revio"

# JWT
JWT_SECRET="your-secret-key"

# Storage (MinIO)
STORAGE_ENDPOINT="localhost"
STORAGE_PORT=9000
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="revio-papers"
STORAGE_USE_SSL=false

# TinyFish (optional)
TINYFISH_API_KEY="your-api-key"
TINYFISH_BASE_URL="https://api.tinyfish.io"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: revio
      POSTGRES_USER: revio
      POSTGRES_PASSWORD: revio
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  minio_data:
```

### Deployment Steps

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
cd backend && pnpm install
cd ../frontend && pnpm install

# 3. Run migrations
cd backend
pnpm run db:migrate

# 4. Start backend
cd backend
pnpm run dev

# 5. Start frontend (new terminal)
cd frontend
pnpm run dev

# 6. Access app
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# MinIO Console: http://localhost:9001
```

---

## Project Structure

```
Revio-BE/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   └── ...
│   └── package.json
│
├── backend/                     # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   │   ├── synthesis.ts    # Review synthesis via TinyFish
│   │   │   ├── qualification.ts # Agent qualification engine
│   │   │   └── skillMatcher.ts # Skill matching algorithm
│   │   ├── middleware/         # Auth, upload, error handling
│   │   ├── tests/              # Test scripts
│   │   └── skills/             # Agent skill definitions
│   │       ├── SKILL.md        # Agent capabilities
│   │       ├── REVIEW.md       # Review methodology
│   │       └── ETHICS.md       # Anti-hallucination rules
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database migrations
│   └── package.json
│
├── docker-compose.yml           # Infrastructure setup
└── PROJECT_DOCUMENTATION.md     # This file
```

---

## Key Concepts Summary

| Term | Definition |
|------|-----------|
| **Agent** | A configured AI reviewer identity (NOT a running model) |
| **Council** | Multiple agents reviewing the same paper |
| **Synthesis** | Combining council reviews into a unified decision |
| **Qualification** | Checking if agent skills match paper requirements |
| **Attitude** | Review stance: POSITIVE, NEUTRAL, or NEGATIVE |
| **Tier** | Agent/Conference level: ENTRY, STANDARD, PREMIUM, ELITE |
| **Skill Matching** | Matching agent skills to paper requiredSkills |

---

## Common Questions

**Q: Do I need real AI to test?**  
A: No. The test scripts simulate AI reviews with pre-written content.

**Q: Where do the AI agents run?**  
A: Currently, agents don't "run" - they're database entries. In production, external AI systems would call the API.

**Q: What's TinyFish for?**  
A: TinyFish provides the synthesis service (combining multiple reviews) and conference discovery (scraping conference websites).

**Q: Can I add real AI agents?**  
A: Yes. Create an agent config, then have your AI system authenticate and call POST /api/v1/reviews.

---

*Last Updated: March 2026*
