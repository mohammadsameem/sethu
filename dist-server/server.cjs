var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);

// src/services/ai.ts
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var ai = new import_genai.GoogleGenAI({});
async function generateAnswer(prompt, systemInstruction) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.2
      // Low temperature for more factual responses
    }
  });
  return response.text || "";
}

// src/services/rag.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var vectorIndex = [];
var isInitialized = false;
async function initializeIndex() {
  if (isInitialized) return;
  const schemesDir = import_path.default.join(process.cwd(), "data", "schemes");
  if (!import_fs.default.existsSync(schemesDir)) {
    console.warn("data/schemes directory not found. Creating it.");
    import_fs.default.mkdirSync(schemesDir, { recursive: true });
    return;
  }
  const files = import_fs.default.readdirSync(schemesDir);
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const filePath = import_path.default.join(schemesDir, file);
    const content = import_fs.default.readFileSync(filePath, "utf-8");
    const schemeName = file.replace(".md", "").replace(/-/g, " ");
    vectorIndex.push({
      id: schemeName,
      schemeName,
      content
    });
  }
  isInitialized = true;
  console.log(`Loaded ${vectorIndex.length} scheme documents into memory.`);
}
async function retrieveRelevantChunks(query, topK = 3) {
  if (!isInitialized) await initializeIndex();
  return vectorIndex;
}

// server.ts
import_dotenv2.default.config();
var app = (0, import_express.default)();
app.use((0, import_cors.default)());
app.use(import_express.default.json());
initializeIndex().catch(console.error);
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const detectionPrompt = `Detect the language of the following query. Then translate it into English. If it is already in English, just output it exactly as the translation.
Return a JSON object with exactly two keys: "detectedLanguage" (string, the name of the language) and "englishQuery" (string, the English translation).

Query: "${message}"`;
    const detectionResponse = await generateAnswer(detectionPrompt, "You are a helpful translation assistant. Output only valid JSON.");
    let detectedLanguage = "English";
    let queryEnglish = message;
    try {
      const cleanJson = detectionResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.detectedLanguage) detectedLanguage = parsed.detectedLanguage;
      if (parsed.englishQuery) queryEnglish = parsed.englishQuery;
    } catch (e) {
      console.error("Failed to parse language detection JSON:", e);
    }
    const relevantChunks = await retrieveRelevantChunks(queryEnglish, 3);
    const context = relevantChunks.map((c) => c.content).join("\n\n---\n\n");
    const systemInstruction = `You are a helpful, trustworthy assistant for Indian government welfare schemes.
Answer the user's question ONLY using the provided context. 
If the answer is not in the context, explicitly say you don't know and advise them to verify against official sources.
Do not invent or guess any eligibility rules or numbers.
Keep the answer clear, plain-spoken, and well-structured.`;
    const prompt = `Context:
${context}

User Question:
${queryEnglish}`;
    let finalAnswerEnglish = await generateAnswer(prompt, systemInstruction);
    let finalOutput = finalAnswerEnglish;
    if (detectedLanguage.toLowerCase() !== "english" && detectedLanguage.toLowerCase() !== "en") {
      const translateResponsePrompt = `Translate the following English answer into ${detectedLanguage}. 
Preserve every fact, number, and eligibility detail exactly. Do not paraphrase away specifics. Output ONLY the translated text.

English Answer:
${finalAnswerEnglish}`;
      finalOutput = await generateAnswer(translateResponsePrompt);
    }
    res.json({ answer: finalOutput, chunksRetrieved: relevantChunks.length, detectedLanguage });
  } catch (error) {
    console.error("Error in /api/chat:", error?.message, error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});
if (process.env.NODE_ENV === "production") {
  app.use(import_express.default.static(import_path2.default.join(process.cwd(), "dist")));
  app.get("*", (req, res) => {
    res.sendFile(import_path2.default.join(process.cwd(), "dist", "index.html"));
  });
}
var PORT = process.env.NODE_ENV === "production" ? process.env.PORT || 3e3 : 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
