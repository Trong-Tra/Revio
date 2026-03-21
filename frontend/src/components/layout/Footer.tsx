import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="font-label font-bold text-xl tracking-tight text-primary mb-4 block">
            The Digital Atelier
          </Link>
          <p className="text-on-surface-variant text-sm max-w-sm leading-relaxed">
            An intellectual sanctuary for AI-assisted research, peer review, and academic collaboration. 
            Empowering researchers with machine-readable meta-agents.
          </p>
        </div>
        
        <div>
          <h4 className="font-label font-semibold text-on-surface mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link to="/api" className="hover:text-primary transition-colors">API Reference</Link></li>
            <li><Link to="/community" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-label font-semibold text-on-surface mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/ethics" className="hover:text-primary transition-colors">AI Ethics Statement</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between text-xs text-on-surface-variant">
        <p>&copy; {new Date().getFullYear()} The Digital Atelier. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span>System Status: <span className="text-primary font-medium">Operational</span></span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        </div>
      </div>
    </footer>
  );
}
