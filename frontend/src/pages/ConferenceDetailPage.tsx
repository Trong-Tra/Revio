import { motion } from "motion/react";
import { 
  Verified, 
  Cpu, 
  Download,
  Sparkles,
  Loader2,
  Globe,
  Calendar,
  MapPin
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useConference } from "../hooks/useConferences";
import { Link } from "react-router-dom";

const conferenceStatuses = [
  "CFP NOT OPEN",
  "SUBMISSION OPEN",
  "SUBMISSION CLOSE",
  "UNDER REVIEW",
  "DECISION RELEASED",
  "CAMERA READY",
  "REGISTRATION",
  "ON GOING",
  "COMPLETED",
];

// Map tier to status for display
function getStatusFromTier(tier: string): string {
  switch (tier) {
    case 'ELITE':
      return 'SUBMISSION OPEN';
    case 'PREMIUM':
      return 'UNDER REVIEW';
    case 'STANDARD':
      return 'SUBMISSION CLOSE';
    default:
      return 'COMPLETED';
  }
}

export default function ConferenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { conference, loading, error } = useConference(id);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading conference...</p>
        </div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Conference not found"}</p>
          <Link to="/conferences" className="text-primary hover:underline">Back to Conferences</Link>
        </div>
      </div>
    );
  }

  const currentStatus = getStatusFromTier(conference.tier);
  const conferenceName = conference.acronym || conference.name;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto"
    >
      {/* Hero Section */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Verified className="w-4 h-4 fill-primary/20" />
              <span className="font-label text-xs uppercase tracking-widest font-bold">
                {conference.tier} Tier Conference
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-surface mb-8 leading-[0.9]"
            >
              {conferenceName}
            </motion.h1>

            <div className="flex flex-wrap gap-x-12 gap-y-4">
              <div className="flex flex-col">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Schedule</span>
                <span className="text-xl font-medium">TBD 2024</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Location</span>
                <span className="text-xl font-medium">{conference.publisher || "International"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Status</span>
                <span className="text-xl font-medium">{currentStatus}</span>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="w-64 h-64 bg-surface-container-low rounded-xl overflow-hidden relative group flex items-center justify-center">
              <Globe className="w-24 h-24 text-outline opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/80 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
        {/* About Section */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="lg:col-span-7 bg-surface-container-low p-12 rounded-xl"
        >
          <h2 className="font-label text-xs uppercase tracking-widest text-primary font-bold mb-8">Thematic Scope</h2>
          <div className="space-y-6">
            <p className="text-2xl font-light text-on-surface leading-relaxed">
              {conference.name} is a premier conference for researchers in {conference.requiredSkills?.slice(0, 3).join(', ') || 'various fields'}.
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              This conference brings together leading academics and industry professionals to discuss cutting-edge research and future directions.
            </p>
            {conference.requiredSkills && conference.requiredSkills.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-outline-variant/20">
                {conference.requiredSkills.slice(0, 4).map((skill, idx) => (
                  <ul key={idx} className="space-y-3 font-label text-sm">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {skill}</li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* AI Agent Protocol */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 flex flex-col gap-8"
        >
          <div className="bg-on-surface text-surface-container-lowest p-8 rounded-xl flex-grow font-mono text-sm border-l-4 border-primary-container">
            <div className="flex items-center justify-between mb-6">
              <span className="font-label text-xs uppercase tracking-widest text-primary-container">Agent Protocol</span>
              <Cpu className="w-5 h-5 text-primary-container" />
            </div>
            <div className="space-y-4 opacity-90">
              <p className="text-emerald-400"># Conference Configuration</p>
              <pre className="bg-white/5 p-4 rounded text-xs leading-relaxed overflow-x-auto">
{`{
  "conference": {
    "id": "${conference.id}",
    "name": "${conference.name}",
    "tier": "${conference.tier}",
    "skills_required": [
      ${conference.requiredSkills?.slice(0, 3).map(s => `"${s}"`).join(', ') || '"research"'}
    ]
  },
  "review_mode": "${conference.tier === 'ELITE' ? 'council' : 'standard'}",
  "synthesis_enabled": true
}`}
              </pre>
              <p className="text-zinc-500 text-[10px] italic">Automated agents available for review.</p>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-xl">
            <h3 className="font-label text-xs uppercase tracking-widest mb-4">Venue Requirements</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Tier</span>
                <span className="font-mono font-medium">{conference.tier}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Format</span>
                <span className="font-mono font-medium">PDF Upload</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Required Skills</span>
                <span className="font-mono font-medium">{conference.requiredSkills?.length || 0}</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Conference Lifecycle Status */}
      <section className="mb-24">
        <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">Conference Status</h2>
        <div className="flex flex-wrap gap-3">
          {conferenceStatuses.map((status) => (
            <span
              key={status}
              className={`px-4 py-2 rounded-full text-xs font-label font-bold tracking-wider ${
                status === currentStatus
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {status}
            </span>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-24">
        <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-12">Conference Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/20 rounded-xl overflow-hidden">
          <div className="bg-surface-container-lowest p-10 group hover:bg-surface-container-low transition-colors">
            <span className="font-label text-xs font-bold text-primary mb-2 block">01 / SUBMISSION</span>
            <h4 className="text-2xl font-headline font-bold mb-4">Open</h4>
            <p className="text-on-surface-variant text-sm">Paper submissions accepted through the platform.</p>
          </div>
          <div className="bg-surface-container-lowest p-10 group hover:bg-surface-container-low transition-colors">
            <span className="font-label text-xs font-bold text-primary mb-2 block">02 / REVIEW</span>
            <h4 className="text-2xl font-headline font-bold mb-4">AI + Human</h4>
            <p className="text-on-surface-variant text-sm">Hybrid review process with agent council and human reviewers.</p>
          </div>
          <div className="bg-surface-container-lowest p-10 group hover:bg-surface-container-low transition-colors">
            <span className="font-label text-xs font-bold text-primary mb-2 block">03 / DECISION</span>
            <h4 className="text-2xl font-headline font-bold mb-4">Synthesis</h4>
            <p className="text-on-surface-variant text-sm">Final decision based on TinyFish-powered synthesis.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="bg-on-surface text-surface py-20 px-8 rounded-xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Sparkles className="w-48 h-48" />
        </div>
        <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 relative z-10">Ready to present your findings?</h2>
        <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg relative z-10">Join leading researchers in defining the next decade of scientific discovery.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <button
            className="primary-gradient-cta text-white px-10 py-4 rounded-full font-sans font-bold text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all"
            onClick={() => navigate(`/upload?conference=${encodeURIComponent(conference.id)}`)}
          >
            Submit Research
          </button>
          {conference.website && (
            <a 
              href={conference.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 text-white px-10 py-4 rounded-full font-sans font-medium text-lg border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Official Website
            </a>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
