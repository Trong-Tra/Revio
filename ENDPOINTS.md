# Revio API Endpoint Reference

**Production URLs:**
- Frontend: https://revio-six.vercel.app/
- Backend: https://revio-16h9.onrender.com/api/v1

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status + paper count (10 limit) |

---

## Authentication

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/v1/auth/signup` | `{name, email, password}` | No | Create account |
| POST | `/api/v1/auth/signin` | `{email, password}` | No | Login |
| POST | `/api/v1/auth/signout` | - | Yes | Logout |
| GET | `/api/v1/auth/me` | - | Yes | Get current user |
| PATCH | `/api/v1/auth/profile` | `{name, affiliation, bio}` | Yes | Update profile |

**Auth Header:** `Authorization: Bearer <token>`

---

## Papers

| Method | Endpoint | Body/Params | Auth | Description |
|--------|----------|-------------|------|-------------|
| GET | `/api/v1/papers` | `?field=&search=&page=` | No | List papers |
| GET | `/api/v1/papers/my-papers` | - | Yes | User's papers |
| GET | `/api/v1/papers/:id` | - | No | Get paper details |
| POST | `/api/v1/papers` | `{title, authors[], abstract, keywords[], field, doi?}` | Yes | Create paper (metadata only) |
| PATCH | `/api/v1/papers/:id` | `{any fields}` | Yes | Update paper |
| DELETE | `/api/v1/papers/:id` | - | Yes | Delete paper + PDF |
| GET | `/api/v1/papers/:id/pdf` | - | No | Download PDF (signed URL) |

---

## Upload (File Upload)

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/v1/upload` | FormData: `pdf`, `title`, `authors`, `abstract`, `keywords`, `field`, `doi?`, `conferenceId?` | Yes | Upload PDF + create paper |

**Max 10 papers allowed (HACKATHON MVP)**

---

## Reviews

| Method | Endpoint | Body/Params | Auth | Description |
|--------|----------|-------------|------|-------------|
| GET | `/api/v1/reviews` | `?paperId=` | No | List reviews |
| POST | `/api/v1/reviews` | `{paperId, content, isAccepted?}` | Yes | Submit review |
| GET | `/api/v1/reviews/:id` | - | No | Get review |
| PATCH | `/api/v1/reviews/:id` | `{content, isAccepted}` | Yes | Update review |
| DELETE | `/api/v1/reviews/:id` | - | Yes | Delete review |

---

## Synthesis (TinyFish AI)

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/v1/papers/:paperId/synthesis` | `{forceTinyFish?}` | Yes | Generate AI synthesis |
| GET | `/api/v1/papers/:paperId/synthesis` | - | Yes | Get existing synthesis |

**Response:** `{summary, strengths[], weaknesses[], recommendation, confidence}`

---

## Agent Configs

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/api/v1/agent-configs` | - | No | List all agents |
| GET | `/api/v1/agent-configs/active` | - | No | List active agents |
| GET | `/api/v1/agent-configs/:id` | - | No | Get agent details |
| POST | `/api/v1/agent-configs` | `{name, systemPrompt, fields[], ...}` | Yes | Create agent |
| PATCH | `/api/v1/agent-configs/:id` | `{any fields}` | Yes | Update agent |
| DELETE | `/api/v1/agent-configs/:id` | - | Yes | Delete agent |
| POST | `/api/v1/agent-configs/:id/activate` | - | Yes | Activate agent |

---

## Conferences

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/api/v1/conferences` | - | No | List conferences |
| GET | `/api/v1/conferences/:id` | - | No | Get conference |
| POST | `/api/v1/conferences` | `{name, acronym?, tier, requiredSkills[], publisher?, website?}` | Yes | Create conference |
| PATCH | `/api/v1/conferences/:id` | `{any fields}` | Yes | Update conference |
| DELETE | `/api/v1/conferences/:id` | - | Yes | Delete conference |

---

## Search

| Method | Endpoint | Params | Auth | Description |
|--------|----------|--------|------|-------------|
| GET | `/api/v1/search` | `?q=&field=&sort=&page=` | No | Search papers |
| GET | `/api/v1/search/fields` | - | No | Get field counts |
| GET | `/api/v1/search/keywords` | - | No | Get keyword counts |

---

## Qualifications

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/v1/qualifications/check` | `{agentId, paperId}` | Yes | Check if agent can review |
| POST | `/api/v1/qualifications/council` | `{paperId, councilSize?}` | Yes | Form review council |
| GET | `/api/v1/qualifications/papers/:paperId/agents` | - | Yes | Get qualified agents |
| POST | `/api/v1/qualifications/skills/extract` | `{title, abstract, keywords[]}` | Yes | Extract skills from paper |
| POST | `/api/v1/qualifications/skills/match` | `{paperSkills[], agentSkills[]}` | Yes | Match skills |

---

## Environment Variables (Production)

### Render (Backend)
```
DATABASE_URL=postgresql://neondb_owner:...@neon.tech/...
STORAGE_ENDPOINT=92afad325cbc...r2.cloudflarestorage.com
STORAGE_PORT=443
STORAGE_USE_SSL=true
STORAGE_ACCESS_KEY=a0ab2444...
STORAGE_SECRET_KEY=be167f48...
STORAGE_BUCKET=revio-papers
OPENROUTER_API_KEY=sk-or-v1-...
TINYFISH_API_KEY=sk-tinyfish-...
FRONTEND_URL=https://revio-six.vercel.app
JWT_SECRET=your-jwt-secret
```

### Vercel (Frontend)
```
VITE_API_URL=https://revio-16h9.onrender.com/api/v1
```

---

## Quick Test Commands

```bash
# Health check
curl https://revio-16h9.onrender.com/health

# List papers
curl https://revio-16h9.onrender.com/api/v1/papers

# List agents
curl https://revio-16h9.onrender.com/api/v1/agent-configs

# Search
curl "https://revio-16h9.onrender.com/api/v1/search?q=machine+learning"
```

---

## Common Issues

### 1. `ERR_BLOCKED_BY_CLIENT` / `localhost:3001`
**Cause:** `VITE_API_URL` not set in Vercel
**Fix:** Add `VITE_API_URL=https://revio-16h9.onrender.com/api/v1` in Vercel env vars

### 2. `401 Unauthorized`
**Cause:** Missing JWT token
**Fix:** User must login first, token stored in localStorage

### 3. `403 Max 10 papers`
**Cause:** Hackathon MVP limit reached
**Fix:** Delete existing paper before uploading

### 4. `Failed to fetch`
**Cause:** CORS blocked or backend down
**Fix:** Check `FRONTEND_URL` in Render, ensure it matches Vercel URL

---

## Demo Flow

1. **User uploads paper** → `POST /api/v1/upload` (requires auth)
2. **Get paper ID** from response
3. **Run agent script:** `npx tsx scripts/demo-agents.ts <paper-id>`
4. **Refresh page** → see 6 AI reviews
5. **Trigger synthesis** → `POST /api/v1/papers/:id/synthesis`
6. **See final decision** → summary + ACCEPT/REJECT
