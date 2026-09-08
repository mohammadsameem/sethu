import fs from 'fs';
import path from 'path';

interface Chunk {
  id: string;
  schemeName: string;
  content: string;
}

let vectorIndex: Chunk[] = [];
let isInitialized = false;

export async function initializeIndex() {
  if (isInitialized) return;
  
  const schemesDir = path.join(process.cwd(), 'data', 'schemes');
  if (!fs.existsSync(schemesDir)) {
    console.warn('data/schemes directory not found. Creating it.');
    fs.mkdirSync(schemesDir, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(schemesDir);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(schemesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const schemeName = file.replace('.md', '').replace(/-/g, ' ');
    
    vectorIndex.push({
      id: schemeName,
      schemeName,
      content
    });
  }

  isInitialized = true;
  console.log(`Loaded ${vectorIndex.length} scheme documents into memory.`);
}

export async function retrieveRelevantChunks(query: string, topK: number = 3): Promise<Chunk[]> {
  if (!isInitialized) await initializeIndex();
  return vectorIndex;
}
