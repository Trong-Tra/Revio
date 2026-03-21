import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, CheckCircle2, AlertTriangle, MessageSquare, Loader2, Bot, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { usePaper } from "../hooks/usePapers";
import { papersApi } from "../api/client";

export function PaperDetail() {
  const { id } = useParams<{ id: string }>();
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
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Paper Not Found</h2>
          <p className="text-on-surface-variant mb-6">{error || "The paper you're looking for doesn't exist."}</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find AI review for confidence score
  const aiReview = paper.reviews?.find(r => r.reviewerType === 'AI');
  const humanReviews = paper.reviews?.filter(r => r.reviewerType === 'HUMAN') || [];
  
  const confidenceScore = aiReview?.confidenceScore 
    ? Math.round(aiReview.confidenceScore * 100) 
    : null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-on-surface-variant hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discoveries
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (PDF Viewer Mockup) */}
        <div className="lg:col-span-2 space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {aiReview && (
                <Badge variant="provenance">Verified by Meta-Agent</Badge>
              )}
              {paper.doi && (
                <Badge variant="outline">DOI: {paper.doi}</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-label font-bold text-on-surface mb-4 leading-tight">
              {paper.title}
            </h1>
            <p className="text-lg text-on-surface-variant">
              {paper.authors.join(', ')}
            </p>
          </header>

          <div className="bg-surface-container-high rounded-2xl border border-outline-variant/30 h-[600px] flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/50 pointer-events-none"></div>
            <span className="text-6xl mb-4">📄</span>
            <p className="text-on-surface-variant font-medium mb-6">PDF Viewer</p>
            <div className="flex gap-4 relative z-10">
              <a href={papersApi.getPdf(paper.id)} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </a>
              {paper.doi && (
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </Button>
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

          {paper.keywords.length > 0 && (
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
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {confidenceScore && (
            <Card className="border-t-4 border-t-primary border-outline-variant/30 shadow-ambient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Confidence Score
                </CardTitle>
                <CardDescription>Based on automated methodology checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-label font-bold text-primary mb-4">{confidenceScore}%</div>
                <div className="w-full bg-surface-container-high rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-container h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
                {aiReview?.content?.findings && (
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    {aiReview.content.findings.map((finding, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="capitalize">{finding.type.replace('_', ' ')}</span>
                        <span className="font-medium text-on-surface capitalize">{finding.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {aiReview && (
            <Card className="border border-outline-variant/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-on-surface-variant" />
                  Machine Readable Meta-Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-on-surface text-surface-container-lowest p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <pre>
                    {JSON.stringify({
                      agent_id: "review_bot_alpha",
                      version: "1.2.4",
                      overall_score: aiReview.content?.overallScore,
                      confidence: aiReview.confidenceScore,
                      findings: aiReview.content?.findings?.map(f => ({
                        type: f.type,
                        status: f.status,
                        confidence: f.confidence
                      }))
                    }, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-outline-variant/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-on-surface-variant" />
                Peer Review Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {humanReviews.length > 0 ? (
                humanReviews.map((review) => (
                  <div key={review.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{review.reviewer?.name || 'Anonymous'}</span>
                      <Badge variant="secondary" className="text-[10px]">Reviewer</Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                      {review.content?.summary || 'No summary provided'}
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs">Read Full Review</Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-4">
                  No human reviews yet
                </p>
              )}
              <Button className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
