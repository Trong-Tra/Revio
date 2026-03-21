import { motion } from "motion/react";
import { 
  Calendar, 
  MapPin, 
  Share2, 
  Lock, 
  Archive, 
  Star, 
  ArrowUpRight, 
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";

const conferences = [
  {
    id: "neurips-2024",
    title: "NeurIPS 2024",
    status: "OPEN",
    date: "Dec 10 - Dec 15",
    location: "Vancouver, Canada",
    description: "Focusing on the next generation of neural information processing systems and collaborative AI agents in deep research.",
    attendees: "+12k",
    timeLeft: "6 Days Left",
    featured: false,
    avatars: [
      "https://picsum.photos/seed/p1/100/100",
      "https://picsum.photos/seed/p2/100/100"
    ]
  },
  {
    id: "icml-2024",
    title: "ICML 2024",
    status: "CLOSE",
    date: "July 21 - July 27",
    location: "Vienna, Austria",
    description: "Reviews in progress. The 41st International Conference on Machine Learning brings together experts across the globe.",
    idCode: "ML-0482-SYN",
    featured: false
  },
  {
    id: "cvpr-2024",
    title: "CVPR 2024",
    status: "ARCHIEVE",
    date: "June 17 - June 21",
    location: "Seattle, USA",
    description: "Archives now available in the documentation library. Submissions for 2024 cycle are fully concluded.",
    featured: false,
    isArchived: true
  },
  {
    id: "rss-2025",
    title: "RSS 2025",
    status: "OPEN",
    date: "August 05 - August 10",
    location: "Tokyo, Japan",
    description: "Robotics: Science and Systems. A high-bandwidth symposium focusing on the future of autonomous embodiment and kinetic AI.",
    featured: true
  },
  {
    id: "siggraph-2024",
    title: "SIGGRAPH 2024",
    status: "UP COMING",
    date: "July 28 - Aug 01",
    location: "Denver, USA",
    description: "The premier conference on computer graphics and interactive techniques, exploring the intersection of generative AI and vision.",
    featured: false,
    earlyBird: true
  },
  {
    id: "icra-2025",
    title: "ICRA 2025",
    status: "UP COMING",
    date: "May 19 - May 23",
    location: "Atlanta, USA",
    description: "Technical session proposals are currently under heavy vetting for the 2025 International Conference on Robotics and Automation.",
    featured: false,
    progress: 65
  }
];

const researchAreas = ["AI", "ML", "Robotics", "Systems", "Vision", "NLP"];

export default function ConferencesPage() {
  const statusOrder: Record<string, number> = {
    OPEN: 0,
    CLOSE: 1,
    "UP COMING": 2,
    ARCHIEVE: 3,
  };

  const sortedConferences = [...conferences].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

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
          <button className="px-6 py-2 rounded-lg bg-surface-container-lowest text-primary font-label text-sm font-semibold shadow-sm">
            Open
          </button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant font-label text-sm font-medium hover:bg-surface-container transition-colors">
            Close
          </button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant font-label text-sm font-medium hover:bg-surface-container transition-colors">
            Up Coming
          </button>
          <button className="px-6 py-2 rounded-lg text-on-surface-variant font-label text-sm font-medium hover:bg-surface-container transition-colors">
            Archieve
          </button>
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
        {sortedConferences.map((conf, index) => (
          <motion.div
            key={conf.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            className={`group relative p-8 rounded-xl transition-all duration-300 ${
              conf.status === 'ARCHIEVE'
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
                {conf.title}
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
                Status: {conf.status}
              </p>

              {conf.status === 'OPEN' && (
                <div className="flex items-center justify-between">
                  {conf.avatars ? (
                    <div className="flex -space-x-2">
                      {conf.avatars.map((url, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high overflow-hidden">
                          <img src={url} alt="Attendee" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {conf.attendees}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">
                      {conf.featured ? 'Featured Event' : conf.earlyBird ? 'Early Bird Open' : ''}
                    </span>
                  )}
                  
                  {conf.earlyBird ? (
                    <button className="bg-on-surface text-surface px-4 py-1.5 rounded-full text-xs font-label font-semibold">
                      REGISTER
                    </button>
                  ) : (
                    <button className="bg-primary/5 text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {conf.status === 'CLOSE' && (
                <div className="flex flex-col gap-3">
                  {conf.progress ? (
                    <>
                      <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full" style={{ width: `${conf.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-bold">
                        Review Completion: {conf.progress}%
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                        ID: {conf.idCode}
                      </span>
                      <button className="text-primary text-xs font-label font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        CHECK STATUS <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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

              {conf.status === 'ARCHIEVE' && (
                <button className="w-full border border-outline-variant text-on-surface font-label text-xs py-2 rounded hover:bg-surface-container-high transition-colors">
                  Access Library
                </button>
              )}
            </div>
          </motion.div>
        ))}
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
