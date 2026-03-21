import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, File, CheckCircle2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

export function Upload() {
  const location = useLocation();
  const conferenceFromQuery = new URLSearchParams(location.search).get('conference') ?? '';

  const conferenceOptions = [
    'NeurIPS 2024',
    'ICML 2024',
    'CVPR 2024',
    'RSS 2025',
    'SIGGRAPH 2024',
    'ICRA 2025',
    'Neural Architectures 2024',
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const parsingProgress = Math.min(100, uploadProgress * 1.2);
  const metadataProgress = Math.max(0, Math.min(100, (uploadProgress - 30) * 1.43));
  
  // Form state
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [conferenceQuery, setConferenceQuery] = useState(conferenceFromQuery);
  const [selectedConference, setSelectedConference] = useState(conferenceFromQuery);
  const [showConferenceOptions, setShowConferenceOptions] = useState(false);

  const filteredConferenceOptions = conferenceOptions.filter((conference) =>
    conference.toLowerCase().includes(conferenceQuery.toLowerCase())
  );

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

  const handleSubmit = () => {
    // Mock upload - no backend connection
    setIsUploading(true);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          alert('Paper uploaded successfully! (Mock - no backend connected)');
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
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
        {/* Drag & Drop Zone */}
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

        {/* File Info & Upload Progress */}
        {file && (
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
            </CardContent>
          </Card>
        )}

        {/* Metadata Form */}
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Paper Details</CardTitle>
            <CardDescription>Enter the details for your paper.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Conference</label>
              <div className="relative">
                <Input
                  placeholder="Type conference name to search..."
                  value={conferenceQuery}
                  onChange={(e) => {
                    setConferenceQuery(e.target.value);
                    setSelectedConference('');
                    setShowConferenceOptions(true);
                  }}
                  onFocus={() => setShowConferenceOptions(true)}
                  disabled={isUploading}
                />

                {showConferenceOptions && conferenceQuery.trim().length > 0 && (
                  <div className="absolute z-20 mt-2 w-full bg-surface border border-outline-variant/30 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {filteredConferenceOptions.length > 0 ? (
                      filteredConferenceOptions.map((conference) => (
                        <button
                          key={conference}
                          type="button"
                          onClick={() => {
                            setConferenceQuery(conference);
                            setSelectedConference(conference);
                            setShowConferenceOptions(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-surface-container-low transition-colors"
                        >
                          {conference}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-on-surface-variant">No conference found</div>
                    )}
                  </div>
                )}
              </div>
              {selectedConference && (
                <p className="text-xs text-primary">Selected conference: {selectedConference}</p>
              )}
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
              <label className="text-sm font-medium text-on-surface">
                Authors <span className="text-xs text-on-surface-variant">(comma separated)</span>
              </label>
              <Input 
                placeholder="e.g. John Doe, Jane Smith..." 
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                disabled={isUploading}
              />
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
                disabled={!file || !selectedConference || isUploading}
              >
                {isUploading ? 'Processing...' : 'Submit for Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
