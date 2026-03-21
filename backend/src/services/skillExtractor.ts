/**
 * Skill Extraction Service
 * 
 * Extracts technical skills from paper content using:
 * 1. Keyword matching against skill taxonomy
 * 2. NLP-based entity extraction
 * 3. Confidence scoring
 */

// Skill taxonomy - hierarchical organization
export const SKILL_TAXONOMY: Record<string, string[]> = {
  'computer-science': [
    'blockchain',
    'distributed-systems',
    'machine-learning',
    'cryptography',
    'networking',
    'databases',
  ],
  'blockchain': [
    'consensus-mechanisms',
    'smart-contracts',
    'zero-knowledge-proofs',
    'byzantine-fault-tolerance',
    'distributed-ledger',
    'cryptocurrency',
    'ethereum',
    'hyperledger',
  ],
  'consensus-mechanisms': [
    'proof-of-work',
    'proof-of-stake',
    'proof-of-authority',
    'proof-of-merit',
    'delegated-proof-of-stake',
    'practical-byzantine-fault-tolerance',
  ],
  'distributed-systems': [
    'p2p-networks',
    'distributed-consensus',
    'sharding',
    'replication',
    'fault-tolerance',
  ],
  'machine-learning': [
    'deep-learning',
    'transformers',
    'reinforcement-learning',
    'federated-learning',
    'neural-networks',
  ],
  'cryptography': [
    'zero-knowledge-proofs',
    'homomorphic-encryption',
    'digital-signatures',
    'public-key-cryptography',
    'elliptic-curve-cryptography',
    'zk-snarks',
    'zk-starks',
  ],
  'identity': [
    'decentralized-identity',
    'digital-identity',
    'self-sovereign-identity',
    'verifiable-credentials',
  ],
  'formal-methods': [
    'formal-verification',
    'model-checking',
    'theorem-proving',
    'static-analysis',
  ],
};

// Keyword mappings for extraction
const KEYWORD_MAPPINGS: Record<string, string> = {
  // Blockchain
  'blockchain': 'blockchain',
  'distributed ledger': 'distributed-ledger',
  'distributed ledger technology': 'distributed-ledger',
  'dlt': 'distributed-ledger',
  
  // Consensus
  'consensus': 'consensus-mechanisms',
  'consensus mechanism': 'consensus-mechanisms',
  'proof of work': 'proof-of-work',
  'pow': 'proof-of-work',
  'proof of stake': 'proof-of-stake',
  'pos': 'proof-of-stake',
  'proof of authority': 'proof-of-authority',
  'poa': 'proof-of-authority',
  'byzantine': 'byzantine-fault-tolerance',
  'bft': 'byzantine-fault-tolerance',
  'pbft': 'practical-byzantine-fault-tolerance',
  'proof of merit': 'proof-of-merit',
  'pom': 'proof-of-merit',
  
  // Cryptography
  'zero knowledge': 'zero-knowledge-proofs',
  'zero-knowledge': 'zero-knowledge-proofs',
  'zkp': 'zero-knowledge-proofs',
  'zk-snark': 'zk-snarks',
  'zk-stark': 'zk-starks',
  'zk proof': 'zero-knowledge-proofs',
  'cryptographic': 'cryptography',
  
  // Smart Contracts
  'smart contract': 'smart-contracts',
  'solidity': 'smart-contracts',
  'ethereum': 'ethereum',
  'hyperledger': 'hyperledger',
  'besu': 'hyperledger',
  
  // Identity
  'decentralized identity': 'decentralized-identity',
  'did': 'decentralized-identity',
  'digital identity': 'digital-identity',
  'self sovereign': 'self-sovereign-identity',
  'verifiable credential': 'verifiable-credentials',
  
  // Distributed Systems
  'p2p': 'p2p-networks',
  'peer to peer': 'p2p-networks',
  'distributed system': 'distributed-systems',
  'fault tolerance': 'fault-tolerance',
  'sharding': 'sharding',
  'replication': 'replication',
  
  // Formal Methods
  'formal verification': 'formal-verification',
  'formal method': 'formal-methods',
  'model checking': 'model-checking',
  'theorem proving': 'theorem-proving',
};

interface ExtractedSkills {
  skills: string[];
  confidence: number;
  matchedKeywords: Array<{ keyword: string; skill: string }>;
}

/**
 * Extract skills from paper content
 */
export function extractSkills(
  title: string,
  abstract: string,
  keywords: string[]
): ExtractedSkills {
  const allText = `${title} ${abstract} ${keywords.join(' ')}`.toLowerCase();
  const matchedKeywords: Array<{ keyword: string; skill: string }> = [];
  const extractedSkills = new Set<string>();
  
  // Keyword matching
  for (const [keyword, skill] of Object.entries(KEYWORD_MAPPINGS)) {
    if (allText.includes(keyword.toLowerCase())) {
      extractedSkills.add(skill);
      matchedKeywords.push({ keyword, skill });
    }
  }
  
  // Additional heuristics for confidence
  let confidence = calculateConfidence(
    Array.from(extractedSkills),
    matchedKeywords.length,
    title,
    abstract
  );
  
  return {
    skills: Array.from(extractedSkills),
    confidence,
    matchedKeywords,
  };
}

/**
 * Calculate confidence in skill extraction
 */
function calculateConfidence(
  skills: string[],
  matchCount: number,
  title: string,
  abstract: string
): number {
  let confidence = 0.5; // Base confidence
  
  // More matches = higher confidence
  confidence += Math.min(matchCount * 0.05, 0.2);
  
  // Title mention is strong signal
  const titleLower = title.toLowerCase();
  const titleMatches = skills.filter(skill => 
    titleLower.includes(skill.replace(/-/g, ' '))
  ).length;
  confidence += titleMatches * 0.1;
  
  // Abstract length affects confidence
  if (abstract.length > 500) confidence += 0.1;
  
  // Cap at 0.95
  return Math.min(confidence, 0.95);
}

/**
 * Get parent skills (broader categories)
 */
export function getParentSkills(skill: string): string[] {
  const parents: string[] = [];
  
  for (const [parent, children] of Object.entries(SKILL_TAXONOMY)) {
    if (children.includes(skill)) {
      parents.push(parent);
      // Recursively get grandparents
      parents.push(...getParentSkills(parent));
    }
  }
  
  return parents;
}

/**
 * Get all related skills (children + siblings)
 */
export function getRelatedSkills(skill: string): string[] {
  const related: string[] = [];
  
  // Find skill in taxonomy
  for (const [parent, children] of Object.entries(SKILL_TAXONOMY)) {
    if (children.includes(skill)) {
      // Add siblings
      related.push(...children.filter(c => c !== skill));
    }
    if (parent === skill) {
      // Add children
      related.push(...children);
    }
  }
  
  return related;
}

/**
 * Normalize skill name
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Validate if a skill exists in taxonomy
 */
export function isValidSkill(skill: string): boolean {
  const normalized = normalizeSkill(skill);
  
  // Check if it's a category
  if (normalized in SKILL_TAXONOMY) return true;
  
  // Check if it's in any category
  for (const children of Object.values(SKILL_TAXONOMY)) {
    if (children.includes(normalized)) return true;
  }
  
  return false;
}

/**
 * Suggest skills based on partial input
 */
export function suggestSkills(partial: string): string[] {
  const normalized = partial.toLowerCase();
  const suggestions: string[] = [];
  
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    if (category.includes(normalized)) {
      suggestions.push(category);
    }
    for (const skill of skills) {
      if (skill.includes(normalized)) {
        suggestions.push(skill);
      }
    }
  }
  
  return [...new Set(suggestions)].slice(0, 10);
}
