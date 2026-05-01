import { Router } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const router = Router();

const TYPE_PROMPTS: Record<string, string> = {
  Fire: "a fierce phoenix-dragon hybrid creature made of living fire and code, with circuit-board wings ablaze in orange and red, glowing amber eyes, floating embers swirling around it",
  Electric: "a sleek electric cat creature crackling with neon lightning, translucent body filled with glowing circuits, electric arcs dancing between its whiskers, vivid yellow and white energy",
  Water: "a graceful aquatic serpent creature with crystalline scales that refract light, flowing fins like ocean waves, deep ocean blue and teal iridescent body, gentle water droplets floating around it",
  Psychic: "a mysterious levitating brain-like creature with glowing third eye, surrounded by floating geometric shapes and nebula-like psychic energy, pink and purple iridescent aura",
  Dragon: "a majestic ancient dragon made of dark matter and starlight, scales glowing with deep indigo and gold, wearing a crown of binary code, radiating immense aura and wisdom",
  Steel: "a sleek mechanical golem creature with silver and chrome plating, glowing blue core energy visible through its chest, precision gears and circuits visible under its armor, fortress-like and imposing",
  Ground: "a sturdy stone titan creature built from layered earth and ancient rock, golden veins of ore running through its body, deeply rooted and powerful, mossy stone texture with amber glow",
  Flying: "an elegant cloud-winged creature with a body made of layered cumulus clouds and sky, feathers that shimmer like northern lights, weightless and serene, light blue and silver",
  Ice: "a crystalline ice phoenix creature with wings made of perfect snowflake geometry, cool cyan and white body, leaving trails of frost and frozen code, precise and beautiful",
  Dark: "a shadowy void creature with a body made of flowing dark energy and digital shadows, glowing red eyes, chains made of blockchain hashes, mysterious and powerful",
  Ghost: "a spectral neural network creature, semi-transparent body filled with glowing synaptic connections, wisps of neural energy trailing behind it, purple and deep violet",
  Grass: "a nature spirit creature made of living data vines and glowing green leaves, small flowers blooming along its body, carrying a staff of twisted roots, emerald and forest green",
  Rock: "a crystal golem creature built from stacked data cubes and hexagonal stone, gemstones embedded in its body that glow with database queries, sturdy and ancient",
  Fighting: "a powerful warrior spirit creature with a body that pulses with rhythmic energy like a sprint, wearing a karate gi made of velocity lines, ready stance, orange and gold aura",
  Bug: "a cute caterpillar-like creature made of colorful code strings, antennae that spark with learning potential, hopeful and energetic, bright lime green and yellow",
  Fairy: "a magical design fairy creature with wings made of flowing CSS gradients, a wand that draws perfect UI components, whimsical and precise, rose gold and iridescent pink",
  Poison: "a proud ancient serpent creature wrapped in glowing purple code scrolls, toxic-green digital vines wrapping its body, archaic and mysterious, deep purple and green",
  Normal: "a friendly and versatile shapeshifter creature that shimmers between many forms, warm neutral colors, a friendly face with a subtle glow, adaptable and approachable",
};

const DEFAULT_PROMPT =
  "a friendly creature made of glowing code and digital energy, warm colors, magical aura";

router.post("/resume/card-image", async (req, res) => {
  const { pokemonType, name, pokedexEntry } = req.body as {
    pokemonType?: string;
    name?: string;
    pokedexEntry?: string;
  };

  if (!pokemonType || !name) {
    res.status(400).json({ error: "pokemonType and name are required" });
    return;
  }

  const typeDescription = TYPE_PROMPTS[pokemonType] ?? DEFAULT_PROMPT;

  const prompt = [
    `Classic Pokemon trading card artwork style illustration:`,
    typeDescription,
    `This creature represents "${name}", a ${pokemonType}-type trainer.`,
    pokedexEntry ? `Inspired by: "${pokedexEntry}"` : "",
    `Painted in the iconic Nintendo/Game Freak Pokemon card watercolor-illustration style.`,
    `Centered subject on a clean gradient background matching the ${pokemonType} type color palette.`,
    `Vibrant, high-detail, professional card art. No text. No card frame. Just the creature.`,
  ]
    .filter(Boolean)
    .join(" ");

  req.log.info({ pokemonType, name }, "Generating Pokemon card image");

  try {
    const imageBuffer = await generateImageBuffer(prompt, "1024x1024");
    const imageBase64 = imageBuffer.toString("base64");

    req.log.info({ pokemonType, name }, "Pokemon card image generated successfully");

    res.json({
      imageBase64,
      mimeType: "image/png",
    });
  } catch (error) {
    req.log.error({ err: error, pokemonType, name }, "Failed to generate card image");
    res.status(500).json({ error: "Failed to generate card image" });
  }
});

export default router;
