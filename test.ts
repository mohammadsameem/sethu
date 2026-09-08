import { generateAnswer } from './src/services/ai.js';
async function test() {
  try {
    const res = await generateAnswer("hello");
    console.log("Success:", res);
  } catch (e: any) {
    console.error("Failed:", e?.message);
  }
}
test();
