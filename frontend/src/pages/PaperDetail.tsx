import { useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, CheckCircle2, Bot, Users, MessageSquare, FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Link } from "react-router-dom";

// Mock data - disconnected from backend
const mockPaper = {
  id: 1,
  title: "Emergent Behaviors in Large Language Models",
  authors: "Dr. Elena Rostova, Prof. James Maxwell, et al.",
  abstract: "Large language models (LLMs) have demonstrated remarkable capabilities across a wide range of tasks. However, the mechanisms underlying their emergent behaviors remain poorly understood. In this paper, we propose a novel framework for analyzing the internal representations of LLMs...",
  doi: "10.1038/s41586-023-00000-0",
  confidence: 98,
};

export function PaperDetail() {
  const { id } = useParams();
  console.log("Paper ID:", id); // Keep for future use

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discoveries
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (PDF Viewer Mockup) */}
        <div className="lg:col-span-2 space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="provenance">Verified by Meta-Agent</Badge>
              <Badge variant="outline">DOI: {mockPaper.doi}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-label font-bold text-on-surface mb-4 leading-tight">
              {mockPaper.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {mockPaper.authors}
            </p>
          </header>

          <div className="bg-surface-container-high rounded-2xl border border-outline-variant/30 h-[600px] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/50 pointer-events-none"></div>
            <FileText className="w-16 h-16 text-outline mb-4 opacity-50" />
            <p className="text-on-surface-variant font-medium mb-6">PDF Viewer Component</p>
            <div className="flex gap-4 relative z-10">
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source
              </Button>
            </div>
          </div>

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-on-surface-variant leading-relaxed">
                {mockPaper.abstract}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary border-outline-variant/30 shadow-ambient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Confidence Score
              </CardTitle>
              <CardDescription>Based on automated methodology checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-label font-bold text-primary mb-4">{mockPaper.confidence}%</div>
              <div className="w-full bg-surface-container-high rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-primary to-primary-container h-2 rounded-full w-[98%]"></div>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex justify-between"><span>Citations Verified</span> <span className="font-medium text-on-surface">142/142</span></li>
                <li className="flex justify-between"><span>Data Availability</span> <span className="font-medium text-on-surface">Public</span></li>
                <li className="flex justify-between"><span>Statistical Rigor</span> <span className="font-medium text-on-surface">High</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-on-surface-variant" />
                Machine Readable Meta-Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-on-surface text-surface-container-lowest p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>
                  {`{
  "agent_id": "review_bot_alpha",
  "version": "1.2.4",
  "findings": [
    {
      "type": "methodology",
      "status": "verified",
      "confidence": 0.99
    },
    {
      "type": "novelty",
      "status": "high",
      "confidence": 0.85
    }
  ]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-on-surface-variant" />
                Peer Review Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">Dr. A. Turing</span>
                  <Badge variant="secondary" className="text-[10px]">Reviewer</Badge>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                  The methodology is sound, but the conclusion regarding emergent properties needs more empirical backing...
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs">Read Full Review</Button>
              </div>
              <Button className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
