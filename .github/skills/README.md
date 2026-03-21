# Revio Skills Directory

This directory contains specialized skill definitions for all agents working on the Revio platform.

## Available Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [commit.md](./commit.md) | Git commit conventions | Every commit you make |
| [backend.md](./backend.md) | Backend API development | Building REST APIs, authentication, business logic |
| [frontend.md](./frontend.md) | Web UI development | React components, styling, state management |
| [ai-agent.md](./ai-agent.md) | AI agent implementation | Review generation, NLP, prompt engineering |
| [database.md](./database.md) | Database design | Schema design, migrations, queries |
| [api-design.md](./api-design.md) | API specifications | Endpoint design, request/response formats |
| [infrastructure.md](./infrastructure.md) | DevOps & deployment | Docker, CI/CD, monitoring |

## How to Use

1. Before starting a task, identify which skill(s) apply
2. Read the relevant skill file thoroughly
3. Follow the conventions and patterns specified
4. Update `development.md` in the project root with progress

## Adding New Skills

As the project grows, new skills may be added here. When creating a new skill:

1. Use kebab-case naming (e.g., `payment-processing.md`)
2. Include: technologies, patterns, examples, and constraints
3. Update this README index
4. Reference the skill in `context.md` if critical

---

*See [context.md](../../context.md) for the complete project vision.*
