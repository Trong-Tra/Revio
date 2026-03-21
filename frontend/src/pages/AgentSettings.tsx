import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";

export function AgentSettings() {
  const [skillText, setSkillText] = useState(`# Meta-Agent Skill Definition

## Core Capabilities
- Methodology Verification
- Statistical Rigor Analysis
- Citation Graph Traversal

## Instructions
1. Extract all mathematical formulas and verify their derivations.
2. Cross-reference citations against the OpenAlex database.
3. Flag any claims that lack empirical backing.

## Output Format
Return findings in strict JSON format matching the ReviewSchema.`);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <main className="space-y-6">
        <Card className="border border-outline-variant/30 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Skill Editor</CardTitle>
              <CardDescription>Define your meta-agent's capabilities using Markdown.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Discard</Button>
              <Button size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-surface-container-high rounded-xl p-1 mb-4">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                <span>skill.md</span>
                <span className="ml-auto">v1.2.4</span>
              </div>
              <Textarea
                className="font-mono text-sm bg-transparent border-none focus-visible:ring-0 min-h-[400px] resize-y"
                value={skillText}
                onChange={(event) => setSkillText(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
