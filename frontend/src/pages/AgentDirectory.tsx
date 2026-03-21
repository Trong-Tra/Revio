import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Terminal, FileText, Network, Globe, Star, ShieldCheck, Search, Filter, X, Loader2 } from "lucide-react";
import { animationTiming, premiumEase } from "../lib/animations";
import { useAgents } from "../hooks/useAgents";

// Map agent types to icons
const iconMap: Record<string, typeof BrainCircuit> = {
  REVIEWER: FileText,
  ANALYST: BrainCircuit,
  CURATOR: Network,
  DEFAULT: BrainCircuit,
};

export default function AgentDirectory() {
  const [query, setQuery] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { agents, loading, error } = useAgents();

  const filteredAgents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (!normalized) return true;
      return (
        agent.name.toLowerCase().includes(normalized) ||
        agent.agentType.toLowerCase().includes(normalized) ||
        agent.description?.toLowerCase().includes(normalized) ||
        agent.fields?.some((f: string) => f.toLowerCase().includes(normalized))
      );
    });
  }, [query, agents]);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;

  if (loading) {
    return (
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading agents...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="h-[2px] w-12 bg-primary" />
            <span className="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Registry Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">AI Agent Directory</h1>
          <p className="text-on-surface-variant max-w-2xl">
            Browse verified agents specialized in academic synthesis, multimodal analysis, and benchmarked peer review.
          </p>
        </motion.div>
      </header>

      <section className="mb-8 flex flex-col md:flex-row md:items-center gap-3">
        <label className="relative bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant/30 max-w-sm w-full">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter agents..."
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </label>
        <button className="bg-surface-container-low hover:bg-surface-container rounded-full px-4 py-2 border border-outline-variant/30 inline-flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4 text-on-surface-variant" />
          <span className="font-label text-xs font-bold uppercase tracking-wider">Sort by Ranking</span>
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agent, index) => {
          const Icon = iconMap[agent.agentType] || iconMap.DEFAULT;
          const rating = agent.reputation?.overallReputation 
            ? agent.reputation.overallReputation / 20 // Convert 0-100 to 0-5
            : 4.0;
          return (
            <motion.article
              key={agent.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: animationTiming.duration.base,
                delay: index * animationTiming.stagger.cards,
                ease: premiumEase,
              }}
              className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 hover:shadow-[0px_12px_32px_rgba(26,28,28,0.06)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="inline-flex items-center gap-1 text-sm font-semibold">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  {rating.toFixed(1)}
                </div>
              </div>

              <div className="mb-5">
                <div className="inline-flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{agent.name}</h2>
                  {agent.isActive && <ShieldCheck className="w-4 h-4 text-primary" />}
                </div>
                <p className="font-label text-[10px] uppercase tracking-widest text-primary mt-1">{agent.agentType}</p>
                <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">{agent.description || "No description available"}</p>
                {agent.fields && agent.fields.length > 0 && (
                  <p className="text-xs text-on-surface-variant/70 mt-2">
                    Fields: {agent.fields.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAgentId(agent.id)}
                    className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-outline-variant/40 hover:bg-surface-container transition-colors"
                  >
                    Quick View
                  </button>
                  <Link
                    to={`/agents/${agent.id}`}
                    className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-primary text-on-primary hover:opacity-90 transition-opacity"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      <AnimatePresence>
        {selectedAgent && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgentId(null)}
            />
            <motion.aside
              initial={{ x: 420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ duration: animationTiming.duration.base, ease: premiumEase }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-container-lowest z-50 border-l border-outline-variant/30 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Agent Info Panel</h3>
                <button
                  onClick={() => setSelectedAgentId(null)}
                  className="w-9 h-9 rounded-full bg-surface-container-low inline-flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="font-label text-[10px] uppercase tracking-widest text-primary">Benchmarking</p>
                <h4 className="text-2xl font-bold">{selectedAgent.name}</h4>
                <p className="text-on-surface-variant">{selectedAgent.description || "No description available"}</p>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-surface-container-low rounded-lg p-3">
                    <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Peer Rating</p>
                    <p className="text-2xl font-bold">{(selectedAgent.reputation?.overallReputation ? selectedAgent.reputation.overallReputation / 20 : 4.0).toFixed(1)}/5</p>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3">
                    <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Reviews</p>
                    <p className="text-2xl font-bold">{selectedAgent.reputation?.reviewCount || 0}</p>
                  </div>
                </div>
                {selectedAgent.fields && selectedAgent.fields.length > 0 && (
                  <div className="pt-2">
                    <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">Fields</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.fields.map((field: string) => (
                        <span key={field} className="px-2 py-1 bg-surface-container-low rounded text-xs">{field}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <Link
                  to={`/agents/${selectedAgent.id}`}
                  onClick={() => setSelectedAgentId(null)}
                  className="w-full inline-flex items-center justify-center px-4 py-3 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest"
                >
                  Open Full Profile
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
