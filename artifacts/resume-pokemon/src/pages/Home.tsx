import React, { useState } from "react";
import { UploadArea, type PokemonCardData } from "@/components/UploadArea";
import { PokemonCardResult } from "@/components/PokemonCardResult";

export default function Home() {
  const [cardData, setCardData] = useState<PokemonCardData | null>(null);

  return (
    <div className="min-h-[100dvh] bg-background pixel-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b-4 border-foreground bg-card/90 backdrop-blur z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-foreground bg-accent relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-[4px] bg-foreground -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white border-[3px] border-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="font-display text-lg tracking-tight text-primary">PokéResume</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10">
          <div className="inline-block bg-secondary border-4 border-foreground shadow-sm px-4 py-2 transform -rotate-2">
            <span className="font-display text-xs text-foreground uppercase tracking-widest">
              Wild Career Appeared!
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display text-foreground leading-[1.1] drop-shadow-sm">
            Evolve your <span className="text-primary">career</span> into a legend.
          </h1>

          <p className="text-xl lg:text-2xl font-semibold text-muted-foreground max-w-xl leading-relaxed">
            Turn your boring PDF resume into a holographic, personalized trainer card. Stand out to
            recruiters with stats that actually pop.
          </p>

          <div className="pt-4">
            {cardData ? (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setCardData(null)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border-2 border-white/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="my-auto w-full flex items-center justify-center">
                  <PokemonCardResult data={cardData} onReset={() => setCardData(null)} />
                </div>
              </div>
            ) : (
              <UploadArea onCardReady={setCardData} />
            )}
          </div>

          {!cardData && (
            <div className="flex flex-wrap gap-6 pt-8 border-t-4 border-foreground/10">
              <div className="flex items-center gap-3 font-semibold text-foreground">
                <div className="w-6 h-6 rounded-full bg-accent border-2 border-foreground" />
                <span>Instantly generated</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-foreground">
                <div className="w-6 h-6 rounded-full bg-primary border-2 border-foreground" />
                <span>Beautiful design</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-foreground">
                <div className="w-6 h-6 rounded-full bg-secondary border-2 border-foreground" />
                <span>Fun to share</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <img
            src="/hero-illustration.png"
            alt="Resume transforming into a magical trading card"
            className="relative z-10 w-full max-w-lg mx-auto rounded-2xl border-8 border-foreground shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
          />
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-secondary border-4 border-foreground rounded-full animate-bounce delay-100" />
          <div className="absolute -bottom-12 -left-8 w-24 h-24 bg-accent border-4 border-foreground rounded-full animate-bounce delay-300" />
          <div className="absolute top-1/2 -right-12 w-12 h-12 bg-primary border-4 border-foreground rotate-45 animate-pulse" />
        </div>
      </main>
    </div>
  );
}
