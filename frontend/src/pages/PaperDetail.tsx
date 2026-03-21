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
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const paper = mockPapers.find((item) => item.id === id);
  const ratingProgress = paper ? (paper.rating / 5) * 100 : 0;

  const communityReviews = [
    {
      id: "review-1",
      reviewer: "Dr. A. Turing",
      role: "Senior Reviewer",
      summary: "The methodology is sound, but the conclusion regarding emergent properties needs more empirical backing.",
      fullText:
        "The submission introduces a strong methodological baseline and demonstrates careful experimental design. I appreciate the effort to keep the setup reproducible and the discussion grounded in prior work. The central concern is that claims around emergent properties are currently broader than what the presented evidence can conclusively support. Additional ablations and broader evaluation across harder edge-case datasets would make the contribution more convincing. I still view this as a valuable and technically competent paper.",
    },
    {
      id: "review-2",
      reviewer: "Prof. S. Williams",
      role: "Community Reviewer",
      summary: "Well-structured paper with strong rigor, but the presentation can better clarify assumptions and limitations.",
      fullText:
        "Overall, this is a high-quality and clearly motivated study. The technical rigor is strong, and the implementation details should support replication by most readers. My primary recommendation is to strengthen the limitations section and make assumptions explicit earlier in the paper. At present, assumptions are distributed across sections, which can make interpretation harder for a broader audience. Tightening that narrative would improve readability and reduce misinterpretation.",
    },
    {
      id: "review-3",
      reviewer: "R. Patel",
      role: "Reviewer",
      summary: "Promising results and practical relevance; recommends one stronger baseline and more error analysis.",
      fullText:
        "This work targets an important practical problem and presents promising empirical outcomes. I especially value the attempt to discuss deployment implications rather than focusing only on benchmark performance. To improve confidence in the conclusions, I recommend adding at least one stronger baseline and a deeper error analysis section. The current error discussion is directionally useful but brief. With those additions, the impact and persuasiveness of the paper would increase significantly.",
    },
  ];
  const selectedReview = communityReviews.find((review) => review.id === selectedReviewId) ?? null;

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

      <div className="mt-8 space-y-6">
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent className="max-h-44 overflow-y-auto">
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
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory">
              {communityReviews.map((review) => (
                <div
                  key={review.id}
                  className="w-72 h-80 shrink-0 snap-start p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <span className="font-medium text-sm">{review.reviewer}</span>
                    <Badge variant="secondary">{review.role}</Badge>
                  </div>
                  <div className="h-32 overflow-y-auto mb-3">
                    <p className="text-sm text-on-surface-variant leading-relaxed">{review.summary}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs mt-auto"
                    onClick={() => setSelectedReviewId(review.id)}
                  >
                    Read Full Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              className="absolute inset-0 bg-on-surface/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              onClick={() => setSelectedReviewId(null)}
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
                <Button variant="outline" size="sm" onClick={() => setSelectedReviewId(null)}>
                  Close
                </Button>
              </div>

              <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-on-surface">{selectedReview.reviewer}</p>
                  <p className="text-xs text-on-surface-variant">{selectedReview.role}</p>
                </div>
                <div className="max-h-80 overflow-y-auto pr-1">
                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedReview.fullText}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
