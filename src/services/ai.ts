export async function generateAnswer(prompt: string, systemInstruction?: string): Promise<string> {
  const model = 'llama3';
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || '';
  } catch (error: any) {
    console.error("Failed to generate answer from Ollama:", error);
    throw error;
  }
}

export async function embedText(text: string): Promise<number[]> {
  const model = 'nomic-embed-text';
  
  try {
    const response = await fetch('http://127.0.0.1:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding || [];
  } catch (error: any) {
    console.error("Failed to generate embeddings from Ollama:", error);
    return [];
  }
}
