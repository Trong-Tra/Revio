# Revio: Development Plan & Timeline

> **Building the Qualification Engine for AI-Assisted Peer Review**

---

## 🎯 Current Status

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| Foundation | ✅ Complete | Backend API, Frontend UI, Database, File upload |
| Real Data | ✅ Complete | IEEE papers with reviews seeded |
| Skill Governance | ✅ Complete | Agent skill definitions (SKILL.md, etc.) |
| **Qualification Engine** | 🔨 **CURRENT** | **The core innovation - matching & access control** |
| Production | ⏳ Pending | Deployment, monitoring, scaling |

---

## 📅 Project Timeline

### Phase 1: Foundation (Week 1-2) ✅ COMPLETE
**Goal**: Core infrastructure

| Task | Status | Notes |
|------|--------|-------|
| Backend API (Express + Prisma) | ✅ Done | Full CRUD, file upload, search, auth |
| Frontend (React + Vite) | ✅ Done | Modern UI with animations |
| Database schema | ✅ Done | Papers, Reviews, AgentConfigs, Users, Reputation |
| Docker stack | ✅ Done | Postgres + Redis + MinIO |
| File upload to MinIO | ✅ Done | PDF storage working |
| Auth system | ✅ Done | JWT-based auth with signup/signin |

---

### Phase 2: Real Data & Integration (Week 3) ✅ COMPLETE
**Goal**: Seed with real content and full integration

| Task | Status | Notes |
|------|--------|-------|
| Seed real papers | ✅ Done | 2 IEEE papers (Lotus Bridge, Proof-of-Merit) with reviews |
| Agent skill files | ✅ Done | SKILL.md, REVIEW.md, FIELDS.md, ETHICS.md |
| Frontend-backend integration | ✅ Done | API client, hooks wired, all pages connected |
| Agent directory UI | ✅ Done | Browse agents with reputation |
| Auth integration | ✅ Done | Login/signup working with backend |
| Paper display | ✅ Done | All paper fields transformed for UI |
| Review display | ✅ Done | Reviews with aspects and scores |

---

### Phase 3: The Qualification Engine (Week 4-5) 🔨 CURRENT
**Goal**: Build the core differentiator - matching & access control

#### 3.1 Skill Extraction System
| Task | Status | Notes |
|------|--------|-------|
| Paper skill extraction API | ⏳ Pending | NLP to extract skills from abstract/content |
| Keyword-to-skill mapping | ⏳ Pending | Normalize extracted terms to skill taxonomy |
| Conference skill override | ⏳ Pending | Allow conferences to set required skills |
| Skill confidence scoring | ⏳ Pending | How confident are we in extraction? |

#### 3.2 Agent Skill Management
| Task | Status | Notes |
|------|--------|-------|
| Agent skill declaration | ⏳ Pending | Agents declare skills with levels |
| Skill verification system | ⏳ Pending | Validate skills through review history |
| Skill level progression | ⏳ Pending | NOVICE → PROFICIENT → EXPERT |

#### 3.3 The Matching Algorithm ⭐ CRITICAL
| Task | Status | Notes |
|------|--------|-------|
| Skill matching engine | ⏳ Pending | Calculate match % between paper & agent |
| Match scoring algorithm | ⏳ Pending | Weighted scoring for partial matches |
| Match threshold config | ⏳ Pending | Min match % for qualification |
| Multiple skill handling | ⏳ Pending | AND vs OR logic for required skills |

**Algorithm sketch:**
```typescript
function calculateMatch(
  paperSkills: string[],
  agentSkills: AgentSkill[]
): MatchResult {
  const required = paperSkills;
  const has = agentSkills.filter(s => s.level !== 'NOVICE').map(s => s.name);
  
  const matched = required.filter(r => has.includes(r));
  const missing = required.filter(r => !has.includes(r));
  
  const score = matched.length / required.length;
  
  return {
    score,
    matched,
    missing,
    qualified: score >= 0.5, // Configurable threshold
  };
}
```

#### 3.4 Reputation & Tier System ⭐ CRITICAL
| Task | Status | Notes |
|------|--------|-------|
| Reputation tracking | ⏳ Pending | Review count, accuracy, helpfulness |
| Tier definitions | ⏳ Pending | ENTRY → STANDARD → PREMIUM → ELITE |
| Tier requirements | ⏳ Pending | Reputation thresholds for each tier |
| Accuracy measurement | ⏳ Pending | Compare agent review to final decision |
| Helpfulness ratings | ⏳ Pending | Humans rate agent review usefulness |

**Tier Requirements:**
| Tier | Review Count | Accuracy | Other |
|------|--------------|----------|-------|
| ENTRY | 0 | - | Just register |
| STANDARD | 10 | 80% | 5+ skill matches |
| PREMIUM | 50 | 90% | Expert in 3+ skills |
| ELITE | 200 | 95% | Verified expert, 10+ premium reviews |

#### 3.5 Access Control Gates ⭐ CRITICAL
| Task | Status | Notes |
|------|--------|-------|
| Tier-based access | ⏳ Pending | Check agent tier vs paper tier |
| Skill-based access | ⏳ Pending | Check skill match % |
| Weekly review limits | ⏳ Pending | Rate limiting per tier |
| Paper assignment logic | ⏳ Pending | Match papers to qualified agents |

**Access Check:**
```typescript
function canReview(agent: Agent, paper: Paper): AccessResult {
  // 1. Check tier
  if (agent.reputation.tier < paper.tier) {
    return { allowed: false, reason: 'Insufficient tier' };
  }
  
  // 2. Check skills
  const match = calculateMatch(paper.requiredSkills, agent.skills);
  if (!match.qualified) {
    return { allowed: false, reason: 'Skills mismatch', match };
  }
  
  // 3. Check rate limit
  if (agent.reviewsThisWeek >= agent.tierLimit) {
    return { allowed: false, reason: 'Weekly limit reached' };
  }
  
  return { allowed: true, match };
}
```

#### 3.6 Agent Council Formation
| Task | Status | Notes |
|------|--------|-------|
| Council assignment API | ⏳ Pending | Assign N agents to paper |
| Ranking qualified agents | ⏳ Pending | By match score + reputation |
| Consensus aggregation | ⏳ Pending | Combine multiple agent reviews |
| Conflict resolution | ⏳ Pending | Handle divergent agent opinions |

**Council Formation:**
```typescript
async function formCouncil(paper: Paper, size: number = 3): Promise<Agent[]> {
  // 1. Get all qualified agents
  const qualified = await getQualifiedAgents(paper);
  
  // 2. Rank by (match_score * 0.6 + reputation * 0.4)
  const ranked = qualified.sort((a, b) => 
    calculateRankingScore(b) - calculateRankingScore(a)
  );
  
  // 3. Return top N
  return ranked.slice(0, size);
}
```

**Milestone Definition of Done:**
- [ ] Paper skills auto-extracted on upload
- [ ] Agents declare and verify skills
- [ ] Matching algorithm returns match scores
- [ ] Tier system gates paper access
- [ ] Agent councils auto-form for papers
- [ ] Reputation updates based on review accuracy

---

### Phase 4: Human Integration (Week 6)
**Goal**: Complete the human-in-the-loop experience

| Task | Status | Notes |
|------|--------|-------|
| Human review submission | ⏳ Pending | Form to submit human review |
| Agent council display | 🔨 In Progress | Paper detail UI now supports horizontal review cards + text-first detail modal |
| Consensus visualization | ⏳ Pending | Graphs of agent agreement |
| Helpfulness rating | ⏳ Pending | Human rates each agent review |
| Review comparison | ⏳ Pending | Side-by-side agent vs human |

---

### Phase 5: Production & Polish (Week 7)
**Goal**: Deploy and scale

| Task | Status | Notes |
|------|--------|-------|
| Frontend deployment | ⏳ Pending | Vercel |
| Backend deployment | ⏳ Pending | Railway/Render/Fly |
| Database migration | ⏳ Pending | Production Postgres |
| Monitoring | ⏳ Pending | Logs, metrics, alerts |
| Documentation | ⏳ Pending | API docs, user guides |

---

## 🏗️ Architecture Decisions

### Skill Taxonomy
Use hierarchical skills:
```
computer-science/
  ├── blockchain/
  │   ├── consensus-mechanisms
  │   ├── smart-contracts
  │   └── zero-knowledge-proofs
  ├── machine-learning/
  │   ├── transformers
  │   ├── reinforcement-learning
  │   └── federated-learning
  └── distributed-systems/
      ├── p2p-networks
      ├── byzantine-fault-tolerance
      └── sharding
```

### Reputation Calculation
```
reputation_score = (
  review_count * 0.3 +
  accuracy * 0.4 +
  helpfulness * 0.2 +
  consistency * 0.1
)
```

### Match Scoring
```
match_score = matched_skills / required_skills
weighted_match = Σ(skill_weight * match) / Σ(skill_weights)
```

---

## 📊 Metrics to Track

### System Health
- Papers processed per day
- Average skill extraction confidence
- Agent council formation time
- Match quality (human validation)

### Agent Performance
- Reputation distribution
- Tier progression rates
- Skill verification accuracy
- Review consensus rates

### Human Satisfaction
- Time saved per review
- Review quality improvement
- Agent helpfulness ratings
- Cross-disciplinary coverage

---

## 🚀 Next Actions

1. **Build skill extraction service** - Start with keyword extraction
2. **Implement matching algorithm** - Basic skill overlap calculation
3. **Create tier system** - Define thresholds, implement gates
4. **Build agent council API** - Assignment and ranking logic
5. **Wire to frontend** - Show qualification status, council reviews

---

## 📝 Update Log

| Date | Changes |
|------|---------|
| 2026-03-21 | Initial development plan created |
| 2026-03-21 | GitHub repo initialized |
| 2026-03-21 | Frontend UI landed |
| 2026-03-21 | Backend API implemented |
| 2026-03-21 | Frontend-backend integration complete |
| 2026-03-21 | PDF upload with MinIO storage implemented |
| 2026-03-21 | Frontend disconnected from backend for refactor |
| 2026-03-21 | Agent skill governance layer implemented |
| 2026-03-21 | Real published papers (Lotus Bridge, Proof-of-Merit) seeded |
| 2026-03-21 | Frontend rewired to backend API |
| 2026-03-21 | **Context & Development docs updated with Qualification Engine vision** |
| 2026-03-21 | Paper detail review UX updated: full-width sections, horizontal fixed-height review cards, and scrollable text-only review modal |

---

*Current Focus: Building the Qualification Engine*
*Milestone Target: End of Week 5*
