import { useState } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Search, FileText, Bot, Users, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { usePapers } from "../hooks/usePapers";

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { papers, loading, error, meta } = usePapers({ search: searchQuery || undefined });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20 lg:py-32 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-surface to-surface"></div>
        <Badge variant="provenance" className="mb-6 px-4 py-1 text-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Powered by Meta-Agents
        </Badge>
        <h1 className="text-5xl lg:text-7xl font-label font-bold tracking-tight text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
          The Intellectual Sanctuary for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">AI-Assisted</span> Research
        </h1>
        <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload papers, deploy machine-readable meta-agents, and participate in a new era of verifiable peer review.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/upload">
            <Button size="lg" className="w-full sm:w-auto group">
              Upload Paper
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Configure Agent
            </Button>
          </Link>
        </div>
      </section>

      {/* Bento Box Features */}
      <section className="py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-surface-container-lowest to-surface-container-low border border-outline-variant/30">
            <CardHeader>
              <Bot className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Machine-Readable Meta-Agents</CardTitle>
              <CardDescription className="text-base">
                Deploy specialized AI agents to analyze methodology, check citations, and provide quantitative assessments before human review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-on-surface text-surface-container-lowest p-4 rounded-xl font-mono text-sm overflow-x-auto">
                <code>
                  {`{
  "agent_id": "methodology_checker_v2",
  "confidence_threshold": 0.95,
  "tasks": ["verify_datasets", "check_statistical_significance"]
}`}
                </code>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-outline-variant/30">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-2xl">Peer Review Community</CardTitle>
              <CardDescription>
                Collaborate with researchers globally. Verifiable provenance ensures trust.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">DR</div>
                <div>
                  <p className="text-sm font-medium">Dr. Rostova</p>
                  <p className="text-xs text-on-surface-variant">Reviewed 12 papers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">JM</div>
                <div>
                  <p className="text-sm font-medium">Prof. Maxwell</p>
                  <p className="text-xs text-on-surface-variant">Top Contributor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Discoveries */}
      <section className="py-20 border-t border-outline-variant/30">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-label font-bold">Recent Discoveries</h2>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Filter by topic..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-on-surface-variant">Loading papers...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-on-surface-variant text-sm">
              Make sure the backend server is running on port 3001
            </p>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-outline mx-auto mb-4" />
            <p className="text-on-surface-variant">No papers found</p>
            <Link to="/upload" className="text-primary hover:underline mt-2 inline-block">
              Upload the first paper
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <Link to={`/paper/${paper.id}`} key={paper.id}>
                <Card className="h-full hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 border border-outline-variant/20 cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{formatDate(paper.createdAt)}</Badge>
                      <Badge variant="provenance">
                        {paper.confidence || 'Pending'}
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">{paper.title}</CardTitle>
                    <CardDescription>{paper.authors.join(', ')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {paper.keywords.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {paper.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{paper.keywords.length - 3}</Badge>
                      )}
                    </div>
                    {paper.reviewCount !== undefined && (
                      <p className="text-xs text-on-surface-variant mt-3">
                        {paper.reviewCount} review{paper.reviewCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {meta && meta.total > meta.perPage && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <p className="text-sm text-on-surface-variant">
              Showing {papers.length} of {meta.total} papers
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
