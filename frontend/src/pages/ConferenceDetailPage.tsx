import { motion } from "motion/react";
import { 
  Verified, 
  Cpu, 
  Download,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const deadlines = [
  {
    id: "01",
    label: "SUBMISSION",
    date: "August 15",
    desc: "Full paper submission deadline for general and workshop tracks."
  },
  {
    id: "02",
    label: "REVIEW PERIOD",
    date: "Sep 01 — Oct 10",
    desc: "Double-blind evaluation period by the SNA technical committee."
  },
  {
    id: "03",
    label: "NOTIFICATIONS",
    date: "October 25",
    desc: "Final decision notices sent to corresponding authors."
  }
];

const conferenceStatuses = [
  "CFP NOT OPEN",
  "SUBMISSION OPEN",
  "SUMISSION CLOSE",
  "UNDER REVIEW",
  "DECISION RELEASED",
  "CAMERA READY",
  "REGISTRATION",
  "ON GOING",
  "COMPLETED",
];

const conferenceNamesById: Record<string, string> = {
  "neurips-2024": "NeurIPS 2024",
  "icml-2024": "ICML 2024",
  "cvpr-2024": "CVPR 2024",
  "rss-2025": "RSS 2025",
  "siggraph-2024": "SIGGRAPH 2024",
  "icra-2025": "ICRA 2025",
};

const conferenceStatusById: Record<string, string> = {
  "neurips-2024": "SUBMISSION OPEN",
  "icml-2024": "SUBMISSION CLOSE",
  "cvpr-2024": "COMPLETED",
  "rss-2025": "UNDER REVIEW",
  "siggraph-2024": "REGISTRATION",
  "icra-2025": "CFP NOT OPEN",
};

export default function ConferenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conferenceName = conferenceNamesById[id ?? ""] ?? "Neural Architectures 2024";
  const currentStatus = conferenceStatusById[id ?? ""] ?? "SUBMISSION OPEN";

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
              <span className="font-label text-xs uppercase tracking-widest font-bold">Accepting Submissions</span>
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
                <span className="text-xl font-medium">Nov 12 — 15, 2024</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">Location</span>
                <span className="text-xl font-medium">Zurich, Switzerland</span>
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
            <div className="w-64 h-64 bg-surface-container-low rounded-xl overflow-hidden relative group">
              <img 
                src="https://picsum.photos/seed/neural/800/800" 
                alt="Abstract neural network" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
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
              Synthetica: Neural Architectures (SNA) is the premier global assembly for researchers redefining the intersection of large-scale cognitive modeling and high-efficiency compute.
            </p>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              This year's focus centers on <span className="text-on-surface font-semibold">Recursive Self-Correction</span> and <span className="text-on-surface font-semibold">Ternary Processing Units</span>. We invite original research that pushes the boundaries of how agents navigate multi-modal ambiguity without human supervision.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-outline-variant/20">
              <ul className="space-y-3 font-label text-sm">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Agentic Workflows</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Latent Space Exploration</li>
              </ul>
              <ul className="space-y-3 font-label text-sm">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Neuromorphic Hardware</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Ethical Constraints</li>
              </ul>
            </div>
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
              <span className="font-label text-xs uppercase tracking-widest text-primary-container">Agent Protocol: SNA-2024</span>
              <Cpu className="w-5 h-5 text-primary-container" />
            </div>
            <div className="space-y-4 opacity-90">
              <p className="text-emerald-400"># System Directive for Submission Scrapers</p>
              <pre className="bg-white/5 p-4 rounded text-xs leading-relaxed overflow-x-auto">
{`{
  "submission_v2": {
    "format": "IEEE_RECURSIVE",
    "max_tokens": 8500,
    "required_headers": [
      "prov_id", 
      "agent_confidence",
      "synthetic_test_ratio"
    ],
    "review_metric": "double-blind-02"
  },
  "citation_check": true,
  "llm_origin_disclosure": "mandatory"
}`}
              </pre>
              <p className="text-zinc-500 text-[10px] italic">Automated agents must verify "prov_id" before indexing details.</p>
            </div>
          </div>

          <div className="bg-surface-container-high p-8 rounded-xl">
            <h3 className="font-label text-xs uppercase tracking-widest mb-4">Venue Requirements</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Max Length</span>
                <span className="font-mono font-medium">12 Pages + Appendices</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Format</span>
                <span className="font-mono font-medium">LaTeX / Overleaf Template</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Ethics Approval</span>
                <span className="font-mono font-medium">Required (Section 7)</span>
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
        <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-12">Critical Deadlines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/20 rounded-xl overflow-hidden">
          {deadlines.map((d) => (
            <div key={d.id} className="bg-surface-container-lowest p-10 group hover:bg-surface-container-low transition-colors">
              <span className="font-label text-xs font-bold text-primary mb-2 block">{d.id} / {d.label}</span>
              <h4 className="text-2xl font-headline font-bold mb-4">{d.date}</h4>
              <p className="text-on-surface-variant text-sm">{d.desc}</p>
            </div>
          ))}
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
        <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-lg relative z-10">Join 400+ world-leading researchers in defining the next decade of neural architecture design.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <button
            className="primary-gradient text-white px-10 py-4 rounded-full font-sans font-bold text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all"
            onClick={() => navigate(`/upload?conference=${encodeURIComponent(conferenceName)}`)}
          >
            Submit Research
          </button>
          <button className="bg-zinc-800 text-white px-10 py-4 rounded-full font-sans font-medium text-lg border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
