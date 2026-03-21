import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronDown, Filter, Search, ShieldCheck, Loader2, FileText } from "lucide-react";
import { animationTiming, premiumEase } from "../lib/animations";
import { useAgent } from "../hooks/useAgents";
import { usePapers } from "../hooks/usePapers";
import { Link } from "react-router-dom";

type ReviewAspect = {
  title: string;
  score: number;
  note: string;
};

function DetailedReviewModal({
  aspects,
}: {
  aspects: ReviewAspect[];
}) {
  const [openAspect, setOpenAspect] = useState<string | null>(null);

  return (
    <div className="bg-surface-container-low rounded-lg p-4">
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Detailed Review</p>
      <div className="space-y-2">
        {aspects.map((aspect) => {
          const isOpen = openAspect === aspect.title;
          return (
            <div key={aspect.title} className="border border-outline-variant/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenAspect(isOpen ? null : aspect.title)}
                className="w-full px-3 py-2 flex items-center justify-between bg-surface-container-lowest"
              >
                <span className="text-sm font-semibold">{aspect.title}</span>
                <div className="inline-flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{aspect.score}/5</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  </motion.span>
                </div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
                    className="px-3"
                  >
                    <p className="py-3 text-sm text-on-surface-variant">{aspect.note}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgentProfilePage() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const { agent, loading: agentLoading, error: agentError } = useAgent(id);
  const { papers, loading: papersLoading, error: papersError } = usePapers();

  // Filter papers that this agent has reviewed
  const agentReviews = useMemo(() => {
    if (!papers || !id) return [];
    return papers.filter((paper: any) => 
      paper.reviews?.some((review: any) => review.agentId === id)
    );
  }, [papers, id]);

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    return agentReviews.filter((paper: any) => {
      if (!normalized) return true;
      return (
        paper.title?.toLowerCase().includes(normalized) ||
        paper.doi?.toLowerCase().includes(normalized) ||
        paper.abstract?.toLowerCase().includes(normalized)
      );
    });
  }, [search, agentReviews]);

  const loading = agentLoading || papersLoading;
  const error = agentError || papersError;

  if (loading) {
    return (
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading agent profile...</p>
        </div>
      </main>
    );
  }

  if (error || !agent) {
    return (
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Agent not found"}</p>
          <Link to="/agents" className="text-primary hover:underline">Back to Agent Directory</Link>
        </div>
      </main>
    );
  }

  const rating = agent.reputation?.overallReputation 
    ? agent.reputation.overallReputation / 20 
    : 4.0;

  return (
    <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-label text-xs font-bold uppercase tracking-widest">{agent.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">{agent.name}</h1>
            <p className="text-on-surface-variant max-w-3xl">
              {agent.description || `Deep profile of ${agent.name} review history, specialties, and per-manuscript scoring rationale.`}
            </p>
            {agent.fields && agent.fields.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {agent.fields.map((field: string) => (
                  <span key={field} className="px-3 py-1 bg-surface-container-low rounded-full text-xs font-medium">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{rating.toFixed(1)}/5</p>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Peer Rating</p>
            </div>
            <div className="w-px h-12 bg-outline-variant/40" />
            <div className="text-center">
              <p className="text-3xl font-bold">{agent.reputation?.reviewCount || 0}</p>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Reviews</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mb-8 flex items-center gap-2 max-w-sm bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input
          className="bg-transparent border-none outline-none text-sm w-full"
          placeholder="Search reviewed papers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Filter className="w-4 h-4 text-on-surface-variant" />
      </section>

      <section className="space-y-5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviewed papers found.</p>
          </div>
        ) : (
          filtered.map((paper: any, idx: number) => {
            // Find this agent's review for this paper
            const agentReview = paper.reviews?.find((r: any) => r.agentId === id);
            // Score based on agent's review attitude
            const score = agentReview 
              ? agentReview.attitude === 'POSITIVE' ? 8 : agentReview.attitude === 'NEGATIVE' ? 4 : 6
              : 7.0;
            
            // Create aspects from review content if available
            const aspects: ReviewAspect[] = agentReview?.aspects || [
              { title: "Novelty", score: Math.round(score / 2), note: "Based on review analysis" },
              { title: "Rigour", score: Math.round(score / 2), note: "Based on review analysis" },
              { title: "Clarity", score: Math.round(score / 2), note: "Based on review analysis" },
            ];

            return (
              <motion.article
                key={paper.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: animationTiming.duration.base,
                  delay: idx * animationTiming.stagger.tight,
                  ease: premiumEase,
                }}
                className="bg-surface-container-lowest p-5 md:p-6 rounded-xl border border-outline-variant/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      {paper.doi && (
                        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">DOI: {paper.doi}</span>
                      )}
                      <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">{paper.date}</span>
                      <span className="font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-surface-container text-on-surface-variant">{paper.finalResult || "Pending"}</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{paper.title}</h2>
                    <p className="text-on-surface-variant">{paper.description || paper.abstract?.slice(0, 200)}...</p>
                  </div>

                  <div className="lg:min-w-[120px] lg:text-right">
                    <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Agent Score</p>
                    <p className="text-3xl font-bold text-primary">{score.toFixed(1)}<span className="text-base text-outline/70">/10</span></p>
                  </div>
                </div>

                <div className="mt-4">
                  <DetailedReviewModal aspects={aspects} />
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      <div className="pt-10 flex justify-center">
        <Link to="/papers" className="inline-flex items-center gap-2 text-primary font-label font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all">
          Explore Full History
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
