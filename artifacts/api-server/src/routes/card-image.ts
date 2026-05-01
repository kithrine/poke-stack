import { Router } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const router = Router();

const TYPE_PALETTE: Record<string, string> = {
  Fire: "orange, crimson, and molten gold color palette with fire and heat energy effects",
  Electric: "electric yellow and stark white color palette with crackling lightning and static energy",
  Water: "deep ocean blue and teal color palette with flowing water and crystalline energy effects",
  Psychic: "vivid pink and deep violet color palette with swirling psychic aura and floating orbs",
  Dragon: "dark indigo and metallic gold color palette with ancient cosmic and starlight energy",
  Steel: "chrome silver and electric blue color palette with mechanical precision and armor plating",
  Ground: "amber, terracotta, and earthy brown color palette with stone and seismic energy",
  Flying: "sky blue and silver-white color palette with wind currents and aerial energy",
  Ice: "glacial cyan and frost white color palette with crystalline ice and snowflake energy",
  Dark: "deep charcoal and blood-red color palette with shadowy void and dark energy effects",
  Ghost: "spectral violet and deep purple color palette with ethereal glow and wisp energy",
  Grass: "emerald green and forest gold color palette with living vines and nature energy",
  Rock: "slate gray and amber color palette with crystal formations and earth energy",
  Fighting: "deep red and orange-gold color palette with kinetic impact and martial energy",
  Bug: "lime green and bright yellow color palette with bioluminescent and organic energy",
  Fairy: "rose gold and iridescent pastel color palette with sparkle dust and enchantment energy",
  Poison: "deep purple and toxic green color palette with venomous mist and alchemical energy",
  Normal: "warm beige and soft gold color palette with balanced versatile energy",
};

const CREATURE_ARCHETYPES = [
  "a fox-like four-legged creature with a bushy tail and pointed ears",
  "a bipedal lizard creature standing upright with small arms",
  "a round armadillo-like creature with a heavy rolled shell",
  "a jellyfish-like floating creature with trailing luminous tendrils",
  "a praying mantis-like insectoid creature with scythe forearms",
  "a wide crab-like creature with large asymmetric claws",
  "a sleek otter-like creature with a sinuous streamlined body",
  "a legless serpentine creature with a broad hood like a cobra",
  "a stocky bear-like creature with a wide head and chunky paws",
  "a tall elegant deer-like creature with elaborate antler formations",
  "a rotund frog-like creature with wide eyes and powerful hind legs",
  "a radially symmetric starfish-like creature with five distinct limbs",
  "a long centipede-like creature with many paired glowing legs",
  "a compact hedgehog-like creature covered in spines",
  "a chameleon-like creature with a curling tail and pivoting eyes",
  "a horse-like creature with a flowing mane and tail",
  "a squid-like creature with a bulbous head and eight arms",
  "a tortoise-like creature with a domed geometric shell",
  "a ferret-like elongated creature with nimble paws",
  "a gorilla-like creature with massive knuckle-walking arms",
];

const TECH_VISUALS: Record<string, string> = {
  react: "crystalline modular body segments that lock together like UI components, glowing blue atom symbols etched into its surface",
  angular: "strict bilateral symmetry with angular geometric facial plates and sharp precise edges",
  vue: "dual-layered translucent fins with reactive color-shifting patterns",
  node: "parallel fiber-optic channel lines running along its spine, green glowing cores",
  python: "smooth iridescent scales arranged in nested spiral loop patterns",
  java: "thick armored plating with hexagonal version-stamp markings and orange oak leaf motifs",
  docker: "segmented hexagonal container-shell panels stacked on its back like cargo",
  kubernetes: "orbital ring structures floating around it like a solar system",
  aws: "cloud-wisp extensions trailing from its limbs like cumulus wisps",
  kafka: "streaming data-flow tendrils carrying glowing message packets",
  redis: "speed-blur afterimage trails and lightning-fast reflex markings",
  postgres: "crystalline structured formations like database table grids on its body",
  mongodb: "amorphous flexible document-like extensions that reshape organically",
  typescript: "precise angular geometric crystal formations with strict clean type edges",
  rust: "iron-orange oxidation bloom patterns spreading across rust-textured plating",
  go: "aerodynamic fins and minimal clean streamlined gopher-like proportions",
  graphql: "network graph constellation pattern glowing on its underbelly",
  tailwind: "smooth color-gradient banding across its body like utility strips",
  express: "lightweight barely-visible framework lines etched like wireframe scaffolding",
  django: "emerald green lattice patterns like organized framework bricks",
  rails: "ruby-red gem embedded prominently on its forehead",
  spring: "green leaf spring coil patterns along its joints",
  nextjs: "server-glow halo effect and hybrid rendered shimmer",
  redux: "predictable state tree ring patterns on its torso",
  tailwindcss: "spectrum gradient utility-strip markings across its body",
  kubernetes: "orbital cluster ring system floating around its form",
};

function pickArchetype(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
  }
  return CREATURE_ARCHETYPES[hash % CREATURE_ARCHETYPES.length];
}

function extractTechKeywords(attacks: Array<{ name: string; description: string }>): string[] {
  const keywords: string[] = [];
  const skipWords = new Set([
    "rapid", "strike", "blast", "burn", "surge", "dash", "slash", "wave",
    "pulse", "force", "rush", "storm", "ray", "bolt", "shot", "beam",
    "smash", "crash", "burst", "flare", "lock", "break", "drive", "charge",
    "attack", "move", "technique", "skill", "power", "style", "flow",
    "deploy", "execute", "launch", "process", "run", "build", "render",
    "engine", "system", "core", "arc", "inferno", "cascade", "barrage",
    "nexus", "combo", "heavy", "snappy", "precise", "using", "with", "and",
    "the", "its", "for", "from", "into", "this", "that", "which",
  ]);
  for (const attack of attacks) {
    const words = attack.name.split(/[\s\-_./]+/);
    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z0-9.#+]/g, "");
      if (clean.length >= 2 && !skipWords.has(clean.toLowerCase())) {
        keywords.push(clean);
      }
    }
    const descWords = attack.description.match(/\b[A-Za-z][a-zA-Z0-9.#+]{2,}\b/g) ?? [];
    for (const w of descWords) {
      if (!skipWords.has(w.toLowerCase()) && !keywords.includes(w)) {
        keywords.push(w);
      }
    }
  }
  return [...new Set(keywords.map(k => k.toLowerCase()))].slice(0, 4);
}

function buildTechVisuals(keywords: string[]): string {
  const visuals: string[] = [];
  for (const kw of keywords) {
    const match = TECH_VISUALS[kw.toLowerCase()];
    if (match) visuals.push(match);
    if (visuals.length >= 2) break;
  }
  return visuals.join("; ");
}

router.post("/resume/card-image", async (req, res) => {
  const { pokemonType, name, pokedexEntry, attacks } = req.body as {
    pokemonType?: string;
    name?: string;
    pokedexEntry?: string;
    attacks?: Array<{ name: string; description: string }>;
  };

  if (!pokemonType || !name) {
    res.status(400).json({ error: "pokemonType and name are required" });
    return;
  }

  const palette = TYPE_PALETTE[pokemonType] ?? "vivid mixed color palette with magical energy";
  const archetype = pickArchetype(name);
  const techKeywords = attacks ? extractTechKeywords(attacks) : [];
  const techVisuals = buildTechVisuals(techKeywords);

  const techLine = techVisuals
    ? `Uniquely, this creature's body shows: ${techVisuals}.`
    : techKeywords.length > 0
      ? `The creature bears unique markings representing its mastery of ${techKeywords.slice(0, 3).join(", ")}.`
      : "";

  const prompt = [
    `Classic Pokémon trading card artwork style illustration.`,
    `Design an original creature in the form of ${archetype}.`,
    `It uses a ${palette}.`,
    techLine,
    `This individual creature is uniquely named ${name} — ${pokedexEntry ? pokedexEntry.slice(0, 100) : "a rare and powerful being"}.`,
    `IMPORTANT: The creature body shape must strictly be ${archetype}. Do NOT substitute a bird, phoenix, or dragon unless the archetype specifies it.`,
    `Painted in the iconic Nintendo/Game Freak Pokémon card watercolor-illustration style.`,
    `Centered subject on a clean gradient background. Vibrant, high-detail, professional card art. No text. No card frame. Just the creature.`,
  ]
    .filter(Boolean)
    .join(" ");

  req.log.info({ pokemonType, name, archetype, techKeywords }, "Generating personalized Pokemon card image");

  try {
    const imageBuffer = await generateImageBuffer(prompt, "1024x1024");
    const imageBase64 = imageBuffer.toString("base64");

    req.log.info({ pokemonType, name, archetype }, "Pokemon card image generated successfully");

    res.json({ imageBase64, mimeType: "image/png" });
  } catch (error) {
    req.log.error({ err: error, pokemonType, name }, "Failed to generate card image");
    res.status(500).json({ error: "Failed to generate card image" });
  }
});

export default router;
