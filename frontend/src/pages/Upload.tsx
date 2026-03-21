import { useState } from "react";
import { UploadCloud, File, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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
        {/* Drag & Drop Zone */}
        <Card className="border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest transition-colors hover:bg-surface-container-low/50">
          <CardContent className="p-12">
            <div
              className={`flex flex-col items-center justify-center text-center transition-all ${
                isDragging ? "scale-105" : ""
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
              <Button variant="outline">Select File</Button>
              <p className="text-xs text-on-surface-variant mt-4">Supported formats: PDF, LaTeX (zip). Max size: 50MB.</p>
            </div>
          </CardContent>
        </Card>

        {/* System Engine Status (Mockup) */}
        {file && (
          <Card className="border border-outline-variant/30 shadow-ambient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                System Engine Status
              </CardTitle>
              <CardDescription>Meta-agents are analyzing your submission...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                <File className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-on-surface">{file.name}</p>
                  <p className="text-xs text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Extracting Metadata</span>
                    <span className="text-primary">100%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Verifying Citations</span>
                    <span className="text-primary">65%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-[65%] animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-on-surface-variant">Methodology Check</span>
                    <span className="text-on-surface-variant">Pending</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5">
                    <div className="bg-surface-container-high h-1.5 rounded-full w-0"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verify Metadata Form */}
        <Card className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle>Verify Metadata</CardTitle>
            <CardDescription>Please review the automatically extracted information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Title</label>
              <Input placeholder="Paper title..." defaultValue={file ? "Extracted Title from PDF" : ""} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Authors</label>
              <Input placeholder="Comma separated list of authors..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Abstract</label>
              <Textarea placeholder="Paper abstract..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Tags</label>
              <Input placeholder="e.g. Machine Learning, Quantum Physics..." />
            </div>
            
            <div className="pt-6 border-t border-outline-variant/30 flex justify-end gap-4">
              <Button variant="ghost">Save Draft</Button>
              <Button disabled={!file}>Submit for Review</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
