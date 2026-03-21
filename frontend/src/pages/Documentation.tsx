import { Book, Code, Terminal, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export function Documentation() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h2 className="font-label font-bold text-lg mb-4 px-4">Getting Started</h2>
            <nav className="flex flex-col gap-1">
              <a href="#introduction" className="px-4 py-2 rounded-xl text-sm font-medium text-primary bg-primary/10 transition-colors">Introduction</a>
              <a href="#quickstart" className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">Quickstart Guide</a>
              <a href="#architecture" className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">Architecture</a>
            </nav>
          </div>
          <div>
            <h2 className="font-label font-bold text-lg mb-4 px-4">Meta-Agents</h2>
            <nav className="flex flex-col gap-1">
              <a href="#creating-agents" className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">Creating Agents</a>
              <a href="#skill-md" className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">The skill.md Format</a>
              <a href="#api-reference" className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">API Reference</a>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-12">
        <section id="introduction" className="space-y-6">
          <header>
            <Badge variant="provenance" className="mb-4">v2.0.0</Badge>
            <h1 className="text-4xl font-label font-bold text-on-surface mb-4">Introduction to The Digital Atelier</h1>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              The Digital Atelier is a decentralized, AI-assisted platform for academic research and peer review. 
              It leverages machine-readable meta-agents to automate the initial verification of methodologies, 
              citations, and statistical rigor, allowing human reviewers to focus on novelty and impact.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border border-outline-variant/30 hover:shadow-ambient transition-shadow">
              <CardHeader>
                <Terminal className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-xl">For Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant mb-4">
                  Build and deploy custom meta-agents using our SDK. Define capabilities in Markdown and execute via API.
                </p>
                <a href="#api-reference" className="text-sm font-medium text-primary hover:underline flex items-center">
                  View API Docs <Zap className="w-4 h-4 ml-1" />
                </a>
              </CardContent>
            </Card>
            <Card className="border border-outline-variant/30 hover:shadow-ambient transition-shadow">
              <CardHeader>
                <Book className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-xl">For Researchers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-on-surface-variant mb-4">
                  Upload papers, receive instant quantitative feedback, and participate in a verifiable peer review community.
                </p>
                <a href="#quickstart" className="text-sm font-medium text-primary hover:underline flex items-center">
                  Read Quickstart <Zap className="w-4 h-4 ml-1" />
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="skill-md" className="space-y-6 pt-12 border-t border-outline-variant/30">
          <h2 className="text-3xl font-label font-bold text-on-surface mb-4">The skill.md Format</h2>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            Meta-agents are configured using a specialized Markdown format called <code>skill.md</code>. 
            This allows for human-readable definitions that are parsed into executable instructions by the engine.
          </p>

          <div className="bg-on-surface text-surface-container-lowest rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high/10 border-b border-outline-variant/20 text-xs font-mono text-outline-variant">
              <Code className="w-4 h-4" />
              <span>example-skill.md</span>
            </div>
            <div className="p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-surface-container-low">
{`# Agent: Methodology Verifier
version: 1.0.0
author: Dr. Smith

## Core Capabilities
- Extract mathematical formulas
- Cross-reference citations
- Verify dataset availability

## Execution Flow
1. Parse PDF into structured JSON.
2. For each formula in section "Methodology":
   a. Verify derivation using SymPy plugin.
3. Check all DOIs against Crossref API.

## Output Schema
\`\`\`json
{
  "status": "verified|failed",
  "confidence": "float",
  "findings": ["string"]
}
\`\`\``}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
