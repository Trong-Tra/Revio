import { useState } from "react";
import { Settings, Sliders, Activity, Save, Play } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/Badge";
import { premiumEase } from "../lib/animations";

export function AgentSettings() {
  const [activeTab, setActiveTab] = useState("skills");
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
  const [livePulseKey, setLivePulseKey] = useState(0);
  const [activeTone, setActiveTone] = useState("Academic & Objective");

  const toneOptions = ["Academic & Objective", "Constructive & Helpful", "Strict & Rigorous"];

  const handleSkillChange = (value: string) => {
    setSkillText(value);
    setLivePulseKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 space-y-2">
          <h2 className="font-label font-bold text-lg mb-4 px-4">Agent Configuration</h2>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "skills"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Settings className="w-4 h-4" />
              Skill Editor (skill.md)
            </button>
            <button
              onClick={() => setActiveTab("tone")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "tone"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Tone & Behavior
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <Activity className="w-4 h-4" />
              Real-time Preview
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        {activeTab === "skills" && (
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
                  onChange={(event) => handleSkillChange(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "tone" && (
          <Card className="border border-outline-variant/30 shadow-sm">
            <CardHeader>
              <CardTitle>Tone Configuration</CardTitle>
              <CardDescription>Adjust how your agent communicates its findings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-on-surface">Primary Tone</label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <motion.button
                      key={tone}
                      type="button"
                      onClick={() => setActiveTone(tone)}
                      whileTap={{ scale: 0.95 }}
                      animate={activeTone === tone ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2, ease: premiumEase }}
                    >
                      <Badge
                        variant={activeTone === tone ? "default" : "outline"}
                      >
                        <span className="px-4 py-1.5 inline-block">{tone}</span>
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-on-surface">Verbosity Level</label>
                <input type="range" min="1" max="100" defaultValue="50" className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Concise (Bullet points)</span>
                  <span>Detailed (Paragraphs)</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-on-surface">Custom Instructions</label>
                <Textarea placeholder="e.g., Always address the authors respectfully..." />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "preview" && (
          <Card className="border border-outline-variant/30 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Real-time Preview</CardTitle>
                <CardDescription>Test your agent against a sample paper.</CardDescription>
              </div>
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <div className="flex-1">
                  <p className="font-medium text-sm text-on-surface">Sample Paper: Quantum Entanglement.pdf</p>
                  <p className="text-xs text-on-surface-variant">Selected for testing</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <motion.span
                    key={livePulseKey}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                  Live Preview
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>

              <div className="bg-on-surface text-surface-container-lowest p-4 rounded-xl font-mono text-xs overflow-x-auto h-[300px] overflow-y-auto">
                <div className="text-primary-container mb-2">$ agent run --target sample.pdf</div>
                <div className="text-outline-variant mb-1">[INFO] Initializing agent with skill.md v1.2.4...</div>
                <div className="text-outline-variant mb-1">[INFO] Extracting text and formulas...</div>
                <div className="text-outline-variant mb-1">[INFO] Analyzing methodology...</div>
                <div className="text-green-400 mb-1">[SUCCESS] Methodology verified. Confidence: 0.92</div>
                <div className="text-outline-variant mb-1">[INFO] Generating review output...</div>
                <div className="mt-4 text-surface-container-lowest">
                  {`{
  "status": "completed",
  "findings": [
    "The derivation in section 3.2 is mathematically sound.",
    "Citation [14] appears to be misattributed."
  ]
}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
