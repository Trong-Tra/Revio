# Revio: Context & System Architecture

> **For Agents**: This document defines the complete vision of the Revio platform. Read this first before making any contributions.
> **Important**: Agents MUST frequently update `development.md` with progress, blockers, and plan changes.

---

## 🎯 Project Vision

Revio is a specialized platform designed to bridge the gap between human researchers and autonomous AI agents in the scientific ecosystem. It serves as a collaborative hub for paper discovery, automated analysis, and decentralized peer review.

In a world of rapidly accelerating scientific output, Revio provides the infrastructure for AI agents to act as "first-class citizens." The platform allows these agents to ingest, critique, and catalog research with the same standing as human reviewers, enabling faster discovery cycles and more rigorous initial screenings of new literature.

---

## 📊 Domain Model

### 1. Paper Management
The core repository of the platform. Papers are stored with high-fidelity metadata to ensure machine readability.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary identifier |
| `title` | String | Paper title |
| `authors` | String[] | List of authors |
| `abstract` | Text | Paper abstract |
| `keywords` | String[] | Searchable keywords |
| `field` | String | Research field (CS, Biology, etc.) |
| `pdf_url` | String | URL to PDF file |
| `created_at` | Timestamp | Upload date |

**Utility**: Provides the raw data for analysis and the source of truth for citations.

---

### 2. Review Ecosystem
A dual-track system where both AI-driven insights and human expertise coexist.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Review identifier |
| `paper_id` | UUID | Reference to paper |
| `reviewer_type` | Enum (AI/Human) | Type of reviewer |
| `content` | JSON | Structured review data |
| `is_accepted` | Boolean | Acceptance decision |
| `created_at` | Timestamp | Review date |

**Purpose**: Facilitates quality control and provides a training ground for agent-based evaluation.

---

### 3. Agent Governance (AgentConfig)
To ensure consistency and reliability, agents are governed by a configuration layer that dictates their operational parameters.

| Field | Type | Description |
|-------|------|-------------|
| `skills_markdown` | Text | Agent capabilities definition |
| `tone` | String | Communication style (Critical/Encouraging/Academic) |
| `version` | Integer | Config version for tracking |

**Impact**: Ensures agent behavior remains versioned, predictable, and tunable as the platform evolves.

---

## 🔧 Core System Capabilities

| Capability | Agent/User Action |
|------------|-------------------|
| **Discovery** | Search via keywords, filter by domain, stream recent submissions |
| **Ingestion** | Programmatic access to full-text PDFs and structured metadata |
| **Intelligence** | Automated summarization, insight extraction, quality benchmarking |
| **Evaluation** | Generation of structured reviews (strengths, weaknesses, scoring) |
| **Contribution** | Uploading new research and updating metadata via API or UI |

---

## ⚠️ Operational Guardrails

All agents operating within Revio MUST adhere to:

1. **Instruction Adherence**: Behavior strictly maps to `skills_markdown` definition
2. **Grounded Reasoning**: Reviews use structured chain-of-thought logic based ONLY on provided text
3. **Anti-Hallucination**: Prohibited from fabricating metadata or citations not in source material
4. **Style Consistency**: Responses reflect assigned `tone` (Critical, Encouraging, or Academic)

---

## 🔄 Interaction Lifecycle: The Review Loop

The standard workflow for an agent follows a four-stage pipeline:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Query  │ -> │  Fetch  │ -> │ Process │ -> │  Commit │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
 Search/       Get abstract   AI analysis   Post review
 Filter        + PDF link     via config    (type: ai)
```

1. **Query**: Agent identifies a paper via keyword search or field filtering
2. **Fetch**: System provides abstract and PDF download link
3. **Process**: Agent analyzes document based on current AgentConfig
4. **Commit**: Agent posts structured review back to platform (marked as `ai` type)

---

## 📁 Project Structure

```
revio/
├── .github/
│   └── skills/           # Skill definitions for all agents
│       ├── backend.md
│       ├── frontend.md
│       ├── ai-agent.md
│       ├── database.md
│       ├── api-design.md
│       └── infrastructure.md
├── apps/
│   ├── api/              # Backend API (Node.js/TypeScript)
│   ├── web/              # Frontend (React/Next.js)
│   └── agent-worker/     # AI agent processing queue
├── packages/
│   ├── shared/           # Shared types and utilities
│   └── database/         # Prisma schema and migrations
├── docs/
│   ├── context.md        # This file - Project vision
│   └── development.md    # Timeline and implementation plan
└── docker-compose.yml    # Local development stack
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, TypeScript, Express/Fastify |
| Frontend | React, Next.js, TailwindCSS |
| Database | PostgreSQL, Redis |
| Search | Meilisearch / Elasticsearch |
| Queue | BullMQ |
| Storage | S3-compatible (MinIO) |
| AI | OpenAI API / Claude / Local LLMs |

---

## 📋 Input/Output Summary

### System Inputs
- Research papers (PDF + metadata)
- Agent configurations (skills, tone, version)
- Human reviews
- Search queries

### System Outputs
- Indexed, searchable paper catalog
- AI-generated reviews with structured reasoning
- Comparative review dashboards
- Paper recommendations

---

## 🔄 Development Protocol

> ⚡ **CRITICAL**: All agents must update `development.md` after completing tasks:
> - Mark completed items
> - Add new discoveries/blockers
> - Adjust timelines
> - Document architectural decisions

See `.github/skills/` for detailed implementation guidelines per domain.

---

## 🚀 Getting Started (For Agents)

1. Read this `context.md` completely
2. Review relevant skill files in `.github/skills/`
3. Check `development.md` for current priorities
4. Implement according to specifications
5. **Update `development.md`** with progress

---

*Last updated: 2026-03-21*
*Next review: Per milestone completion*
