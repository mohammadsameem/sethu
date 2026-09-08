import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { generateAnswer } from './src/services/ai';
import { retrieveRelevantChunks, initializeIndex } from './src/services/rag';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


initializeIndex().catch(console.error);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const detectionPrompt = `Detect the language of the following query. Then translate it into English. If it is already in English, just output it exactly as the translation.
Return a JSON object with exactly two keys: "detectedLanguage" (string, the name of the language) and "englishQuery" (string, the English translation).

Query: "${message}"`;
    
    const detectionResponse = await generateAnswer(detectionPrompt, "You are a helpful translation assistant. Output only valid JSON.");
    let detectedLanguage = "English";
    let queryEnglish = message;
    
    try {
      const cleanJson = detectionResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.detectedLanguage) detectedLanguage = parsed.detectedLanguage;
      if (parsed.englishQuery) queryEnglish = parsed.englishQuery;
    } catch (e) {
      console.error("Failed to parse language detection JSON:", e);
    }
    
    const relevantChunks = await retrieveRelevantChunks(queryEnglish, 3);
    const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');
    
    const systemInstruction = `You are a helpful, trustworthy assistant for Indian government welfare schemes.
Answer the user's question ONLY using the provided context. 
If the answer is not in the context, explicitly say you don't know and advise them to verify against official sources.
Do not invent or guess any eligibility rules or numbers.
Keep the answer clear, plain-spoken, and well-structured.`;

    const prompt = `Context:\n${context}\n\nUser Question:\n${queryEnglish}`;
    let finalAnswerEnglish = await generateAnswer(prompt, systemInstruction);
    
    let finalOutput = finalAnswerEnglish;
    
    const targetLanguage = language || detectedLanguage;
    if (targetLanguage.toLowerCase() !== 'english' && targetLanguage.toLowerCase() !== 'en') {
      const translateResponsePrompt = `Translate the following English answer into ${targetLanguage}. 
Preserve every fact, number, and eligibility detail exactly. Do not paraphrase away specifics. Output ONLY the translated text.

English Answer:
${finalAnswerEnglish}`;
      finalOutput = await generateAnswer(translateResponsePrompt);
    }
    
    res.json({ answer: finalOutput, chunksRetrieved: relevantChunks.length, detectedLanguage, targetLanguage });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message, error);
    const errMsg = error?.message || '';
    const isRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota');
    if (isRateLimit) {
      return res.status(429).json({ 
        error: 'API rate limit reached. Please wait a moment and try again.' 
      });
    }
    res.status(500).json({ error: errMsg || 'Failed to process chat request' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
