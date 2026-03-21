# Revio: Development Plan & Timeline

> **Agent Protocol**: Update this file after EVERY significant task. Track progress, blockers, and timeline adjustments here.

---

## 📅 Project Timeline

### Phase 0: Frontend Foundation ✅ COMPLETE
**Goal**: Frontend UI implementation

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Vite + React 19 setup | ✅ Done | - | Port 3000 |
| Tailwind v4 theming | ✅ Done | - | Custom color tokens |
| Page routing | ✅ Done | - | Home, Paper, Upload, Settings, Docs |
| UI component library | ✅ Done | - | Button, Card, Input, Badge, Textarea |
| Mock data displays | ✅ Done | - | Static paper/review data |

---

### Phase 1: Backend API (Week 1-2) 🔨 CURRENT
**Goal**: Core API to serve frontend data needs

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Backend project setup | ✅ Done | - | Express + TypeScript |
| Database schema (Prisma) | ✅ Done | - | Papers, Reviews, AgentConfigs, Users |
| Docker Compose stack | ✅ Done | - | Postgres + Redis + MinIO |
| Environment configuration | ✅ Done | - | .env.example provided |
| Papers API | ✅ Done | - | CRUD + list with filters + search |
| File upload/download | ✅ Done | - | Multer + MinIO storage |
| Reviews API | ✅ Done | - | AI + Human review endpoints |
| Agent Config API | ✅ Done | - | CRUD + versioning + activation |
| Search endpoint | ✅ Done | - | Query + filters + trending keywords |
| Database seed script | ✅ Done | - | Sample data for development |

**Milestone Definition of Done**:
- [x] Backend API serves paper data to frontend
- [x] Can upload paper (PDF + metadata)
- [x] Can view paper list with pagination
- [x] Can view paper details with reviews
- [x] Search works with text queries
- [x] All services run via `docker-compose up`

---

### Phase 2: Review System (Week 3) 📝
**Goal**: Human and AI review capabilities

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Reviews table & API | ✅ Done | - | CRUD operations |
| Human review submission UI | ⏳ Pending | - | Form with validation |
| AI agent worker setup | ⏳ Pending | - | BullMQ processor |
| AgentConfig management API | ✅ Done | - | CRUD for agent configs |
| Basic AI review generation | ⏳ Pending | - | OpenAI integration |
| Review comparison view | ⏳ Pending | - | Side-by-side UI |
| **Agent Skill Governance** | ✅ Done | - | SKILL.md, REVIEW.md, FIELDS.md, ETHICS.md |

**Milestone Definition of Done**:
- [ ] Human can submit a review
- [ ] AI can generate a review (async)
- [ ] Can compare AI vs Human reviews

---

### Phase 3: Discovery & Search (Week 4) 🔍
**Goal**: Powerful search and recommendation

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Meilisearch integration | ⏳ Pending | - | Index papers |
| Full-text search API | ⏳ Pending | - | Search endpoints |
| Advanced filters UI | ⏳ Pending | - | Field, date, author |
| Keyword extraction from papers | ⏳ Pending | - | NLP processing |
| Trending papers algorithm | ⏳ Pending | - | Based on reviews |

**Milestone Definition of Done**:
- [ ] Search returns relevant results in < 100ms
- [ ] Filters work in combination
- [ ] Trending section on homepage

---

### Phase 4: Agent Intelligence (Week 5) 🤖
**Goal**: Sophisticated AI agent capabilities

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Chain-of-thought prompting | ⏳ Pending | - | Structured reasoning |
| Anti-hallucination measures | ⏳ Pending | - | Grounding checks |
| Tone configuration implementation | ⏳ Pending | - | Critical/Encouraging/Academic |
| PDF text extraction pipeline | ⏳ Pending | - | pdf-parse integration |
| Agent versioning system | ⏳ Pending | - | Config versions |
| Review quality scoring | ⏳ Pending | - | Confidence metrics |

**Milestone Definition of Done**:
- [ ] AI reviews include reasoning steps
- [ ] No hallucinated citations in reviews
- [ ] Different tones produce noticeably different outputs

---

### Phase 5: Polish & Deployment (Week 6) 🚀
**Goal**: Production-ready platform

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Authentication & authorization | ⏳ Pending | - | JWT + roles |
| API rate limiting | ⏳ Pending | - | Redis-based |
| Frontend optimization | ⏳ Pending | - | Lighthouse 90+ |
| CI/CD pipeline | ⏳ Pending | - | GitHub Actions |
| Production deployment | ⏳ Pending | - | VPS/Cloud |
| Documentation | ⏳ Pending | - | API docs + user guide |
| Monitoring setup | ⏳ Pending | - | Prometheus + Grafana |

**Milestone Definition of Done**:
- [ ] Platform publicly accessible
- [ ] API documentation complete
- [ ] Monitoring dashboards active

---

## 🎯 Current Sprint Focus

### Sprint 1: Foundation Setup
**Dates**: 2026-03-21 → 2026-03-28

#### Today's Priorities (2026-03-21)
1. ✅ Create project documentation (context.md, skills, development.md)
2. 🔄 Initialize monorepo with pnpm workspaces
3. ⏳ Set up Docker Compose for local development
4. ⏳ Initialize database with Prisma

#### Blockers
- None currently

---

## 🏗️ Architecture Decisions Log

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-03-21 | Monorepo with pnpm | Simplifies shared code, consistent versioning | ✅ Approved |
| 2026-03-21 | PostgreSQL + Redis | Reliable, well-documented, fits our scale | ✅ Approved |
| 2026-03-21 | Meilisearch over Elasticsearch | Simpler setup, sufficient for our needs | ✅ Approved |

---

## 📊 Progress Metrics

| Phase | Completion | Key Deliverables |
|-------|------------|------------------|
| Phase 1 | 10% | Docs created |
| Phase 2 | 0% | - |
| Phase 3 | 0% | - |
| Phase 4 | 0% | - |
| Phase 5 | 0% | - |

---

## 🐛 Known Issues & Technical Debt

| Issue | Severity | Phase to Fix | Notes |
|-------|----------|--------------|-------|
| None yet | - | - | Starting fresh! |

---

## 🔄 Update Log

| Date | Changes Made | Updated By |
|------|--------------|------------|
| 2026-03-21 | Initial development plan created | System |
| 2026-03-21 | GitHub repo initialized, initial commit pushed | System |
| 2026-03-21 | Frontend UI landed - React 19 + Vite + Tailwind | System |
| 2026-03-21 | Backend API implemented - Express + Prisma + Docker | System |
| 2026-03-21 | Frontend-backend integration complete | System |
| 2026-03-21 | PDF upload with MinIO storage implemented | System |
| 2026-03-21 | Frontend disconnected from backend for refactor | System |
| 2026-03-21 | Agent skill governance layer implemented | System |

---

## 📝 Next Actions for Agents

1. **Immediate**: Set up monorepo structure
2. **This Week**: Complete Phase 1 foundation
3. **Review**: Check back here before starting new tasks

---

*Next update expected: After Phase 1 completion*
*Last updated: 2026-03-21*
