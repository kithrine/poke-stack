import React from "react";
import { PokemonCardData } from "./UploadArea";
import { Button } from "@/components/ui/button";

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Fire:     { bg: "bg-orange-50",  border: "border-orange-400", text: "text-orange-700",  badge: "bg-orange-500" },
  Electric: { bg: "bg-yellow-50",  border: "border-yellow-400", text: "text-yellow-700",  badge: "bg-yellow-400" },
  Water:    { bg: "bg-blue-50",    border: "border-blue-400",   text: "text-blue-700",    badge: "bg-blue-500" },
  Psychic:  { bg: "bg-pink-50",    border: "border-pink-400",   text: "text-pink-700",    badge: "bg-pink-500" },
  Dragon:   { bg: "bg-indigo-50",  border: "border-indigo-500", text: "text-indigo-700",  badge: "bg-indigo-600" },
  Steel:    { bg: "bg-slate-50",   border: "border-slate-400",  text: "text-slate-700",   badge: "bg-slate-500" },
  Ground:   { bg: "bg-amber-50",   border: "border-amber-400",  text: "text-amber-700",   badge: "bg-amber-600" },
  Flying:   { bg: "bg-sky-50",     border: "border-sky-400",    text: "text-sky-700",     badge: "bg-sky-500" },
  Ice:      { bg: "bg-cyan-50",    border: "border-cyan-400",   text: "text-cyan-700",    badge: "bg-cyan-500" },
  Dark:     { bg: "bg-zinc-100",   border: "border-zinc-600",   text: "text-zinc-800",    badge: "bg-zinc-700" },
  Ghost:    { bg: "bg-purple-50",  border: "border-purple-400", text: "text-purple-700",  badge: "bg-purple-600" },
  Grass:    { bg: "bg-green-50",   border: "border-green-400",  text: "text-green-700",   badge: "bg-green-500" },
  Rock:     { bg: "bg-stone-50",   border: "border-stone-400",  text: "text-stone-700",   badge: "bg-stone-500" },
  Fighting: { bg: "bg-red-50",     border: "border-red-400",    text: "text-red-700",     badge: "bg-red-500" },
  Bug:      { bg: "bg-lime-50",    border: "border-lime-400",   text: "text-lime-700",    badge: "bg-lime-500" },
  Fairy:    { bg: "bg-rose-50",    border: "border-rose-300",   text: "text-rose-600",    badge: "bg-rose-400" },
  Poison:   { bg: "bg-violet-50",  border: "border-violet-400", text: "text-violet-700",  badge: "bg-violet-500" },
  Normal:   { bg: "bg-gray-50",    border: "border-gray-400",   text: "text-gray-700",    badge: "bg-gray-400" },
};

const TYPE_SYMBOL: Record<string, string> = {
  Fire: "🔥", Electric: "⚡", Water: "💧", Psychic: "🔮",
  Dragon: "🐉", Steel: "⚙️", Ground: "🌍", Flying: "💨",
  Ice: "❄️", Dark: "🌑", Ghost: "👻", Grass: "🌿",
  Rock: "🪨", Fighting: "👊", Bug: "🐛", Fairy: "✨",
  Poison: "☠️", Normal: "⭐",
};

function HPBar({ hp }: { hp: number }) {
  const maxHp = 150;
  const pct = Math.min(100, (hp / maxHp) * 100);
  const color = pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-xs text-muted-foreground w-6 shrink-0">HP</span>
      <div className="flex-1 h-3 bg-gray-200 border-2 border-foreground rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-display text-sm font-bold text-foreground w-10 text-right">{hp}</span>
    </div>
  );
}

interface Props {
  data: PokemonCardData;
  onReset: () => void;
}

export function PokemonCardResult({ data, onReset }: Props) {
  const colors = TYPE_COLORS[data.pokemonType] ?? TYPE_COLORS["Normal"];
  const symbol = TYPE_SYMBOL[data.pokemonType] ?? "⭐";

  return (
    <div
      data-testid="pokemon-card-result"
      className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500"
    >
      <div
        className={`relative rounded-2xl border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${colors.bg}`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <p className="font-display text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
              Trainer Card
            </p>
            <h2
              className="font-display text-xl text-foreground leading-tight"
              data-testid="card-name"
            >
              {data.name}
            </h2>
          </div>
          <div className={`${colors.badge} border-4 border-foreground rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-md shrink-0`}>
            <span className="text-xl leading-none">{symbol}</span>
            <span className="font-display text-[8px] text-white leading-tight mt-0.5">
              {data.pokemonType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* HP Bar */}
        <div className="px-4 pb-3">
          <HPBar hp={data.hp} />
        </div>

        {/* Divider */}
        <div className={`h-1 border-y-2 border-foreground ${colors.badge}`} />

        {/* Type rationale */}
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground italic leading-relaxed">
            {data.typeRationale}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-foreground mx-4" />

        {/* Attacks */}
        <div className="px-4 py-3 space-y-3">
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Moves
          </p>
          {data.attacks.map((attack, i) => (
            <div
              key={i}
              className="flex items-start gap-3"
              data-testid={`attack-${i}`}
            >
              <div
                className={`${colors.badge} text-white font-display text-xs w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 shadow-sm`}
              >
                {attack.damage}
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm text-foreground leading-tight">{attack.name}</p>
                <p className="text-xs text-muted-foreground font-medium leading-snug mt-0.5">
                  {attack.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-1 border-y-2 border-foreground ${colors.badge}`} />

        {/* Pokedex Entry */}
        <div className="px-4 py-3">
          <p className="font-display text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
            Pokedex Entry No. {String(data.hp).padStart(3, "0")}
          </p>
          <p
            className="text-xs font-semibold text-foreground leading-relaxed italic"
            data-testid="pokedex-entry"
          >
            "{data.pokedexEntry}"
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-foreground px-4 py-2 flex items-center justify-between bg-card/50">
          <p className="font-display text-[9px] text-muted-foreground uppercase tracking-widest">
            {data.yearsOfExperience} yr{data.yearsOfExperience !== 1 ? "s" : ""} exp
          </p>
          <p className="font-display text-[9px] text-muted-foreground">
            {data.pokemonType.toUpperCase()} TYPE
          </p>
        </div>
      </div>

      <Button
        onClick={onReset}
        variant="outline"
        className="mt-6 w-full border-4 border-foreground font-display text-xs uppercase tracking-wider py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        data-testid="button-analyze-another"
      >
        Analyze Another Resume
      </Button>
    </div>
  );
}
