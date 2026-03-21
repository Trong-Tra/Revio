/**
 * Review Synthesis Service
 * 
 * Uses TinyFish AI (or local fallback) to synthesize multiple agent reviews
 * into a unified decision with summary, strengths, and weaknesses.
 */

import pkg from '@prisma/client';
const { ReviewAttitude } = pkg;
import type { ReviewAttitude as ReviewAttitudeType } from '@prisma/client';

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || '';
const TINYFISH_BASE_URL = 'https://agent.tinyfish.ai/v1';

interface ReviewSynthesisInput {
  paperTitle: string;
  paperAbstract: string;
  reviews: Array<{
    agentId: string;
    text: string;
    attitude: ReviewAttitudeType;
  }>;
}

interface ReviewSynthesisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'ACCEPT' | 'REJECT' | 'MAJOR_REVISION';
  confidence: number;
}

/**
 * Synthesize council reviews into a unified decision using TinyFish
 */
export async function synthesizeReviews(
  input: ReviewSynthesisInput
): Promise<ReviewSynthesisResult> {
  if (!TINYFISH_API_KEY) {
    console.log('[TinyFish] No API key, using local synthesis');
    return localSynthesis(input);
  }

  try {
    const prompt = buildSynthesisPrompt(input);
    
    console.log('[TinyFish] Initiating synthesis...');
    
    const response = await fetch(`${TINYFISH_BASE_URL}/automation/run-sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url: 'https://example.com',
        goal: prompt,
        proxy_config: { enabled: false },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TinyFish] API error: ${response.status}`, errorText.slice(0, 500));
      throw new Error(`TinyFish API error: ${response.status}`);
    }

    // Read the full SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    let completeResult: any = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        const result = parseSSELine(line.trim());
        if (result && result.type === 'COMPLETE') {
          completeResult = result;
        }
      }
    }
    
    // Process any remaining data
    if (buffer.trim()) {
      const result = parseSSELine(buffer.trim());
      if (result && result.type === 'COMPLETE') {
        completeResult = result;
      }
    }
    
    if (completeResult?.result) {
      console.log('[TinyFish] Got synthesis result');
      const synthesis = normalizeResult(completeResult.result);
      return synthesis;
    }
    
    throw new Error('No COMPLETE message received from TinyFish');
    
  } catch (error) {
    console.error('[TinyFish] Synthesis failed:', error);
    console.log('[TinyFish] Falling back to local synthesis');
    return localSynthesis(input);
  }
}

/**
 * Parse a single SSE data line
 */
function parseSSELine(line: string): any | null {
  if (!line.startsWith('data:')) return null;
  
  const data = line.slice(5).trim();
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (e) {
    // If direct parsing fails, the JSON might span multiple lines or be malformed
    // Try to extract JSON object
    const match = data.match(/^(\{.*?\})$/s);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }
    return null;
  }
}

/**
 * Build the synthesis prompt for TinyFish
 */
function buildSynthesisPrompt(input: ReviewSynthesisInput): string {
  const reviewsText = input.reviews
    .map((r, i) => `REVIEW ${i + 1} (Agent: ${r.agentId.slice(0, 8)}..., Attitude: ${r.attitude}):\n${r.text.slice(0, 2000)}`)
    .join('\n\n---\n\n');

  return `You are a senior academic editor. Synthesize these peer reviews into a unified assessment for a research paper.

PAPER TITLE: "${input.paperTitle}"

ABSTRACT: ${input.paperAbstract.slice(0, 800)}

${reviewsText}

Provide a synthesis with:
1. A brief summary paragraph (2-3 sentences) of overall sentiment
2. Key strengths (3-5 bullet points extracted from reviews)
3. Key weaknesses (3-5 bullet points extracted from reviews)  
4. Final recommendation: ACCEPT, REJECT, or MAJOR_REVISION
5. Confidence score (0.0-1.0) in your recommendation

Respond ONLY with valid JSON in this exact format:
{"summary":"brief paragraph","strengths":["strength 1","strength 2","strength 3"],"weaknesses":["weakness 1","weakness 2","weakness 3"],"recommendation":"ACCEPT","confidence":0.85}`;
}

/**
 * Normalize result to ensure it has all required fields
 */
function normalizeResult(parsed: any): ReviewSynthesisResult {
  // Handle case where parsed is already the synthesis object
  if (parsed.summary && parsed.recommendation) {
    return {
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
      recommendation: ['ACCEPT', 'REJECT', 'MAJOR_REVISION'].includes(parsed.recommendation) 
        ? parsed.recommendation 
        : 'MAJOR_REVISION',
      confidence: typeof parsed.confidence === 'number' 
        ? Math.min(1, Math.max(0, parsed.confidence)) 
        : 0.7,
    };
  }
  
  // Handle case where result is embedded
  if (parsed.result && typeof parsed.result === 'object') {
    return normalizeResult(parsed.result);
  }
  
  // Default fallback
  return {
    summary: 'Synthesis completed but format was unexpected',
    strengths: [],
    weaknesses: [],
    recommendation: 'MAJOR_REVISION',
    confidence: 0.5,
  };
}

/**
 * Local fallback synthesis when TinyFish is unavailable
 */
function localSynthesis(input: ReviewSynthesisInput): ReviewSynthesisResult {
  const { reviews } = input;
  
  const attitudeCounts = reviews.reduce((acc, r) => {
    acc[r.attitude] = (acc[r.attitude] || 0) + 1;
    return acc;
  }, {} as Record<ReviewAttitudeType, number>);

  const positiveCount = attitudeCounts.POSITIVE || 0;
  const negativeCount = attitudeCounts.NEGATIVE || 0;
  const neutralCount = attitudeCounts.NEUTRAL || 0;
  const total = reviews.length;

  let recommendation: 'ACCEPT' | 'REJECT' | 'MAJOR_REVISION';
  let confidence: number;

  if (positiveCount / total > 0.6) {
    recommendation = 'ACCEPT';
    confidence = positiveCount / total;
  } else if (negativeCount / total > 0.5) {
    recommendation = 'REJECT';
    confidence = negativeCount / total;
  } else {
    recommendation = 'MAJOR_REVISION';
    confidence = 0.5 + Math.abs(positiveCount - negativeCount) / (2 * total);
  }

  // Extract actual quotes from reviews
  const allText = reviews.map(r => r.text).join(' ');
  
  const strengthMatches = allText.match(/(?:strengths?:?)\s*[-:]?\s*([^\n.]+)/gi) || [];
  const weaknessMatches = allText.match(/(?:weaknesses?:?)\s*[-:]?\s*([^\n.]+)/gi) || [];

  const strengths = strengthMatches
    .slice(0, 3)
    .map(s => s.replace(/strengths?:?\s*[-:]?\s*/i, '').trim().slice(0, 150))
    .filter(s => s.length > 10);

  const weaknesses = weaknessMatches
    .slice(0, 3)
    .map(s => s.replace(/weaknesses?:?\s*[-:]?\s*/i, '').trim().slice(0, 150))
    .filter(s => s.length > 10);

  const summary = `Based on ${total} council reviews (${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} negative), this paper shows ${recommendation === 'ACCEPT' ? 'strong merit for acceptance' : recommendation === 'REJECT' ? 'significant concerns requiring major revision' : 'mixed reception requiring revision'}.`;

  return {
    summary,
    strengths: strengths.length > 0 ? strengths : ['Novel approach noted', 'Strong technical foundation', 'Well-structured presentation'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Areas for improvement identified', 'Some concerns raised', 'Additional validation suggested'],
    recommendation,
    confidence: Math.min(1, Math.max(0, confidence)),
  };
}

/**
 * Extract citations using TinyFish to search Google Scholar
 */
export async function extractCitations(
  paperTitle: string,
  paperDoi?: string
): Promise<{
  citations: Array<{ title: string; authors: string[]; year: number; venue?: string }>;
  citationCount: number;
}> {
  if (!TINYFISH_API_KEY) {
    return { citations: [], citationCount: 0 };
  }

  try {
    const searchUrl = paperDoi 
      ? `https://scholar.google.com/scholar?q=${encodeURIComponent(paperDoi)}`
      : `https://scholar.google.com/scholar?q=${encodeURIComponent(paperTitle)}`;

    console.log('[TinyFish] Searching citations...');
    
    const response = await fetch(`${TINYFISH_BASE_URL}/automation/run-sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url: searchUrl,
        goal: `Find the citation count for "${paperTitle}" and extract up to 5 papers that cite it. Return JSON: {"citationCount": number, "citations": [{"title": "...", "authors": ["..."], "year": 2024, "venue": "..."}]}`,
        proxy_config: { enabled: false },
      }),
    });

    if (!response.ok) {
      return { citations: [], citationCount: 0 };
    }

    const reader = response.body?.getReader();
    if (!reader) return { citations: [], citationCount: 0 };
    
    const decoder = new TextDecoder();
    let buffer = '';
    let completeResult: any = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const result = parseSSELine(line.trim());
        if (result?.type === 'COMPLETE') {
          completeResult = result;
        }
      }
    }
    
    if (buffer.trim()) {
      const result = parseSSELine(buffer.trim());
      if (result?.type === 'COMPLETE') {
        completeResult = result;
      }
    }
    
    if (completeResult?.result) {
      const citations = completeResult.result;
      return {
        citations: citations.citations || [],
        citationCount: citations.citationCount || 0,
      };
    }
    
    return { citations: [], citationCount: 0 };
    
  } catch (error) {
    console.error('[TinyFish] Citation extraction failed:', error);
    return { citations: [], citationCount: 0 };
  }
}

export default {
  synthesizeReviews,
  extractCitations,
};
