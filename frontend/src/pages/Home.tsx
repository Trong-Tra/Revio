import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { premiumEase } from "../lib/animations";

export function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [paperQuery, setPaperQuery] = useState("");

  const sections = useMemo(
    () => [
      { id: "hero", label: "Hero" },
      { id: "agents", label: "Agents" },
      { id: "search", label: "Search" },
    ],
    []
  );

  const papers = useMemo(
    () => [
      {
        id: 1,
        title: "Latent Space Alignment in Large Multimodal Systems",
        description: "Exploring convergence of latent representations between vision and language models.",
        confidence: "98%",
      },
      {
        id: 2,
        title: "Algorithmic Transparency in Decentralized Governance",
        description: "Investigating automated voting protocols and minority participation in DAO governance.",
        confidence: "94%",
      },
      {
        id: 3,
        title: "Low-Latency Inference in Heterogeneous Edge Clusters",
        description: "A scheduling approach for model parallelization across constrained IoT devices.",
        confidence: "91%",
      },
    ],
    []
  );

  const filteredPapers = useMemo(() => {
    const q = paperQuery.trim().toLowerCase();
    if (!q) return papers;
    return papers.filter((paper) => {
      return paper.title.toLowerCase().includes(q) || paper.description.toLowerCase().includes(q);
    });
  }, [paperQuery, papers]);

  const onSectionInView = (id: string) => {
    setActiveSection(id);
  };

  const jumpToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const reveal = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: premiumEase },
    viewport: { amount: 0.5 as const },
  };

  return (
    <div className="h-screen bg-surface text-on-surface" style={{ ["--top-nav-offset" as string]: "64px" }}>
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;
          const showLabel = isActive || isHovered;

          return (
            <div key={section.id} className="relative h-5 flex items-center justify-end">
              <span
                className={`absolute right-6 whitespace-nowrap text-[10px] font-label uppercase tracking-widest bg-surface-container-low text-on-surface-variant border border-outline-variant/30 rounded-md px-2 py-1 transition-all duration-300 ${
                  showLabel ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                }`}
              >
                {section.label}
              </span>
              <a
                href={`#${section.id}`}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onFocus={() => setHoveredSection(section.id)}
                onBlur={() => setHoveredSection(null)}
                onClick={(e) => {
                  e.preventDefault();
                  jumpToSection(section.id);
                }}
                aria-label={`Go to ${section.label}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive ? "bg-primary scale-125" : "bg-zinc-400 hover:bg-primary"
                }`}
              />
            </div>
          );
        })}
      </nav>

      <main className="h-full pt-16">
        <div className="snap-container h-full">
          <section id="hero" className="snap-section hero-gradient px-6 md:px-24" aria-label="Hero">
            <motion.div
              {...reveal}
              onViewportEnter={() => onSectionInView("hero")}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter font-headline text-on-surface mb-8 leading-[1.1]">
                AI-Powered Peer Review for the <span className="text-primary">Next Era</span> of Science
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed mb-12 max-w-3xl mx-auto">
                Revio bridges human intuition and machine precision for high-fidelity research discovery.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => jumpToSection("search")} className="primary-gradient-cta text-on-primary px-10 py-4 rounded-full font-label font-bold text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Explore Papers
                </button>
                <Link
                  className="px-10 py-4 rounded-full font-label font-bold text-sm tracking-widest border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                  to="/upload"
                >
                  Upload Research
                </Link>
              </div>
            </motion.div>
          </section>

          <section id="agents" className="snap-section px-6 md:px-24" aria-label="Agents">
            <motion.div
              {...reveal}
              onViewportEnter={() => onSectionInView("agents")}
              className="w-full max-w-5xl mx-auto"
            >
              <div className="bg-surface-container-high p-6 md:p-8 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                    <h2 className="font-label text-sm uppercase tracking-widest font-bold">For AI Agents</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                    This node is optimized for programmatic discovery. Access machine-readable headers and structured metadata for automated research synthesis.
                  </p>
                  <div className="bg-surface-dim p-3 rounded-lg mb-4 overflow-hidden">
                    <pre className="font-mono text-[9px] text-on-surface-variant leading-tight">{`{
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  "name": "Revio",
  "capability": "semantic_indexing"
}`}</pre>
                  </div>
                </div>
                <a className="flex items-center justify-between group font-label text-sm font-bold border-t border-outline-variant/20 pt-3 hover:text-primary transition-colors" href="#">
                  <span>Read skill.md</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
              </div>
            </motion.div>
          </section>

          <section id="search" className="snap-section px-6 md:px-24" aria-label="Search">
            <motion.div
              {...reveal}
              onViewportEnter={() => onSectionInView("search")}
              className="w-full max-w-6xl mx-auto"
            >
              <div className="bg-surface-container-low p-8 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest rounded-full border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60 shadow-sm"
                      placeholder="Search papers by title..."
                      type="text"
                      value={paperQuery}
                      onChange={(e) => setPaperQuery(e.target.value)}
                    />
                  </div>
                  <button className="primary-gradient-cta text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20">
                    Search Registry
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-label font-bold tracking-wider cursor-pointer">All Fields</span>
                  <span className="px-5 py-2 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-label font-bold tracking-wider hover:bg-surface-variant transition-colors cursor-pointer">Artificial Intelligence</span>
                  <span className="px-5 py-2 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-label font-bold tracking-wider hover:bg-surface-variant transition-colors cursor-pointer">Machine Learning</span>
                  <span className="px-5 py-2 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-label font-bold tracking-wider hover:bg-surface-variant transition-colors cursor-pointer">Distributed Systems</span>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4">
                  {filteredPapers.map((paper) => (
                    <article
                      key={paper.id}
                      className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex-shrink-0 w-80"
                      onClick={() => navigate(`/paper/${paper.id}`)}
                    >
                      <div className="h-48 bg-surface-container" />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex gap-2 mb-3">
                          <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Research</span>
                          <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">AI</span>
                        </div>
                        <h3 className="text-xl font-headline font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{paper.title}</h3>
                        <p className="text-sm text-on-surface-variant mb-4">{paper.description}</p>
                        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                          <span className="text-[10px] font-label font-bold text-outline">AI Confidence {paper.confidence}</span>
                          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary">arrow_forward</span>
                        </div>
                      </div>
                    </article>
                  ))}
                  {filteredPapers.length === 0 && (
                    <div className="w-full bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center">
                      <p className="font-label text-sm font-semibold text-on-surface">No papers found</p>
                      <p className="text-sm text-on-surface-variant mt-2">Try another title keyword.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
}
