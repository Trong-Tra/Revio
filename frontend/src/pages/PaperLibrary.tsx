import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type LibraryPaper = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  tag1: string;
  tag2: string;
  date: string;
  conferenceId: string;
  conferenceName: string;
};

const papers: LibraryPaper[] = [
  {
    id: "1",
    title: "Emergent Synergies in Multi-Agent Neural Protocols",
    authors: "Dr. Elena Vos, Prof. Marcus Thorne",
    abstract:
      "A longitudinal study exploring the spontaneous development of high-order communication protocols between autonomous AI agents...",
    tag1: "PEER REVIEWED",
    tag2: "AI CONFIDENCE 98%",
    date: "OCT 2024",
    conferenceId: "neurips-2024",
    conferenceName: "NeurIPS 2024",
  },
  {
    id: "2",
    title: "Latent Space Navigation in High-Dimensional Manifolds",
    authors: "A. J. Singh, Dr. Sarah Jenkins",
    abstract:
      "Presenting a novel algorithm for geodesic-aware traversal through generative latent spaces, reducing topological distortion in large-scale...",
    tag1: "SYSTEMS DESIGN",
    tag2: "OPEN ACCESS",
    date: "SEP 2024",
    conferenceId: "icml-2024",
    conferenceName: "ICML 2024",
  },
  {
    id: "3",
    title: "Bio-Mimetics and the Future of Synaptic Computing",
    authors: "The Synapse Collective",
    abstract:
      "A critical review of neuromorphic hardware efficiency compared to biological synaptic energy consumption in carbon-based neural systems.",
    tag1: "BIO-DIGITAL",
    tag2: "AI AGENT REVIEWED",
    date: "AUG 2024",
    conferenceId: "cvpr-2024",
    conferenceName: "CVPR 2024",
  },
  {
    id: "4",
    title: "Planetary Simulation: Climate Flux Analysis",
    authors: "Dr. Sofia Rossi",
    abstract:
      "Leveraging transformer-based predictive models to simulate 500-year planetary climate cycles with 94% accuracy against historical geological records.",
    tag1: "ENVIRONMENTAL",
    tag2: "AI VERIFIED",
    date: "JUL 2024",
    conferenceId: "rss-2025",
    conferenceName: "RSS 2025",
  },
  {
    id: "5",
    title: "Quantum Decoherence in Relativistic Observers",
    authors: "Prof. Julian Blackwood",
    abstract:
      "An exploration of how quantum entanglement signals are perceived and degraded across high-velocity inertial frames in deep space...",
    tag1: "PHYSICS",
    tag2: "THEORETICAL",
    date: "JUN 2024",
    conferenceId: "siggraph-2024",
    conferenceName: "SIGGRAPH 2024",
  },
  {
    id: "6",
    title: "The Architectics of Ethics in Generative Models",
    authors: "Ethics Board Consortium",
    abstract:
      "Defining a structural framework for embedding ethical non-violation constraints directly into the foundational tensor operations of large language models.",
    tag1: "PHILOSOPHY",
    tag2: "GOVERNANCE",
    date: "MAY 2024",
    conferenceId: "icra-2025",
    conferenceName: "ICRA 2025",
  },
];

export default function PaperLibrary() {
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 selection:text-primary font-sans">
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-6">Research Library</h1>
          <p className="max-w-2xl text-lg text-on-surface-variant leading-relaxed">
            A curated repository of papers published across the Revio platform. Explore ongoing discoveries,
            peer-reviewed breakthroughs, and conference-ready manuscripts.
          </p>
        </header>

        <section className="mb-10 space-y-6">
          <div className="bg-surface-container-high rounded-xl p-2 flex items-center gap-2">
            <Search className="mx-4 text-outline w-5 h-5" />
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-on-surface py-3 outline-none"
              placeholder="Search by title, author, or keyword..."
              type="text"
            />
            <button className="primary-gradient-cta text-on-primary px-8 py-3 rounded-full font-label font-medium text-sm tracking-wide transition-opacity hover:opacity-90 active:scale-95 whitespace-nowrap cursor-pointer">
              Search Library
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-5 py-2 bg-on-surface text-surface rounded-full font-label text-xs uppercase tracking-widest whitespace-nowrap cursor-pointer">
              All Disciplines
            </button>
            <button className="px-5 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-variant rounded-full font-label text-xs uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer">
              Machine Learning
            </button>
            <button className="px-5 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-variant rounded-full font-label text-xs uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer">
              Neural Architectures
            </button>
            <button className="px-5 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-variant rounded-full font-label text-xs uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer">
              Quantum Ethics
            </button>
            <button className="px-5 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-variant rounded-full font-label text-xs uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer">
              Systems Design
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper) => (
            <article
              key={paper.id}
              className="group relative bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(26,28,28,0.06)] ghost-border flex flex-col justify-between min-h-[380px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <Link
                    to={`/conferences/${paper.conferenceId}`}
                    className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                  >
                    {paper.conferenceName}
                  </Link>
                </div>
                <Link to={`/paper/${paper.id}`}>
                  <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors cursor-pointer">
                    {paper.title}
                  </h3>
                </Link>
                <p className="font-label text-sm text-on-surface-variant mb-6 italic">{paper.authors}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8 line-clamp-3">{paper.abstract}</p>
              </div>
              <div className="space-y-6 mt-auto">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-surface-container-low text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant rounded">
                    {paper.tag1}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-[10px] font-label font-bold uppercase tracking-wider text-primary rounded">
                    {paper.tag2}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                  <span className="font-mono text-[10px] text-outline uppercase">Published: {paper.date}</span>
                  <Link
                    to={`/paper/${paper.id}`}
                    className="text-xs font-label font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer"
                  >
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}