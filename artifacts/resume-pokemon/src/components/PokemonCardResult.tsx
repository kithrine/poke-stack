import React, { useState, useEffect, useRef, MouseEvent } from "react";
import { PokemonCardData } from "./UploadArea";
import { Button } from "@/components/ui/button";
import { useGenerateCardImage } from "@workspace/api-client-react";
import html2canvas from "html2canvas";

// Rich CSS color system for types
const TYPE_THEMES: Record<
  string,
  { border: string; bgGradient: string; badge: string; accent: string; text: string }
> = {
  Fire: { border: "#e03a3a", bgGradient: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)", badge: "#ff4b1f", accent: "#ff4b1f", text: "#4a1205" },
  Electric: { border: "#f6c324", bgGradient: "linear-gradient(135deg, #fffcdc 0%, #f9d423 100%)", badge: "#f6c324", accent: "#e2a900", text: "#4a3c05" },
  Water: { border: "#2980b9", bgGradient: "linear-gradient(135deg, #e0efff 0%, #89c4f4 100%)", badge: "#3498db", accent: "#2980b9", text: "#0c3b5e" },
  Psychic: { border: "#8e44ad", bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #d2b4de 100%)", badge: "#9b59b6", accent: "#8e44ad", text: "#3d1354" },
  Dragon: { border: "#4a235a", bgGradient: "linear-gradient(135deg, #ebdef0 0%, #b3b6e5 100%)", badge: "#5b2c6f", accent: "#4a235a", text: "#220e2e" },
  Steel: { border: "#7f8c8d", bgGradient: "linear-gradient(135deg, #f4f6f7 0%, #d5d8dc 100%)", badge: "#95a5a6", accent: "#7f8c8d", text: "#2c3e50" },
  Ground: { border: "#d35400", bgGradient: "linear-gradient(135deg, #f9e79f 0%, #e67e22 100%)", badge: "#e67e22", accent: "#d35400", text: "#6e2c00" },
  Flying: { border: "#5dade2", bgGradient: "linear-gradient(135deg, #ebf5fb 0%, #aed6f1 100%)", badge: "#85c1e9", accent: "#5dade2", text: "#1a5276" },
  Ice: { border: "#1abc9c", bgGradient: "linear-gradient(135deg, #e8f8f5 0%, #a3e4d7 100%)", badge: "#48c9b0", accent: "#1abc9c", text: "#0b5345" },
  Dark: { border: "#2c3e50", bgGradient: "linear-gradient(135deg, #808b96 0%, #34495e 100%)", badge: "#34495e", accent: "#2c3e50", text: "#17202a" },
  Ghost: { border: "#512e5f", bgGradient: "linear-gradient(135deg, #f4ecf7 0%, #c39bd3 100%)", badge: "#6c3483", accent: "#512e5f", text: "#2c0b38" },
  Grass: { border: "#27ae60", bgGradient: "linear-gradient(135deg, #e9f7ef 0%, #a9dfbf 100%)", badge: "#2ecc71", accent: "#27ae60", text: "#0e4526" },
  Rock: { border: "#873600", bgGradient: "linear-gradient(135deg, #edbb99 0%, #dc7633 100%)", badge: "#ca6f1e", accent: "#873600", text: "#421800" },
  Fighting: { border: "#922b21", bgGradient: "linear-gradient(135deg, #f2d7d5 0%, #d98880 100%)", badge: "#c0392b", accent: "#922b21", text: "#4a120e" },
  Bug: { border: "#b3c100", bgGradient: "linear-gradient(135deg, #f9fbe7 0%, #d4efdf 100%)", badge: "#cddc39", accent: "#b3c100", text: "#4c5500" },
  Fairy: { border: "#c0392b", bgGradient: "linear-gradient(135deg, #fdedec 0%, #f5b7b1 100%)", badge: "#e74c3c", accent: "#c0392b", text: "#641e16" },
  Poison: { border: "#6c3483", bgGradient: "linear-gradient(135deg, #f5eef8 0%, #d7bde2 100%)", badge: "#8e44ad", accent: "#6c3483", text: "#391b48" },
  Normal: { border: "#839192", bgGradient: "linear-gradient(135deg, #fdfefe 0%, #e5e8e8 100%)", badge: "#95a5a6", accent: "#839192", text: "#424949" },
};

// SVG icons for types
const TypeSymbol = ({ type }: { type: string }) => {
  const t = type.toLowerCase();
  // Using generic geometric shapes as placeholders for type symbols since emojis are banned.
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      {t === 'fire' ? <path d="M12 2C12 2 8 6 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 6 12 2 12 2Z" /> :
       t === 'water' ? <path d="M12 2L6 12C4 15 6 22 12 22C18 22 20 15 18 12L12 2Z" /> :
       t === 'grass' ? <path d="M12 22L12 12C12 12 4 12 4 6C8 6 12 12 12 12C12 12 20 12 20 6C20 6 12 12 12 22Z" /> :
       t === 'electric' ? <path d="M13 2L3 13H12L11 22L21 11H12L13 2Z" /> :
       t === 'psychic' ? <circle cx="12" cy="12" r="8" /> :
       t === 'fighting' ? <path d="M4 10H20V14H4V10Z" /> :
       <circle cx="12" cy="12" r="6" />}
    </svg>
  );
};

interface Props {
  data: PokemonCardData;
  onReset: () => void;
}

export function PokemonCardResult({ data, onReset }: Props) {
  const theme = TYPE_THEMES[data.pokemonType] || TYPE_THEMES.Normal;
  
  const generateImage = useGenerateCardImage();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Reset tilt before capture so the card is flat in the export
      setTilt({ x: 0, y: 0 });
      setGlare({ x: 50, y: 50, opacity: 0 });
      setIsHovered(false);

      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 3,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `${data.name.replace(/\s+/g, "-").toLowerCase()}-pokemon-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    generateImage.mutate({
      data: {
        pokemonType: data.pokemonType,
        name: data.name,
        pokedexEntry: data.pokedexEntry,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.pokemonType, data.name, data.pokedexEntry]);

  const imageUrl = generateImage.data
    ? `data:${generateImage.data.mimeType};base64,${generateImage.data.imageBase64}`
    : null;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt (max 12 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setTilt({ x: rotateX, y: rotateY });
    
    // Calculate glare position (percentages)
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const getHoloStyle = () => {
    if (!isHovered) {
      return {
        background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)',
        opacity: 0.15,
        mixBlendMode: 'color-dodge' as const,
        transition: 'opacity 0.5s ease',
      };
    }
    
    const angle = (tilt.y * 5) + (tilt.x * 5);
    return {
      background: `conic-gradient(from ${angle}deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)`,
      opacity: 0.35,
      mixBlendMode: 'color-dodge' as const,
      transition: 'opacity 0.1s ease',
    };
  };

  return (
    <div className="flex flex-col items-center" style={{ animationName: 'enterCard', animationDuration: '0.8s', animation: 'enterCard 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
      <style>{`
        @property --holo-border-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes holo-border-rotate {
          to { --holo-border-angle: 360deg; }
        }
        @keyframes enterCard {
          0% { opacity: 0; transform: scale(0.5) translateY(50px) rotateX(20deg); }
          60% { transform: scale(1.05) translateY(-10px) rotateX(-5deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); }
        }
        .holo-border-animated {
          background: conic-gradient(from var(--holo-border-angle), #ff0066, #ff6600, #ffdd00, #00ee88, #00aaff, #aa44ff, #ff0066);
          animation: holo-border-rotate 4s linear infinite;
        }
      `}</style>
      
      <div 
        style={{ perspective: '1000px' }} 
        className="w-full max-w-[320px] mx-auto z-10"
      >
        {/* Holographic border wrapper — always animating */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-[2.5/3.5] cursor-pointer holo-border-animated"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
            transformStyle: 'preserve-3d',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
            boxShadow: isHovered
              ? '0 25px 50px rgba(0,0,0,0.45), 0 0 40px rgba(180,80,255,0.35)'
              : '0 12px 28px rgba(0,0,0,0.28), 0 0 20px rgba(180,80,255,0.15)',
            borderRadius: '20px',
            padding: '5px',
          }}
        >
          {/* Inner card — clips overlays */}
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: '16px',
              background: theme.bgGradient,
              padding: '8px',
            }}
          >
          {/* Holographic overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-40" 
            style={getHoloStyle()} 
          />
          
          {/* Glare effect */}
          <div 
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
              opacity: glare.opacity,
              transition: isHovered ? 'opacity 0.1s ease' : 'opacity 0.5s ease',
              mixBlendMode: 'overlay',
            }}
          />

          <div className="relative z-20 flex flex-col h-full rounded-sm border-2 border-[rgba(0,0,0,0.1)] overflow-hidden bg-[rgba(255,255,255,0.4)] backdrop-blur-sm">
            
            {/* Header */}
            <div className="flex justify-between items-start px-2 pt-2 pb-1 relative">
              <div className="flex-1">
                <span className="font-display text-[9px] uppercase tracking-wider text-black/50 block leading-none mb-1">
                  Basic Pokémon
                </span>
                <h2
                  className="font-display font-bold text-black m-0 leading-tight drop-shadow-sm"
                  style={{
                    fontSize: `${
                      data.name.length <= 14 ? 15
                      : data.name.length <= 18 ? 13
                      : data.name.length <= 22 ? 11
                      : data.name.length <= 28 ? 9.5
                      : 8
                    }px`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {data.name}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-sans font-bold text-[#c0392b] text-[18px] leading-none drop-shadow-sm">
                  {data.hp} <span className="text-[12px]">HP</span>
                </span>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm border border-black/20"
                  style={{ backgroundColor: theme.badge }}
                  title={data.typeRationale}
                >
                  <TypeSymbol type={data.pokemonType} />
                </div>
              </div>
            </div>

            {/* Artwork Area */}
            <div className="px-2 pb-1 relative h-[42%]">
              <div className="w-full h-full relative rounded-sm border-[4px] shadow-inner bg-black/10 overflow-hidden" style={{ borderColor: theme.accent }}>
                <div className="absolute inset-0 border border-white/40 pointer-events-none z-10" />
                {imageUrl ? (
                  <img src={imageUrl} alt={data.name} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ background: theme.bgGradient }}>
                    <div className="w-12 h-12 rounded-full border-[3px] border-black/20 relative animate-pulse flex items-center justify-center bg-white/20">
                      <div className="w-full h-[2px] bg-black/20 absolute top-1/2 -translate-y-1/2" />
                      <div className="w-4 h-4 rounded-full border-[2px] border-black/20 bg-white/50 z-10" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 px-3 py-1 flex flex-col justify-between relative bg-white/50">
              {/* Type Rationale Strip */}
              <div className="text-[9px] italic text-black/70 leading-tight border-b border-black/10 pb-1 mb-1 line-clamp-2">
                {data.typeRationale}
              </div>

              {/* Attacks */}
              <div className="flex-1 flex flex-col justify-center space-y-2 py-1">
                {data.attacks.slice(0, 2).map((attack, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex gap-0.5 shrink-0">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shadow-sm border border-black/20"
                        style={{ backgroundColor: theme.badge }}
                      >
                        <TypeSymbol type={data.pokemonType} />
                      </div>
                      {/* Fake second energy cost to look like a real card */}
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shadow-sm border border-black/20 bg-gray-400"
                      >
                        <TypeSymbol type="normal" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-serif font-bold text-black text-[13px] leading-tight flex justify-between">
                        <span>{attack.name}</span>
                        <span className="text-[14px]">{attack.damage}</span>
                      </div>
                      <div className="text-[8.5px] leading-tight text-black/80 font-sans">
                        {attack.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-[2px] w-full mb-1 opacity-20" style={{ backgroundColor: theme.accent }} />

              {/* Flavor Text Box */}
              <div className="border border-black/20 p-1 bg-white/30 rounded-sm mb-1">
                <p className="font-serif italic text-[8.5px] leading-[1.2] text-black/90">
                  {data.pokedexEntry}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <span className="font-sans font-bold text-[8px] text-black/60">
                  Illus. Professor Oak
                </span>
                <div className="flex items-center gap-2 font-sans font-bold text-[8px] text-black/60 tracking-tighter">
                  <span>No. {String(data.hp).padStart(3, '0')}</span>
                  <span>Lv. {data.yearsOfExperience * 5}</span>
                  <span className="text-black/40">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-[320px]">
        <Button
          onClick={handleDownload}
          disabled={isDownloading || generateImage.isPending}
          className="flex-1 border-4 uppercase tracking-wider font-display text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-white hover:text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: theme.badge, borderColor: theme.accent }}
          data-testid="button-download-card"
        >
          {isDownloading ? "Saving..." : generateImage.isPending ? "Generating art..." : "Download Card"}
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 border-4 uppercase tracking-wider font-display text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-white/10 text-white hover:bg-white/20 hover:text-white"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
          data-testid="button-analyze-another"
        >
          New Card
        </Button>
      </div>
    </div>
  );
}
