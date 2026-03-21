/**
 * Conference Discovery Service
 * 
 * Uses TinyFish AI to extract conference information from URLs.
 * Discovers new conferences and adds them to the database,
 * or falls back to "Independent Research" category.
 */

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || '';
const TINYFISH_BASE_URL = 'https://agent.tinyfish.ai/v1';

export interface ConferenceExtractionResult {
  found: boolean;
  name?: string;
  acronym?: string;
  website?: string;
  publisher?: string;
  location?: string;
  dates?: string;
  tier?: 'ELITE' | 'PREMIUM' | 'STANDARD' | 'ENTRY';
  requiredSkills?: string[];
  description?: string;
}

/**
 * Extract conference information from a website URL using TinyFish
 */
export async function extractConferenceInfo(
  url: string
): Promise<ConferenceExtractionResult> {
  if (!TINYFISH_API_KEY) {
    console.log('[TinyFish] No API key, conference extraction disabled');
    return { found: false };
  }

  try {
    console.log(`[TinyFish] Extracting conference info from: ${url}`);

    const response = await fetch(`${TINYFISH_BASE_URL}/automation/run-sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url,
        goal: `Extract academic conference information from this website. Return JSON with: found (boolean), name (full conference name), acronym (short code like "NeurIPS", "ICML"), publisher (IEEE, ACM, etc.), location (city, country), dates (when it happens), tier (ELITE for top-tier, PREMIUM for well-known, STANDARD for regional, ENTRY for new/small), requiredSkills (array of research fields like ["machine-learning", "computer-vision"]), description (brief summary). If this is not a conference website, return {"found": false}.`,
        proxy_config: { enabled: false },
      }),
    });

    if (!response.ok) {
      console.error(`[TinyFish] API error: ${response.status}`);
      return { found: false };
    }

    // Read SSE stream
    const reader = response.body?.getReader();
    if (!reader) return { found: false };

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
      return parseConferenceResult(completeResult.result);
    }

    return { found: false };

  } catch (error) {
    console.error('[TinyFish] Conference extraction failed:', error);
    return { found: false };
  }
}

/**
 * Parse conference data from TinyFish response
 */
function parseConferenceResult(result: any): ConferenceExtractionResult {
  // Try to extract JSON if result is a string
  let data = result;
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { found: false };
    }
  }

  if (!data.found) {
    return { found: false };
  }

  // Validate and normalize tier
  const validTiers = ['ELITE', 'PREMIUM', 'STANDARD', 'ENTRY'];
  const tier = validTiers.includes(data.tier?.toUpperCase()) 
    ? data.tier.toUpperCase() 
    : 'STANDARD';

  return {
    found: true,
    name: data.name,
    acronym: data.acronym,
    website: data.website,
    publisher: data.publisher,
    location: data.location,
    dates: data.dates,
    tier: tier as any,
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
    description: data.description,
  };
}

function parseSSELine(line: string): any | null {
  if (!line.startsWith('data:')) return null;
  const data = line.slice(5).trim();
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Create or update conference in database based on extraction result
 */
export async function upsertConferenceFromExtraction(
  prisma: any,
  url: string,
  extraction: ConferenceExtractionResult
) {
  if (!extraction.found) {
    // Return the "Independent" conference (create if doesn't exist)
    const independentConf = await prisma.conference.upsert({
      where: { id: 'conf-independent' },
      create: {
        id: 'conf-independent',
        name: 'Independent Submission',
        acronym: 'IND',
        tier: 'ENTRY',
        requiredSkills: [],
        description: 'Papers submitted without affiliation to a specific conference. Reviewed by the Revio community.',
      },
      update: {},
    });
    return independentConf;
  }

  // Generate ID from acronym or name
  const confId = extraction.acronym 
    ? `conf-${extraction.acronym.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    : `conf-${Date.now()}`;

  const conference = await prisma.conference.upsert({
    where: { id: confId },
    create: {
      id: confId,
      name: extraction.name || 'Unknown Conference',
      acronym: extraction.acronym,
      website: extraction.website || url,
      publisher: extraction.publisher,
      tier: extraction.tier || 'STANDARD',
      requiredSkills: extraction.requiredSkills || [],
      description: extraction.description,
    },
    update: {
      // Update with new info if conference already exists
      ...(extraction.name && { name: extraction.name }),
      ...(extraction.publisher && { publisher: extraction.publisher }),
      ...(extraction.tier && { tier: extraction.tier }),
      ...(extraction.description && { description: extraction.description }),
    },
  });

  return conference;
}

export default {
  extractConferenceInfo,
  upsertConferenceFromExtraction,
};
