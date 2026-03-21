import { useState } from "react";
import { Search, ArrowRight, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { usePapers } from "../hooks/usePapers";

const researchAreas = ["All", "Machine Learning", "Blockchain", "Distributed Systems", "Cryptography"];

export default function PaperLibrary() {
  const { papers, loading, error } = usePapers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");

  // Filter papers based on search and area
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = !searchQuery || 
      paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors?.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesArea = selectedArea === "All" || 
      paper.keywords?.some((k: string) => k.toLowerCase().includes(selectedArea.toLowerCase())) ||
      paper.field?.toLowerCase().includes(selectedArea.toLowerCase());
    
    return matchesSearch && matchesArea;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 selection:text-primary font-sans">
        <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-on-surface-variant">Loading research library...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 selection:text-primary font-sans">
        <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/20 selection:text-primary font-sans">
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-6">Research Library</h1>
          <p className="max-w-2xl text-lg text-on-surface-variant leading-relaxed">
            A curated repository of papers created across the Revio platform. Explore ongoing discoveries,
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {researchAreas.map((area) => (
              <button 
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-5 py-2 rounded-full font-label text-xs uppercase tracking-widest whitespace-nowrap cursor-pointer transition-colors ${
                  selectedArea === area
                    ? "bg-on-surface text-surface"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-variant"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPapers.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-on-surface-variant">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No papers found matching your criteria.</p>
            </div>
          ) : (
            filteredPapers.map((paper) => (
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
                      {paper.conferenceName || "Conference"}
                    </Link>
                  </div>
                  <Link to={`/paper/${paper.id}`}>
                    <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors cursor-pointer">
                      {paper.title}
                    </h3>
                  </Link>
                  <p className="font-label text-sm text-on-surface-variant mb-6 italic">
                    {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-8 line-clamp-3">
                    {paper.abstract}
                  </p>
                </div>
                <div className="space-y-6 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {paper.tag1 && (
                      <span className="px-3 py-1 bg-surface-container-low text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant rounded">
                        {paper.tag1}
                      </span>
                    )}
                    {paper.tag2 && (
                      <span className="px-3 py-1 bg-primary/10 text-[10px] font-label font-bold uppercase tracking-wider text-primary rounded">
                        {paper.tag2}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                    <span className="font-mono text-[10px] text-outline uppercase">Created: {paper.date}</span>
                    <Link
                      to={`/paper/${paper.id}`}
                      className="text-xs font-label font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors cursor-pointer"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
