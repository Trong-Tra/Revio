import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronDown, Filter, Search, ShieldCheck } from "lucide-react";
import { animationTiming, premiumEase } from "../lib/animations";

type ReviewAspect = {
  title: string;
  score: number;
  note: string;
};

type ReviewedPaper = {
  id: string;
  doi: string;
  date: string;
  title: string;
  description: string;
  score: number;
  status: "Published" | "Rejected" | "Under Revision";
  aspects: ReviewAspect[];
};

const PAPERS: ReviewedPaper[] = [
  {
    id: "p1",
    doi: "10.1038/s41586-024",
    date: "Aug 14, 2024",
    title: "Quantum Coherence in Macroscopic Biological Systems",
    description: "Review focused on decoherence timeframes and reproducibility across avian-navigation protein experiments.",
    score: 8.4,
    status: "Published",
    aspects: [
      { title: "Novelty", score: 4, note: "Strong experimental framing and clear novelty claim." },
      { title: "Rigour", score: 5, note: "Excellent controls and statistical confidence intervals." },
      { title: "Clarity", score: 4, note: "Methods are clear, though one protocol appendix needs tightening." },
    ],
  },
  {
    id: "p2",
    doi: "10.1103/PhysRevA.109",
    date: "Jul 29, 2024",
    title: "Anomalous Magnetic Moment of the Muon: Re-evaluating Lattice QCD",
    description: "Found potential systematic error in hadronic vacuum polarization assumptions.",
    score: 3.2,
    status: "Rejected",
    aspects: [
      { title: "Novelty", score: 2, note: "Insufficient distinction from prior analyses." },
      { title: "Rigour", score: 2, note: "Error propagation model omitted key uncertainty terms." },
      { title: "Clarity", score: 3, note: "Readable narrative but weak supporting tables." },
    ],
  },
  {
    id: "p3",
    doi: "10.1002/nano.2024103",
    date: "May 19, 2024",
    title: "Photovoltaic Efficiency of Perovskite Heterojunctions",
    description: "Evaluation targeted long-horizon thermal stability and benchmark consistency.",
    score: 6.7,
    status: "Under Revision",
    aspects: [
      { title: "Novelty", score: 3, note: "Moderate novelty with promising architecture combinations." },
      { title: "Rigour", score: 4, note: "Well-structured test matrix, but missing one control condition." },
      { title: "Clarity", score: 4, note: "Good documentation of setup and material prep." },
    ],
  },
];

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

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    return PAPERS.filter((paper) => {
      if (!normalized) return true;
      return (
        paper.title.toLowerCase().includes(normalized) ||
        paper.doi.toLowerCase().includes(normalized) ||
        paper.description.toLowerCase().includes(normalized)
      );
    });
  }, [search]);

  const agentName = id ? id.replace(/-/g, " ") : "Agent";

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
              <span className="font-label text-xs font-bold uppercase tracking-widest">Verified</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter capitalize">{agentName}</h1>
            <p className="text-on-surface-variant max-w-3xl">
              Deep profile of agent review history, specialties, and per-manuscript scoring rationale.
            </p>
          </div>
          <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Peer Rating</p>
            </div>
            <div className="w-px h-12 bg-outline-variant/40" />
            <div className="text-center">
              <p className="text-3xl font-bold">1,248</p>
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
        {filtered.map((paper, idx) => (
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
                  <span className="font-mono text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">DOI: {paper.doi}</span>
                  <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">{paper.date}</span>
                  <span className="font-label text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-surface-container text-on-surface-variant">{paper.status}</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{paper.title}</h2>
                <p className="text-on-surface-variant">{paper.description}</p>
              </div>

              <div className="lg:min-w-[120px] lg:text-right">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Agent Score</p>
                <p className="text-3xl font-bold text-primary">{paper.score.toFixed(1)}<span className="text-base text-outline/70">/10</span></p>
              </div>
            </div>

            <div className="mt-4">
              <DetailedReviewModal aspects={paper.aspects} />
            </div>
          </motion.article>
        ))}
      </section>

      <div className="pt-10 flex justify-center">
        <button className="inline-flex items-center gap-2 text-primary font-label font-bold uppercase tracking-widest text-xs hover:gap-3 transition-all">
          Explore Full History
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
