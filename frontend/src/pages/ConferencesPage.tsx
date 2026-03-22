import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { 
  Calendar, 
  MapPin, 
  Share2, 
  Lock, 
  Archive, 
  Star, 
  ArrowUpRight, 
  ChevronRight,
  Loader2,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConferences } from "../hooks/useConferences";

const researchAreas = ["AI", "ML", "Robotics", "Systems", "Vision", "NLP"];
const statusFilters = ["ALL", "OPEN", "CLOSE", "UP COMING", "ARCHIVE"] as const;

type ConferenceStatus = (typeof statusFilters)[number];

// Helper to check if we should filter by status or show all
const isAllFilter = (status: ConferenceStatus) => status === "ALL";

// Map conference tier to status for display
function getConferenceStatus(tier: string): ConferenceStatus {
  switch (tier) {
    case 'ELITE':
      return 'OPEN';
    case 'PREMIUM':
      return 'CLOSE';
    case 'STANDARD':
      return 'UP COMING';
    default:
      return 'ARCHIVE';
  }
}

export default function ConferencesPage() {
  const [activeStatus, setActiveStatus] = useState<ConferenceStatus>("ALL");
  const { conferences, loading, error } = useConferences();

  // Transform API conferences to display format
  const displayConferences = useMemo(() => {
    return conferences.map((conf, index) => ({
      id: conf.id,
      title: conf.name,
      acronym: conf.acronym,
      status: getConferenceStatus(conf.tier),
      date: "TBD 2024",
      location: conf.publisher || "International",
      description: `${conf.name}. Leading conference in ${conf.requiredSkills?.slice(0, 3).join(', ') || 'research'}.`,
      website: conf.website,
      tier: conf.tier,
      featured: index === 0,
      timeLeft: conf.tier === 'ENTRY' ? 'Applications Open' : undefined,
    }));
  }, [conferences]);

  const statusOrder: Record<string, number> = {
    OPEN: 0,
    CLOSE: 1,
    "UP COMING": 2,
    ARCHIVE: 3,
  };

  const sortedConferences = [...displayConferences].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  const filteredConferences = isAllFilter(activeStatus) 
    ? sortedConferences 
    : sortedConferences.filter((conf) => conf.status === activeStatus);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading conferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto"
    >
      <header className="mb-16">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-surface mb-6"
        >
          Conferences
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-lg text-on-surface-variant leading-relaxed opacity-80"
        >
          The leading ecosystem for academic discourse and AI-driven scientific breakthroughs. Explore upcoming symposiums, processing reviews, and archival records.
        </motion.p>
      </header>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-2 rounded-lg font-label text-sm transition-colors ${
                activeStatus === status
                  ? "bg-surface-container-lowest text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant font-medium hover:bg-surface-container"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mr-2">
            Research Areas:
          </span>
          {researchAreas.map((area) => (
            <button 
              key={area}
              className="px-4 py-1.5 rounded-full border border-outline-variant/20 bg-surface-container-lowest text-xs font-label hover:border-primary hover:text-primary transition-all"
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConferences.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-on-surface-variant">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{isAllFilter(activeStatus) ? "No conferences found" : `No conferences found with status "${activeStatus}"`}</p>
          </div>
        ) : (
          filteredConferences.map((conf, index) => (
            <motion.div
              key={conf.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`group relative p-8 rounded-xl transition-all duration-300 ${
                conf.status === 'ARCHIVE'
                  ? 'bg-surface-container-low/50 opacity-80 grayscale-[0.2]' 
                  : 'bg-surface-container-lowest shadow-sm hover:shadow-md'
              } ${conf.status === 'CLOSE' ? 'border-l-4 border-amber-400/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-label font-bold ${
                  conf.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 
                  conf.status === 'CLOSE' ? 'bg-amber-50 text-amber-700' :
                  conf.status === 'UP COMING' ? 'bg-blue-50 text-blue-700' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {conf.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                  {conf.status}
                </span>
                <div className="text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">
                  {conf.status === 'OPEN' ? (
                    conf.featured ? <Star className="w-5 h-5 fill-primary text-primary" /> : <Share2 className="w-5 h-5" />
                  ) : conf.status === 'CLOSE' ? (
                    <Lock className="w-5 h-5" />
                  ) : conf.status === 'UP COMING' ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <Archive className="w-5 h-5" />
                  )}
                </div>
              </div>

              <Link to={`/conferences/${conf.id}`}>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {conf.acronym || conf.title}
                </h3>
              </Link>

              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-on-surface-variant opacity-70">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-label">{conf.date}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant opacity-70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-label">{conf.location}</span>
                </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                {conf.description}
              </p>

              <div className="pt-6 border-t border-outline-variant/10">
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold mb-4">
                  Tier: {conf.tier}
                </p>

                {conf.status === 'OPEN' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      {conf.featured ? 'Featured Event' : 'Accepting Submissions'}
                    </span>
                    <Link 
                      to={`/upload?conference=${conf.id}`}
                      className="bg-primary/5 text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {conf.status === 'CLOSE' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                      Reviews In Progress
                    </span>
                    <Link 
                      to={`/conferences/${conf.id}`}
                      className="text-primary text-xs font-label font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      CHECK STATUS <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {conf.status === 'UP COMING' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      Opening Soon
                    </span>
                    <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                      {conf.timeLeft ?? "TBA"}
                    </span>
                  </div>
                )}

                {conf.status === 'ARCHIVE' && (
                  <Link 
                    to={`/conferences/${conf.id}`}
                    className="w-full block text-center border border-outline-variant text-on-surface font-label text-xs py-2 rounded hover:bg-surface-container-high transition-colors"
                  >
                    Access Library
                  </Link>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-20 flex justify-center">
        <button className="flex items-center gap-3 px-8 py-4 rounded-full border border-outline-variant/30 text-on-surface font-label font-semibold hover:bg-surface-container-low transition-all">
          VIEW MORE CONFERENCES
          <ChevronRight className="w-4 h-4 rotate-90" />
        </button>
      </div>
    </motion.div>
  );
}
