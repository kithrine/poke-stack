import { Router } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const router = Router();

const TYPE_BASE: Record<string, string> = {
  Fire: "a fierce phoenix-dragon hybrid made of living fire and molten circuitry, wings ablaze in orange and crimson, glowing amber eyes",
  Electric: "a sleek electric feline crackling with neon lightning, translucent body filled with glowing circuits, electric arcs dancing between its whiskers",
  Water: "a graceful aquatic serpent with crystalline scales that refract light, flowing fins like ocean waves, deep teal iridescent body",
  Psychic: "a mysterious levitating brain-like entity with a glowing third eye, surrounded by swirling geometric shapes and nebula-like psychic energy",
  Dragon: "a majestic ancient dragon made of dark matter and starlight, scales glowing deep indigo and gold, wearing a crown of binary code",
  Steel: "a sleek mechanical golem with chrome plating, glowing blue core energy visible through its chest, precision gears and circuits exposed under armor",
  Ground: "a sturdy stone titan built from layered earth and ancient rock, golden veins of ore running through its body, mossy stone texture",
  Flying: "an elegant cloud-winged creature with a body made of layered cumulus clouds, feathers that shimmer like northern lights, weightless and serene",
  Ice: "a crystalline ice phoenix with wings made of perfect snowflake geometry, cool cyan and white body, leaving trails of frost",
  Dark: "a shadowy void creature with a body made of flowing dark energy, glowing red eyes, wrapped in chains and dark digital shadows",
  Ghost: "a spectral semi-transparent entity filled with glowing synaptic connections, wisps of neural energy trailing behind it, deep violet",
  Grass: "a nature spirit made of living data vines and glowing green leaves, small flowers blooming along its body, carrying a staff of twisted roots",
  Rock: "a crystal golem built from stacked data cubes and hexagonal stone, gemstones embedded in its body, sturdy and ancient",
  Fighting: "a powerful warrior spirit with a body that pulses with rhythmic energy, wearing a gi made of velocity lines, battle-ready stance",
  Bug: "a vibrant caterpillar-like creature made of colorful code strings, antennae sparking with learning potential, bright lime green and yellow",
  Fairy: "a magical design fairy with wings made of flowing gradients, a wand that draws glowing UI wireframes, whimsical and precise, rose gold",
  Poison: "a proud ancient serpent wrapped in glowing purple scrolls, toxic-green digital vines coiling around its body, archaic and mysterious",
  Normal: "a friendly shapeshifter that shimmers between many forms, warm neutral colors, adaptable and approachable with a subtle inner glow",
};

const COMMON_WORDS = new Set([
  "rapid", "strike", "blast", "burn", "surge", "dash", "slash", "wave",
  "pulse", "force", "rush", "storm", "ray", "bolt", "shot", "beam",
  "smash", "crash", "burst", "flare", "lock", "break", "drive", "charge",
  "attack", "move", "technique", "skill", "power", "style", "flow",
  "deploy", "execute", "launch", "process", "run", "build", "render",
  "engine", "system", "core", "arc", "inferno", "cascade", "barrage",
]);

function extractTechKeywords(attacks: Array<{ name: string; description: string }>): string[] {
  const keywords: string[] = [];
  for (const attack of attacks) {
    const words = attack.name.split(/[\s\-_./]+/);
    for (const word of words) {
      const clean = word.replace(/[^a-zA-Z0-9.#+]/g, "");
      if (clean.length >= 3 && !COMMON_WORDS.has(clean.toLowerCase())) {
        keywords.push(clean);
      }
    }
    const descWords = attack.description.match(/\b[A-Z][a-zA-Z0-9.#+]{2,}\b/g) ?? [];
    for (const w of descWords) {
      if (!COMMON_WORDS.has(w.toLowerCase()) && !keywords.includes(w)) {
        keywords.push(w);
      }
    }
  }
  return [...new Set(keywords)].slice(0, 5);
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

  const baseDescription = TYPE_BASE[pokemonType] ?? "a friendly creature made of glowing code and digital energy";
  const techKeywords = attacks ? extractTechKeywords(attacks) : [];

  const techMarkings = techKeywords.length > 0
    ? `Its body is distinctly marked with glowing runes and symbols representing ${techKeywords.join(", ")} — these appear as luminous sigils etched into its scales, wings, or armor.`
    : "";

  const attackFlavour = attacks && attacks.length > 0
    ? `Its two signature abilities are named "${attacks[0].name}" and "${attacks[1]?.name ?? attacks[0].name}", visually hinting at mastery of ${techKeywords.slice(0, 2).join(" and ") || pokemonType}-based power.`
    : "";

  const uniqueSeed = `This specific specimen is named ${name} and has a unique aura — ${pokedexEntry ? pokedexEntry.slice(0, 120) : "a rare and powerful being"}.`;

  const prompt = [
    `Classic Pokémon trading card artwork style illustration:`,
    baseDescription + ".",
    techMarkings,
    attackFlavour,
    uniqueSeed,
    `Painted in the iconic Nintendo/Game Freak Pokémon card watercolor-illustration style.`,
    `Centered subject on a clean gradient background matching the ${pokemonType} type color palette.`,
    `Vibrant, high-detail, professional card art. No text. No card frame. Just the creature.`,
  ]
    .filter(Boolean)
    .join(" ");

  req.log.info({ pokemonType, name, techKeywords }, "Generating personalized Pokemon card image");

  try {
    const imageBuffer = await generateImageBuffer(prompt, "1024x1024");
    const imageBase64 = imageBuffer.toString("base64");

    req.log.info({ pokemonType, name }, "Pokemon card image generated successfully");

    res.json({ imageBase64, mimeType: "image/png" });
  } catch (error) {
    req.log.error({ err: error, pokemonType, name }, "Failed to generate card image");
    res.status(500).json({ error: "Failed to generate card image" });
  }
});

export default router;
