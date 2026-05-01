import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PokemonAttack {
  name: string;
  damage: number;
  description: string;
}

export interface PokemonCardData {
  name: string;
  pokemonType: string;
  typeRationale: string;
  hp: number;
  attacks: PokemonAttack[];
  pokedexEntry: string;
  yearsOfExperience: number;
}

interface UploadAreaProps {
  onCardReady: (data: PokemonCardData) => void;
}

type UploadPhase = "idle" | "uploading" | "analyzing" | "error";

const PHASE_MESSAGES: Record<UploadPhase, { title: string; subtitle: string }> = {
  idle: { title: "", subtitle: "" },
  uploading: { title: "Uploading...", subtitle: "Transferring your resume to the lab..." },
  analyzing: { title: "Analyzing...", subtitle: "Professor Oak is studying your stats..." },
  error: { title: "", subtitle: "" },
};

export function UploadArea({ onCardReady }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<UploadPhase>("idle");
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".doc", ".docx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      throw new Error("Invalid file type. Please upload a PDF or Word document.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File is too large. Maximum size is 5MB.");
    }
  };

  const processFile = async (file: File) => {
    try {
      validateFile(file);
      setErrorMessage("");

      setPhase("uploading");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed. Please try again.");
      }

      const uploadData = await uploadRes.json();
      const { filename } = uploadData;

      setPhase("analyzing");
      const analyzeRes = await fetch(`/api/resume/analyze/${encodeURIComponent(filename)}`, {
        method: "POST",
      });

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Analysis failed. Please try again.");
      }

      const cardData: PokemonCardData = await analyzeRes.json();
      onCardReady(cardData);
      setPhase("idle");
    } catch (err: unknown) {
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const isProcessing = phase === "uploading" || phase === "analyzing";

  if (isProcessing) {
    const msg = PHASE_MESSAGES[phase];
    return (
      <div
        data-testid="processing-state"
        className="w-full max-w-md mx-auto p-12 border-4 border-foreground bg-card shadow-xl rounded-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in"
      >
        <div className="pokeball" />
        <div className="text-center space-y-2">
          <h3 className="font-display text-xl text-primary">{msg.title}</h3>
          <p className="text-muted-foreground font-semibold">{msg.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        data-testid="upload-dropzone"
        className={cn(
          "relative group p-10 flex flex-col items-center justify-center border-4 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10 scale-105 shadow-xl"
            : "border-foreground bg-card hover:border-primary hover:bg-muted/50 shadow-lg hover:shadow-xl",
          phase === "error" && "border-destructive bg-destructive/10"
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
          data-testid="file-input"
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

      {phase === "error" && (
        <div className="mt-6 p-4 bg-destructive border-4 border-foreground rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display text-sm text-white mb-1">
              It hurt itself in its confusion!
            </h4>
            <p className="text-destructive-foreground font-medium text-sm">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhase("idle");
              }}
              className="mt-2 text-white underline text-xs font-semibold"
              data-testid="button-retry"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
