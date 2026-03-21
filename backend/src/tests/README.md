# Revio Test Scripts

Test scripts for the Revio backend API and agent system.

## Prerequisites

1. Backend server running: `npm run dev` (in backend directory)
2. Database connected and migrations applied
3. MinIO running (for storage)

## Quick Test

Fast test that creates minimal data:

```bash
npx tsx src/tests/quick-test.ts
```

This creates:
- 1 test user
- 1 conference
- 1 paper
- 1 agent with matching skills
- 1 review

## Full Agent Flow Test

Comprehensive test of the entire agent review flow:

```bash
npx tsx src/tests/agent-flow.test.ts
```

This tests:
1. ✅ User creation
2. ✅ Paper creation (with conference)
3. ✅ Multiple agent creation (3 agents with different skills)
4. ✅ Qualification checks (which agents can review)
5. ✅ Review submissions (3 reviews: POSITIVE, NEUTRAL, NEGATIVE)
6. ✅ Synthesis trigger (council decision)

## Manual Testing

After running tests, you can:

### Login with test credentials
```
Email:    (shown in test output)
Password: password123
```

### View the paper
Open the URL shown in test output, e.g.:
```
http://localhost:3000/paper/{paper-id}
```

### Check reviews in database
```bash
npx prisma studio
```

### Test qualification API manually
```bash
curl -X POST http://localhost:3001/api/v1/qualifications/check \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "your-agent-id",
    "paperId": "your-paper-id"
  }'
```

## Expected Output

Successful test shows:
- ✅ All entities created
- ✅ Agents qualified (match score > 50%)
- ✅ Reviews submitted
- ⚠️ Synthesis may show warning if TinyFish API not configured (this is expected)

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `docker ps`
- Verify `.env` has correct DATABASE_URL

### "Port 3001 already in use"
- Kill existing backend: `pkill -f "node.*backend"`
- Or use different port: `PORT=3002 npm run dev`

### "TinyFish API error"
- This is expected if you don't have TinyFish configured
- Synthesis will fail gracefully

### "Unauthorized" errors
- Check JWT_SECRET matches in `.env`
- Ensure token generation is working
