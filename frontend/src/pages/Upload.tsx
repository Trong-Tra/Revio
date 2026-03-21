import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { UploadCloud, File, CheckCircle2, X, Loader2, Globe, Home, Plus, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useConferences } from '../hooks/useConferences';
import { papersApi } from '../api/client';

export function Upload() {
  const navigate = useNavigate();
  const location = useLocation();
  const conferenceFromQuery = new URLSearchParams(location.search).get('conference') ?? '';
  const { conferences, loading: conferencesLoading } = useConferences();

  // Build conference options from API
  const conferenceOptions = conferences.map(c => ({
    id: c.id,
    name: c.acronym || c.name,
  }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [conferenceSource, setConferenceSource] = useState<string>('');

  const parsingProgress = Math.min(100, uploadProgress * 1.2);
  const metadataProgress = Math.max(0, Math.min(100, (uploadProgress - 30) * 1.43));
  
  // Form state
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedConferenceId, setSelectedConferenceId] = useState(conferenceFromQuery);
  const [conferenceUrl, setConferenceUrl] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [showAuthorOptions, setShowAuthorOptions] = useState(false);

  // Set initial conference query when conferences load
  useEffect(() => {
    if (conferenceFromQuery && conferences.length > 0) {
      const conf = conferences.find(c => c.id === conferenceFromQuery);
      if (conf) {
        setSelectedConferenceId(conf.id);
      }
    }
  }, [conferenceFromQuery, conferences]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setAbstract('');
    setKeywords('');
    setSelectedAuthors([]);
    setConferenceUrl('');
    setIsUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGoHome = () => {
    navigate('/library');
  };

  const addAuthor = (authorEmail: string) => {
    if (!authorEmail || selectedAuthors.includes(authorEmail)) {
      return;
    }

    setSelectedAuthors((prev) => [...prev, authorEmail]);
    setAuthorQuery('');
    setShowAuthorOptions(false);
  };

  const removeAuthor = (authorEmail: string) => {
    setSelectedAuthors((prev) => prev.filter((author) => author !== authorEmail));
  };

  const handleSubmit = async () => {
    if (!file || !title) return;
    // Conference URL is required for auto-detection flow.
    if (!conferenceUrl) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Use the API client for upload
      const result = await papersApi.upload(file, {
        title,
        authors: selectedAuthors.length > 0 ? selectedAuthors : ['Anonymous'],
        abstract,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        field: 'Computer Science',
        conferenceId: selectedConferenceId || undefined,
        conferenceUrl: conferenceUrl || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setConferenceSource(result.meta?.conferenceSource || 'existing');
      
      // Keep success state to show modal, don't auto-reset
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-label font-bold text-on-surface mb-4">Upload Paper</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          Submit your research for automated meta-agent analysis and community peer review.
        </p>
      </header>

      <div className="space-y-8">
        {/* Success Modal */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30"
              >
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <FileCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">
                    Paper Uploaded Successfully!
                  </h2>
                  <p className="text-on-surface-variant mb-6">
                    Your paper has been submitted for AI analysis and review.
                    {conferenceSource === 'extracted' && ' Conference details were verified via AI.'}
                    {conferenceSource === 'independent' && ' Categorized as Independent Research.'}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={resetForm}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Another Paper
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleGoHome}
                      className="w-full"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Library
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag & Drop Zone - Hidden when file selected */}
        {!file && !uploadSuccess && (
          <Card 
            className={`border-2 border-dashed transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low/50'
            }`}
          >
            <CardContent className="p-12">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className={`flex flex-col items-center justify-center text-center transition-all ${
                  isDragging ? 'scale-105' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <UploadCloud className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-label font-semibold text-on-surface mb-2">
                  Drag & Drop your PDF here
                </h3>
                <p className="text-on-surface-variant mb-6">or click to browse from your computer</p>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Select File
                </Button>
                <p className="text-xs text-on-surface-variant mt-4">
                  Supported formats: PDF. Max size: 50MB.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected File Card - Shows when file is selected */}
        {file && !uploadSuccess && (
          <Card className="border border-outline-variant/30 shadow-ambient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                File Selected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <File className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-on-surface truncate">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {!isUploading && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveFile}
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Processing...</span>
                      <span className="text-primary">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 text-on-surface-variant">
                      <span>Parsing PDF Structure</span>
                      <span>{Math.round(parsingProgress)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5">
                      <motion.div
                        className="bg-primary/80 h-1.5 rounded-full"
                        animate={{ width: `${parsingProgress}%` }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 text-on-surface-variant">
                      <span>Extracting Metadata</span>
                      <span>{Math.round(metadataProgress)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5">
                      <motion.div
                        className="bg-primary/60 h-1.5 rounded-full"
                        animate={{ width: `${metadataProgress}%` }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
                  Error: {uploadError}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metadata Form - Hidden when upload success */}
        {!uploadSuccess && (
          <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Paper Details</CardTitle>
            <CardDescription>Enter the details for your paper.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conference Website (Auto-detect default flow) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Conference Website
              </label>
              <Input
                placeholder="https://conference-website.org"
                value={conferenceUrl}
                onChange={(e) => setConferenceUrl(e.target.value)}
                disabled={isUploading}
                type="url"
              />
              <p className="text-xs text-on-surface-variant">
                Our AI will automatically extract conference details from this URL. 
                If not found, your paper will be categorized as &quot;Independent Research&quot;.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Title</label>
              <Input 
                placeholder="Paper title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Authors</label>
              <div className="relative">
                <Input
                  placeholder="Type author email and press Enter..."
                  value={authorQuery}
                  onChange={(e) => {
                    setAuthorQuery(e.target.value);
                    setShowAuthorOptions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAuthor(authorQuery.trim());
                    }
                  }}
                  onFocus={() => setShowAuthorOptions(true)}
                  disabled={isUploading}
                />

                {showAuthorOptions && authorQuery.trim().length > 0 && (
                  <div className="absolute z-20 mt-2 w-full bg-surface border border-outline-variant/30 rounded-xl shadow-lg">
                    <button
                      type="button"
                      onClick={() => addAuthor(authorQuery.trim())}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-low transition-colors"
                    >
                      Add &quot;{authorQuery.trim()}&quot;
                    </button>
                  </div>
                )}
              </div>

              {selectedAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedAuthors.map((author) => (
                    <span
                      key={author}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                    >
                      {author}
                      <button
                        type="button"
                        onClick={() => removeAuthor(author)}
                        className="text-blue-700 hover:text-blue-900"
                        aria-label={`Remove ${author}`}
                        disabled={isUploading}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Abstract</label>
              <Textarea 
                placeholder="Paper abstract..." 
                className="min-h-[120px]"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">
                Keywords <span className="text-xs text-on-surface-variant">(comma separated)</span>
              </label>
              <Input 
                placeholder="e.g. Machine Learning, Neural Networks..." 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="pt-6 border-t border-outline-variant/30 flex justify-end gap-4">
              <Button variant="ghost" disabled={isUploading}>Save Draft</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!file || !conferenceUrl || !title || isUploading}
              >
                {isUploading ? 'Processing...' : 'Submit for Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
