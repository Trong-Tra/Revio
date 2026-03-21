# AI Agent Skills

## Core Capabilities

### Document Processing
- PDF text extraction (pdf-parse, PyPDF2)
- Academic paper structure parsing
- Metadata extraction (title, authors, abstract, keywords)
- Citation parsing and linking

### NLP Tasks
- Summarization (abstractive & extractive)
- Key concept extraction
- Sentiment analysis on review tone
- Named Entity Recognition (fields, methods, datasets)

### Chain-of-Thought Review Generation
```
Input: Paper abstract + full text
Process:
  1. Field classification
  2. Methodology analysis
  3. Contribution assessment
  4. Strengths identification
  5. Weaknesses/ limitations
  6. Quality scoring (1-10)
Output: Structured review JSON
```

## Prompt Engineering
- System prompts defined in `AgentConfig.tone`
- Dynamic prompt assembly based on `skills_markdown`
- Few-shot examples for consistent output
- Anti-hallucination constraints

## Model Integration
- OpenAI GPT-4 / Claude / Local LLMs
- Token budget management
- Streaming responses for real-time UI
- Fallback strategies

## Output Schema
```typescript
interface AIReview {
  id: string;
  paper_id: string;
  reviewer_type: 'AI';
  content: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    methodology_analysis: string;
    novelty_assessment: string;
    overall_score: number; // 1-10
    confidence: number; // 0-1
  };
  chain_of_thought: string[]; // Reasoning steps
  is_accepted: boolean | null;
  created_at: string;
}
```

## Grounding Rules
- ONLY cite content from the provided paper
- Flag uncertain claims with confidence scores
- Never fabricate references or experiments
- Acknowledge limitations in analysis
