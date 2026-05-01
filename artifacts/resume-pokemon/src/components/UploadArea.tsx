import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      throw new Error("Invalid file type. Please upload a PDF or Word document.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File is too large. Maximum size is 5MB.");
    }
  };

  const uploadFile = async (file: File) => {
    try {
      validateFile(file);
      setIsUploading(true);
      setUploadStatus("idle");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed. Please try again.");
      }

      setUploadStatus("success");
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  if (isUploading) {
    return (
      <div className="w-full max-w-md mx-auto p-12 border-4 border-foreground bg-card shadow-xl rounded-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in">
        <div className="pokeball" />
        <div className="text-center space-y-2">
          <h3 className="font-display text-xl text-primary">Processing...</h3>
          <p className="text-muted-foreground font-semibold">Extracting your stats...</p>
        </div>
      </div>
    );
  }

  if (uploadStatus === "success") {
    return (
      <div className="w-full max-w-md mx-auto p-8 border-4 border-foreground bg-green-50 shadow-xl rounded-xl flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-500 border-4 border-foreground rounded-full flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="font-display text-xl text-green-700 mb-2">Caught It!</h3>
          <p className="text-green-800 font-semibold mb-6">Your resume has been successfully digitized.</p>
          <Button 
            onClick={() => setUploadStatus("idle")}
            className="bg-green-600 hover:bg-green-700 text-white border-2 border-foreground shadow-sm font-display text-xs px-6 py-6"
          >
            Upload Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "relative group p-10 flex flex-col items-center justify-center border-4 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10 scale-105 shadow-xl" 
            : "border-foreground bg-card hover:border-primary hover:bg-muted/50 shadow-lg hover:shadow-xl",
          uploadStatus === "error" && "border-destructive bg-destructive/10"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        
        <div className="mb-6 bg-secondary text-foreground p-5 rounded-full border-4 border-foreground shadow-sm group-hover:scale-110 transition-transform duration-300">
          <UploadCloud className="w-10 h-10" />
        </div>
        
        <h3 className="font-display text-lg text-center mb-2 leading-relaxed">
          Drop your resume to evolve
        </h3>
        <p className="text-muted-foreground font-semibold text-center mb-6">
          PDF or Word doc (Max 5MB)
        </p>
        
        <Button 
          variant="default" 
          className="pointer-events-none bg-primary hover:bg-primary/90 text-white border-4 border-foreground shadow-md font-display text-xs px-8 py-6 w-full uppercase tracking-wider"
        >
          Choose File
        </Button>
      </div>
      
      {uploadStatus === "error" && (
        <div className="mt-6 p-4 bg-destructive border-4 border-foreground rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display text-sm text-white mb-1">It hurt itself in its confusion!</h4>
            <p className="text-destructive-foreground font-medium text-sm">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
