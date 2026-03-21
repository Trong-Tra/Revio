import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, CheckCircle2, Bot, Users, FileText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Link } from "react-router-dom";
import { animationTiming, premiumEase } from "../lib/animations";

const mockPapers = [
  {
    id: "1",
    title: "Latent Space Alignment in Large Multimodal Systems",
    authors: "A. Chen, J. Doe, et al.",
    conferenceId: "neurips-2024",
    conferenceName: "NeurIPS 2024",
    abstract:
      "Exploring the convergence of latent representations between vision and language models using contrastive manifold alignment, with an emphasis on robust transfer and interpretability.",
    rating: 4.8,
    decision: "Accepted",
  },
  {
    id: "2",
    title: "Algorithmic Transparency in Decentralized Governance",
    authors: "Dr. Sarah K. Weber",
    conferenceId: "icml-2024",
    conferenceName: "ICML 2024",
    abstract:
      "An investigation into collective decision-making in DAOs and the impact of automated voting protocols on minority participation and governance outcomes.",
    rating: 4.2,
    decision: "Unaccepted",
  },
  {
    id: "3",
    title: "Low-Latency Inference in Heterogeneous Edge Clusters",
    authors: "L. Zhang, M. Saito",
    conferenceId: "cvpr-2024",
    conferenceName: "CVPR 2024",
    abstract:
      "Presenting a scheduling strategy for model parallelization across constrained IoT devices while maintaining inference quality under strict latency budgets.",
    rating: 4.0,
    decision: "Accepted",
  },
];

export function PaperDetail() {
  const { id } = useParams();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [openAspect, setOpenAspect] = useState<string | null>(null);
  const paper = mockPapers.find((item) => item.id === id);
  const ratingProgress = paper ? (paper.rating / 5) * 100 : 0;

  const reviewAspects = [
    {
      key: "novelty-originality",
      label: "Novelty and Originality",
      score: "4/5",
      detail: "The manuscript introduces a relevant framing with clear differentiation from common baselines.",
    },
    {
      key: "technical-rigour",
      label: "Technical Content and Scientific Rigour",
      score: "5/5",
      detail: "Methods are well specified and reproducible, with robust controls and consistent statistical analysis.",
    },
    {
      key: "presentation",
      label: "Quality of Presentation",
      score: "4/5",
      detail: "Writing is mostly clear and organized, with only minor improvements needed in figure annotation.",
    },
    {
      key: "relevance-timeliness",
      label: "Relevance and Timeliness",
      score: "5/5",
      detail: "The topic is highly relevant and aligns well with current research priorities and open problems.",
    },
    {
      key: "strong-aspect",
      label: "Strong Aspect",
      score: "5/5",
      detail: "Excellent experimental discipline and clear articulation of practical implications.",
    },
    {
      key: "weak-aspect",
      label: "Weak Aspect",
      score: "3/5",
      detail: "Comparisons against one additional strong baseline would strengthen confidence in generalization.",
    },
  ];

  if (!paper) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discoveries
        </Link>
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Paper Not Found</CardTitle>
            <CardDescription>No paper is mapped for id: {id}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
              <Link to={`/conferences/${paper.conferenceId}`}>
                <Badge variant="outline" className="hover:border-primary hover:text-primary transition-colors">
                  Conference: {paper.conferenceName}
                </Badge>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-label font-bold text-on-surface mb-4 leading-tight">
              {paper.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {paper.authors}
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
            <CardContent className="max-h-40 overflow-y-auto">
              <p className="text-on-surface-variant leading-relaxed">{paper.abstract}</p>
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
                  <Badge variant="secondary">Reviewer</Badge>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                  The methodology is sound, but the conclusion regarding emergent properties needs more empirical backing...
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsReviewModalOpen(true)}>
                  Read Full Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <motion.div
          className="space-y-6"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: animationTiming.duration.slow, delay: 0.3, ease: premiumEase }}
        >
          <Card className="border-t-4 border-t-primary border-outline-variant/30 shadow-ambient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Rating
              </CardTitle>
              <CardDescription>Peer-review rubric summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-label font-bold text-primary mb-4">{paper.rating.toFixed(1)}/5</div>
              <div className="w-full bg-surface-container-high rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-primary to-primary-container h-2 rounded-full" style={{ width: `${ratingProgress}%` }}></div>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-4">
                <li className="flex justify-between"><span>Novelty and Originality</span> <span className="font-medium text-on-surface">4/5</span></li>
                <li className="flex justify-between"><span>Technical Content and Scientific Rigour</span> <span className="font-medium text-on-surface">5/5</span></li>
                <li className="flex justify-between"><span>Quality of Presentation</span> <span className="font-medium text-on-surface">4/5</span></li>
                <li className="flex justify-between"><span>Relevance and Timeliness</span> <span className="font-medium text-on-surface">5/5</span></li>
              </ul>
              <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-3 flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Decision</span>
                <span className={`text-sm font-semibold ${paper.decision === "Accepted" ? "text-primary" : "text-amber-700"}`}>
                  {paper.decision}
                </span>
              </div>
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
              <motion.div
                className="bg-on-surface text-surface-container-lowest p-4 rounded-xl font-mono text-xs overflow-x-auto relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white/10 pointer-events-none"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
                />
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
              </motion.div>
            </CardContent>
          </Card>

        </motion.div>
      </div>

      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              className="absolute inset-0 bg-on-surface/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              onClick={() => setIsReviewModalOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-xl bg-surface-container-lowest rounded-xl p-6 shadow-ambient"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-headline font-bold text-on-surface">Detailed Review</h3>
                <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
                  Close
                </Button>
              </div>
              <p className="text-sm text-on-surface-variant mb-5">
                Click an aspect to inspect qualitative feedback.
              </p>

              <div className="space-y-3">
                {reviewAspects.map((aspect) => {
                  const isOpen = openAspect === aspect.key;

                  return (
                    <div key={aspect.key} className="bg-surface-container-low rounded-lg p-3">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => setOpenAspect(isOpen ? null : aspect.key)}
                      >
                        <span className="text-sm font-medium text-on-surface">{aspect.label}</span>
                        <span className="text-xs font-label text-primary">{aspect.score}</span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: premiumEase }}
                            style={{ overflow: "hidden" }}
                          >
                            <p className="text-sm text-on-surface-variant pt-3">{aspect.detail}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
