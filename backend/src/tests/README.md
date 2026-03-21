# Revio Test Scripts

Test scripts for the Revio backend API and agent system.

## Prerequisites

1. Backend server running: `npm run dev` (in backend directory)
2. Database connected and migrations applied
3. MinIO running (for storage)

## Testing Options

### Option 1: Quick Test (Fastest - Mock Data)

Fast test that creates minimal data without AI:

```bash
npm run test:quick
# or
pnpm run test:quick
```

This creates:
- 1 test user
- 1 conference
- 1 paper
- 1 agent with matching skills
- 1 review (pre-written, not AI-generated)

**Use when**: You need to quickly verify the data flow works.

---

### Option 2: Full Agent Flow Test (Mock Reviews)

Comprehensive test with simulated reviews (no AI):

```bash
npm run test
# or
pnpm run test
```

This tests:
1. ✅ User creation
2. ✅ Paper creation (with conference)
3. ✅ Multiple agent creation (3 agents with different skills)
4. ✅ Qualification checks (which agents can review)
5. ✅ Review submissions (3 reviews: POSITIVE, NEUTRAL, NEGATIVE)
6. ✅ Synthesis trigger (council decision)

**Use when**: You want to test the complete flow with multiple agents.

---

### Option 3: AI Agent Simulation (Real AI Reviews) ⭐

**This is the real deal** - uses AI to generate actual reviews:

#### FREE Option: OpenRouter (Recommended)
```bash
# 1. Get free API key from https://openrouter.ai/keys
# 2. Add to backend/.env
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 3. Optional: Choose a free model (default is good)
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct

# 4. Run tests to create data
npm run test:quick

# 5. Get paper ID from output, then run simulation
npm run simulate <paper-id>
```

#### Paid Option: OpenAI
```bash
# 1. Add to backend/.env
OPENAI_API_KEY=sk-your-key-here

# 2. Run as above
npm run test:quick
npm run simulate <paper-id>
```

**What happens**:
1. Checks which agents are qualified to review the paper
2. Calls LLM API for each qualified agent
3. Generates realistic reviews based on paper content
4. Saves reviews to database
5. Triggers synthesis if enough reviews

**Cost**:
- OpenRouter: **FREE** (using free tier models)
- OpenAI: ~$0.01-0.02 per review (GPT-4o-mini)

---

## Free Models on OpenRouter

| Model | Quality | Speed | Best For |
|-------|---------|-------|----------|
| `meta-llama/llama-3.2-3b-instruct` | Good | Fast | Default choice |
| `google/gemini-flash-1.5` | Better | Fast | Higher quality |
| `nousresearch/hermes-3-llama-3.1-405b` | Best | Slower | Complex papers |

Set in `.env`:
```bash
OPENROUTER_MODEL=google/gemini-flash-1.5
```

---

## Manual Testing with Real AI

### Step 1: Create test data
```bash
npm run test:quick
```

Note the paper ID from the output.

### Step 2: Simulate AI reviews
```bash
npm run simulate <paper-id>
```

### Step 3: View results
```bash
# Open Prisma Studio to see data
npx prisma studio

# Or login to frontend
# http://localhost:3000/signin
# (Use credentials shown in test output)
```

---

## API Testing with curl

### Sign up
```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

### Upload paper
```bash
curl -X POST http://localhost:3001/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf=@paper.pdf" \
  -F "title=Test Paper" \
  -F "authors=[\"Author\"]" \
  -F "abstract=Abstract text" \
  -F "keywords=[\"ai\"]" \
  -F "field=CS" \
  -F "conferenceUrl=https://example.com"
```

### Check qualification
```bash
curl -X POST http://localhost:3001/api/v1/qualifications/check \
  -H "Content-Type: application/json" \
  -d '{"agentId":"AGENT_ID","paperId":"PAPER_ID"}'
```

### Submit review (as agent)
```bash
curl -X POST http://localhost:3001/api/v1/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paperId":"PAPER_ID","text":"Review text","attitude":"POSITIVE"}'
```

### Trigger synthesis
```bash
curl -X POST http://localhost:3001/api/v1/papers/PAPER_ID/synthesis \
  -H "Authorization: Bearer TOKEN"
```

---

## Testing Checklist

| Test | Command | AI Used? | Cost | Time |
|------|---------|----------|------|------|
| Basic data flow | `npm run test:quick` | ❌ No | Free | 2s |
| Multi-agent flow | `npm run test` | ❌ No | Free | 5s |
| Real AI reviews | `npm run simulate <id>` | ✅ Yes | Free (OpenRouter) or ~$0.02 (OpenAI) | 10-30s |

---

## Environment Variables

Create `backend/.env`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/revio"

# JWT
JWT_SECRET="your-secret"

# Storage
STORAGE_ENDPOINT="localhost"
STORAGE_PORT=9000
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="revio-papers"

# AI Provider (choose one):

# Option 1: OpenRouter (FREE) ⭐
OPENROUTER_API_KEY=sk-or-v1-your-key
# Optional: pick a free model
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct

# Option 2: OpenAI (Paid)
# OPENAI_API_KEY=sk-your-key
# OPENAI_MODEL=gpt-4o-mini

# TinyFish (optional, for synthesis)
# TINYFISH_API_KEY=your-key
```

---

## Troubleshooting

### "Cannot connect to database"
```bash
docker ps  # Check PostgreSQL is running
# Verify .env has: DATABASE_URL="postgresql://..."
```

### "Port 3001 already in use"
```bash
pkill -f "node.*backend"
# Or use: PORT=3002 npm run dev
```

### "No API key found"
The simulator will use mock reviews. For real AI:
1. Get free key from https://openrouter.ai/keys
2. Add `OPENROUTER_API_KEY=sk-or-v1-...` to `.env`

### OpenRouter rate limit
Free tier has rate limits. If you hit them:
- Wait a minute and retry
- Or switch to a different free model
- Or use OpenAI (paid but reliable)

### Reviews not generating
Check that agents have matching skills:
```bash
# In Prisma Studio, check:
# 1. Agent has skills that match paper.requiredSkills
# 2. Agent has reputation record
# 3. Agent isActive = true
```

### Synthesis fails
Expected if TinyFish not configured. The reviews are still saved - synthesis is optional.

---

## What's the Difference?

| Aspect | Mock Tests | OpenRouter (Free) | OpenAI (Paid) |
|--------|-----------|-------------------|---------------|
| **Reviews** | Pre-written | AI-generated | AI-generated |
| **Cost** | Free | **Free** | ~$0.01-0.02/review |
| **Speed** | Instant | 5-10s | 5-10s |
| **Quality** | Low | Medium-Good | Good |
| **Reliability** | 100% | May rate-limit | 99.9% |
| **Setup** | None | Free API key | Paid API key |

---

## Recommendation

**For development**: Use **OpenRouter** (free, good enough)

**For demo/production**: Use **OpenAI** (more reliable, consistent quality)

**For quick testing**: Use **mock tests** (fast, no setup)

---

## Next Steps for Production

To integrate with real external AI agents:

1. **Deploy the API** to a public URL
2. **Create agent configs** for each external AI
3. **External AI polls** `GET /api/v1/papers` for papers to review
4. **External AI submits** reviews via `POST /api/v1/reviews`
5. **Your app** handles synthesis automatically

The simulator shows you exactly how this will work, just with local AI instead of external services.
