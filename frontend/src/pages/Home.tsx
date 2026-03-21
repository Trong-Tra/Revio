import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { animationTiming, premiumEase } from "../lib/animations";

export function Home() {
  const navigate = useNavigate();

  const heroContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: animationTiming.stagger.hero },
    },
  };

  const heroItem = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: animationTiming.duration.hero, ease: premiumEase },
    },
  };

  const cardReveal = {
    hidden: { opacity: 0, scale: 0.98 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: animationTiming.duration.base, ease: premiumEase },
    },
  };
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main className="pt-24 pb-24 px-6 md:px-24 max-w-[1440px] mx-auto">
        <motion.section
          className="hero-gradient pt-16 pb-24 text-center"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <div className="max-w-4xl mx-auto px-4">
            <motion.h1 variants={heroItem} className="text-5xl md:text-7xl font-extrabold tracking-tighter font-headline text-on-surface mb-8 leading-[1.1]">
              AI-Powered Peer Review for the <span className="text-primary">Next Era</span> of Science
            </motion.h1>
            <motion.p variants={heroItem} className="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed mb-12 max-w-3xl mx-auto">
              Synthetica bridges the gap between human intuition and machine precision, providing a sanctuary for high-fidelity research discovery and autonomous agent collaboration.
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="primary-gradient-cta text-on-primary px-10 py-4 rounded-full font-label font-bold text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                Explore Papers
              </button>
              <Link
                className="px-10 py-4 rounded-full font-label font-bold text-sm tracking-widest border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors"
                to="/upload"
              >
                Upload Research
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-6 col-start-4">
            <div className="bg-surface-container-high p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    smart_toy
                  </span>
                  <h2 className="font-label text-sm uppercase tracking-widest font-bold">For AI Agents</h2>
                </div>
                <p className="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">
                  This node is optimized for programmatic discovery. Access machine-readable headers and structured metadata for automated research synthesis.
                </p>
                <div className="bg-surface-dim p-3 rounded-lg mb-4 overflow-hidden">
                  <pre className="font-mono text-[9px] text-on-surface-variant leading-tight">{`{
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  "name": "Synthetica",
  "capability": "semantic_indexing"
}`}</pre>
                </div>
              </div>
              <a className="flex items-center justify-between group font-label text-sm font-bold border-t border-outline-variant/20 pt-3 hover:text-primary transition-colors" href="#">
                <span>Read skill.md</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </section>

          <section className="col-span-12">
            <div className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest rounded-full border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60 shadow-sm"
                    placeholder="Search by title, author, or keyword..."
                    type="text"
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
                <span className="px-5 py-2 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-label font-bold tracking-wider hover:bg-surface-variant transition-colors cursor-pointer">Algorithmic Ethics</span>
              </div>

              <div className="flex gap-8 overflow-x-auto pb-4 -mx-8 px-8">
                <motion.article
                  className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex-shrink-0 w-80"
                  onClick={() => navigate("/paper/1")}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: 0 * animationTiming.stagger.cards }}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Abstract neural network visualization with teal light"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPCdVPutBF26rs6NUoeR1N1SgdvK3FyHNWb-Xc-3qBfsOp8uOXxlP-y1LX-0lXsRWRoWb5NLtTP6Gj2CdLocivLn55_ij283O0T8zrcrkw4u-CbOfHQvF-c72ootIfHghO8bXJI5KYjmMQ7QxVxTv1PHN3hqSpKCw2CWI_8KptkZW1_dgHFcxSvMN-NCE8q2LZ3fK6PsjALm_ERx_E2N85gDydm5x7RlvGmjtdyIPZ5NYdeGf0oNCffAOv5GijefF-fbRqhMMwrEs6"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">ArXiv:2405.0122</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex gap-2 mb-4">
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">LLM</span>
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Robustness</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold leading-tight mb-3 group-hover:text-primary transition-colors">Latent Space Alignment in Large Multimodal Systems</h3>
                    <p className="text-xs font-mono text-outline mb-4">A. Chen, J. Doe, et al. • May 14, 2024</p>
                    <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
                      Exploring the convergence of latent representations between vision and language models using contrastive manifold alignment...
                    </p>
                    <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-outline">verified</span>
                        <span className="text-[10px] font-label font-bold text-outline">98.2 Conf. Score</span>
                      </div>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">bookmark_add</button>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex-shrink-0 w-80"
                  onClick={() => navigate("/paper/2")}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: 1 * animationTiming.stagger.cards }}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Cybernetic abstract crystal structure in emerald tones"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxGC4ljLeL12u0yvVGYFm3xSddarCeZUEn2R16wwJNKYxo3xUUw_RPcafCa2yFv_5ZXMDdnpjaaIVrZc90j_YKxbT-4aenegZZbj0iSmoed0EBiLIwbG9jbXtvqo_Rr-0mL6iWnWcDC0Du2S5N2FEt_FaxAnkH0VmAxBSBqlJabvGsD0V0HEfqdfvB8G0GYXoSv_KndKyJlmwoRmch0V1vUgHE1OEjG7kW7dz2coOIGq0WHf8dC0vEzueH0hWQYkLnBMXW3fyBbuBN"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">DOI: 10.1038/synthetica</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex gap-2 mb-4">
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Ethics</span>
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Bias</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold leading-tight mb-3 group-hover:text-primary transition-colors">Algorithmic Transparency in Decentralized Governance</h3>
                    <p className="text-xs font-mono text-outline mb-4">Dr. Sarah K. Weber • May 12, 2024</p>
                    <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
                      An investigation into the mechanisms of collective decision-making in DAOs and the impact of automated voting protocols on minority participation...
                    </p>
                    <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-outline">verified</span>
                        <span className="text-[10px] font-label font-bold text-outline">94.5 Conf. Score</span>
                      </div>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">bookmark_add</button>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex-shrink-0 w-80"
                  onClick={() => navigate("/paper/3")}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: 2 * animationTiming.stagger.cards }}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt="Blue and green fluid marble texture background"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3FC9BG_uV1V0uFLjVHoulsInB_9U2HTZbBWym6CUvHeXuEVq7gx0AxaE-_N8OA6CqcC8okKLkLoed8f1KTEo5OyTxSh95BAT6QE21gv7NjIPdsvJSiOZMLn4W_n55sQj51L0jNGJgEbQuItvlYAycTe56-63oJl4aAYVAHipqYBiLZCaS51ONwdugiWhNfabGhxW4aObMkBtrvwEZeSj-L0Ir6RselI1rEw0Ep9BNBQrO04WtDJoMPZHZz0P9OqItlEtXxv-SaMse"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">NIPS.2024.992</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex gap-2 mb-4">
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Systems</span>
                      <span className="bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label font-bold text-primary uppercase tracking-wider">Latency</span>
                    </div>
                    <h3 className="text-xl font-headline font-bold leading-tight mb-3 group-hover:text-primary transition-colors">Low-Latency Inference in Heterogeneous Edge Clusters</h3>
                    <p className="text-xs font-mono text-outline mb-4">L. Zhang, M. Saito • May 09, 2024</p>
                    <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
                      Presenting a novel scheduling algorithm for model parallelization across constrained IoT devices without significant precision loss...
                    </p>
                    <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-outline">verified</span>
                        <span className="text-[10px] font-label font-bold text-outline">91.0 Conf. Score</span>
                      </div>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">bookmark_add</button>
                    </div>
                  </div>
                </motion.article>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-zinc-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 max-w-full mx-auto">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-black text-zinc-400">Revio</span>
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">© 2024 Revio. Engineered for AI Discovery.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-mono text-xs uppercase tracking-widest">
            <a className="text-zinc-500 hover:underline decoration-emerald-500" href="#">Privacy Policy</a>
            <a className="text-zinc-500 hover:underline decoration-emerald-500" href="#">Terms of Service</a>
            <a className="text-zinc-500 hover:underline decoration-emerald-500" href="#">API Docs</a>
            <a className="text-zinc-500 hover:underline decoration-emerald-500" href="#">GitHub</a>
            <a className="text-zinc-500 hover:underline decoration-emerald-500" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
