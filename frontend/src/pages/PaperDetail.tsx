import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Link } from "react-router-dom";
import { usePaper } from "../hooks/usePapers";

export function PaperDetail() {
  const { id } = useParams();
  
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
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error || "Paper not found"}</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ratingProgress = (paper.rating / 10) * 100;
  const decisionLabel: Record<string, string> = {
    ACCEPT: 'Accepted',
    ACCEPT_WITH_REVISIONS: 'Accept with Revisions',
    MINOR_REVISIONS: 'Minor Revisions',
    MAJOR_REVISIONS: 'Major Revisions',
    REJECT: 'Rejected',
    PENDING: 'Pending',
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discoveries
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="provenance">Verified by Meta-Agent</Badge>
              {paper.doi && (
                <Badge variant="outline">DOI: {paper.doi}</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-label font-bold text-on-surface mb-4 leading-tight">
              {paper.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {paper.authors?.join(', ')}
            </p>
            {paper.conferenceName && (
              <p className="text-sm text-on-surface-variant mt-2">
                {paper.conferenceName}
              </p>
            )}
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

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-on-surface-variant leading-relaxed">
                {paper.abstract}
              </p>
            </CardContent>
          </Card>

          {paper.keywords && paper.keywords.length > 0 && (
            <Card className="border border-outline-variant/30">
              <CardHeader>
                <CardTitle>Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          {paper.reviews && paper.reviews.length > 0 && (
            <Card className="border border-outline-variant/30">
              <CardHeader>
                <CardTitle>Reviews ({paper.reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paper.reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {review.reviewerType === 'AI' ? '🤖 AI Reviewer' : review.reviewer?.name || 'Reviewer'}
                      </span>
                      <Badge variant={review.reviewerType === 'AI' ? "provenance" : "outline"}>
                        {review.reviewerType === 'AI' ? 'AI Agent' : 'Human'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm">Score: <strong>{review.score?.toFixed(1)}/10</strong></span>
                    </div>
                    {review.summary && (
                      <p className="text-sm text-on-surface-variant">{review.summary}</p>
                    )}
                    {review.feedback && (
                      <div className="mt-3 p-3 bg-surface-container rounded-lg">
                        <p className="text-sm text-on-surface-variant whitespace-pre-line">{review.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-outline-variant/30 bg-gradient-to-br from-surface-container-lowest to-surface-container-low">
            <CardHeader>
              <CardTitle className="text-base">Meta-Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-5xl font-label font-bold text-primary">{paper.rating.toFixed(1)}</span>
                <span className="text-xl text-on-surface-variant font-label">/10</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-secondary to-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${ratingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-on-surface-variant">
                Aggregated from {paper.reviews?.length || 0} verified reviews
              </p>
              <div className="pt-4 border-t border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Decision</span>
                  <Badge variant={paper.decision === 'ACCEPT' ? 'provenance' : 'outline'}>
                    {decisionLabel[paper.decision] || paper.decision}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle className="text-base">Paper Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tier</span>
                <Badge variant="outline">{paper.tier}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Field</span>
                <span>{paper.field}</span>
              </div>
              {paper.skillConfidence !== undefined && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Skill Confidence</span>
                  <span>{(paper.skillConfidence * 100).toFixed(0)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
