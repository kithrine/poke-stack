import { Router } from "express";
import path from "path";
import fs from "fs";
// Import internal path to avoid pdf-parse's test file being loaded at startup
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

async function extractText(filePath: string, mimetype: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  if (mimetype === "application/pdf" || filePath.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".doc") ||
    filePath.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

const SYSTEM_PROMPT = `You are a quirky Pokémon professor who analyzes professional resumes and assigns Pokémon card attributes.

POKEMON TYPE MAPPING (use these exact types):
- Fire: Full-stack developers, generalists who work across the entire stack
- Electric: Frontend developers, UI/UX engineers, React/Vue/Angular specialists
- Water: Backend developers, API developers, server-side specialists
- Psychic: Data scientists, analysts, ML/AI engineers, researchers, statisticians
- Dragon: Senior engineers (10+ years), principal engineers, tech leads, architects, CTOs
- Steel: Security engineers, penetration testers, cybersecurity specialists, DevSecOps
- Ground: DevOps engineers, SRE, infrastructure engineers, platform engineers, cloud architects
- Flying: Cloud engineers, AWS/GCP/Azure specialists, serverless developers
- Ice: QA engineers, test automation engineers, software testers, quality assurance
- Dark: Blockchain developers, Web3 engineers, smart contract developers
- Ghost: Machine learning engineers, AI researchers, deep learning specialists
- Grass: Data engineers, ETL developers, pipeline engineers, Spark/Hadoop specialists
- Rock: Database administrators, data architects, SQL specialists
- Fighting: Agile coaches, Scrum masters, engineering managers, product managers
- Bug: Junior developers (0-2 years), bootcamp graduates, entry-level engineers
- Fairy: UX designers who code, design engineers, creative technologists, accessibility engineers
- Poison: Legacy code maintainers, COBOL developers, maintenance engineers, technical debt specialists
- Normal: General software engineers, versatile developers, no strong specialization

HP CALCULATION:
- 0-1 years: 30-50 HP (bug-level)
- 2-3 years: 50-70 HP
- 4-6 years: 70-90 HP
- 7-10 years: 90-110 HP
- 11-15 years: 110-130 HP
- 15+ years: 130-150 HP
Base HP is 40, add 6 per year of experience.

ATTACKS:
Create 2-3 attacks based on their actual technical skills. Make them sound like Pokémon moves but reference real technologies.
Each attack has:
- name: A creative Pokémon-style move name referencing their skill (e.g. "React Rapid Strike", "SQL Seismic Toss", "Docker Deploy Dash")
- damage: 10-80 damage based on how advanced/rare the skill is
- description: One short sentence describing the attack effect

POKEDEX ENTRY:
Write a single funny, affectionate Pokédex-style description in 1-2 sentences. Reference their actual skills/experience. Make it sound like a real Pokédex entry.

Always respond with valid JSON only, no markdown, no extra text.`;

const USER_PROMPT_TEMPLATE = (resumeText: string) => `
Analyze this resume and return a JSON object with exactly these fields:
{
  "name": "Full name from resume",
  "pokemonType": "One of the exact type names from the mapping",
  "typeRationale": "One sentence explaining why this type was chosen",
  "hp": <number>,
  "attacks": [
    { "name": "Attack Name", "damage": <number>, "description": "Short description" }
  ],
  "pokedexEntry": "Funny Pokédex-style description",
  "yearsOfExperience": <number>
}

RESUME TEXT:
${resumeText.slice(0, 8000)}
`;

router.post("/resume/analyze/:filename", async (req, res) => {
  const { filename } = req.params;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  try {
    const ext = path.extname(filename).toLowerCase();
    const mimetype =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";

    req.log.info({ filename }, "Extracting text from resume");
    const resumeText = await extractText(filePath, mimetype);

    if (!resumeText || resumeText.trim().length < 50) {
      res.status(400).json({ error: "Could not extract readable text from the file" });
      return;
    }

    req.log.info({ filename, textLength: resumeText.length }, "Analyzing resume with AI");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT_TEMPLATE(resumeText) },
      ],
      response_format: { type: "json_object" },
    });

    const choice = completion.choices[0];
    const finishReason = choice?.finish_reason;
    const raw = choice?.message?.content ?? "";

    if (finishReason === "length" || !raw) {
      req.log.error(
        { filename, finishReason, rawLength: raw.length, tokens: completion.usage },
        "AI response was truncated or empty"
      );
      res.status(500).json({ error: "AI response was truncated. Please try again." });
      return;
    }

    const cardData = JSON.parse(raw);

    req.log.info({ filename, pokemonType: cardData.pokemonType }, "Resume analyzed successfully");

    res.json(cardData);
  } catch (error) {
    req.log.error({ err: error, filename }, "Failed to analyze resume");
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

export default router;
