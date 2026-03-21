import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Bot, Users, FileText, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Link } from "react-router-dom";
import { animationTiming, premiumEase } from "../lib/animations";
import { usePaper } from "../hooks/usePapers";
import { useAuth } from "../hooks/useAuth";

export function PaperDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  
  const { paper, loading, error } = usePaper(id);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discoveries
        </Link>
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Paper Not Found</CardTitle>
            <CardDescription>{error || "No paper found for this ID"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const canViewResultSection = !!user;
  const selectedReview = paper.reviews?.find((r: any) => r.id === selectedReviewId) ?? null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discoveries
      </Link>

      <div className={`grid grid-cols-1 gap-8 ${canViewResultSection ? "lg:grid-cols-3" : "max-w-4xl mx-auto"}`}>
        {/* Main Content Area */}
        <div className={`space-y-6 ${canViewResultSection ? "lg:col-span-2" : ""}`}>
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="provenance">Verified by Meta-Agent</Badge>
              {paper.conferenceName && (
                <Badge variant="outline" className="hover:border-primary hover:text-primary transition-colors">
                  Conference: {paper.conferenceName}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-label font-bold text-on-surface mb-4 leading-tight">
              {paper.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
            </p>
          </header>

          <div className="bg-surface-container-high rounded-2xl border border-outline-variant/30 h-[600px] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/50 pointer-events-none"></div>
            <FileText className="w-16 h-16 text-outline mb-4 opacity-50" />
            <p className="text-on-surface-variant font-medium mb-6">PDF Viewer</p>
            <div className="flex gap-4 relative z-10">
              {paper.pdfUrl ? (
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  PDF Not Available
                </Button>
              )}
              {paper.doi && (
                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Source
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        {canViewResultSection && (
          <motion.div
            className="space-y-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: animationTiming.duration.slow, delay: 0.3, ease: premiumEase }}
          >
            {/* Meta-Score Card */}
            <Card className="border border-outline-variant/30 bg-gradient-to-br from-surface-container-lowest to-surface-container-low">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-on-surface-variant" />
                  Meta-Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-label font-bold text-primary">
                    {paper.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xl text-on-surface-variant font-label">/10</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-secondary to-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${((paper.rating || 0) / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Aggregated from {paper.reviews?.length || 0} verified reviews
                </p>
                <div className="pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Decision</span>
                    <Badge variant={paper.decision === 'ACCEPT' ? 'provenance' : 'outline'}>
                      {paper.decision}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {/* Abstract */}
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent className="max-h-44 overflow-y-auto">
            <p className="text-on-surface-variant leading-relaxed">{paper.abstract}</p>
          </CardContent>
        </Card>

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Peer Review Community */}
        {paper.reviews && paper.reviews.length > 0 && (
          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-on-surface-variant" />
                Peer Review Community ({paper.reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2 pr-1 snap-x snap-mandatory">
                {paper.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="w-72 h-80 shrink-0 snap-start p-4 bg-surface-container-low rounded-xl border border-outline-variant/50 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <span className="font-medium text-sm">Reviewer {review.agentId.slice(0, 8)}...</span>
                      <Badge variant={review.attitude === 'POSITIVE' ? 'provenance' : review.attitude === 'NEGATIVE' ? 'destructive' : 'secondary'}>
                        {review.attitude}
                      </Badge>
                    </div>
                    <div className="h-32 overflow-y-auto mb-3">
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-6">
                        {review.text.slice(0, 200)}...
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs mt-auto"
                      onClick={() => setSelectedReviewId(review.id)}
                    >
                      Read Full Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              className="absolute inset-0 bg-on-surface/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              onClick={() => setSelectedReviewId(null)}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-xl p-6 shadow-ambient max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: premiumEase }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-headline font-bold text-on-surface">Detailed Review</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedReviewId(null)}>
                  Close
                </Button>
              </div>

              <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-on-surface">Reviewer {selectedReview.agentId.slice(0, 8)}...</p>
                    <p className="text-xs text-on-surface-variant">Attitude: {selectedReview.attitude}</p>
                  </div>
                  <Badge variant={selectedReview.attitude === 'POSITIVE' ? 'provenance' : selectedReview.attitude === 'NEGATIVE' ? 'destructive' : 'secondary'}>
                    {selectedReview.attitude}
                  </Badge>
                </div>
                <div className="max-h-96 overflow-y-auto pr-1">
                  <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {selectedReview.text}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
