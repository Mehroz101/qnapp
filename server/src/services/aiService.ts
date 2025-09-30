// src/services/aiService.ts
import { ai } from '../lib/geminiClient';

export interface IQuestion {
  question: string;
  answer: string;
  company: string | null;
  interviewType: 'technical' | 'behavioral' | 'system-design' | 'coding' | 'case-study';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Extracts the first JSON object or array from a text blob.
 * Returns null if none found.
 */
function extractFirstJSON(text: string): string | null {
  // remove markdown code fences first
  const cleaned = text.replace(/```(?:json)?\n?([\s\S]*?)```/g, (_m, g1) => g1).trim();

  // try direct parse first
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // not pure JSON; try to locate first {...} or [...]
  }

  // find first '{' or '[' and match braces
  const startIdx = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
  if (startIdx === -1) return null;

  const openChar = cleaned[startIdx];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  for (let i = startIdx; i < cleaned.length; i++) {
    if (cleaned[i] === openChar) depth++;
    if (cleaned[i] === closeChar) {
      depth--;
      if (depth === 0) {
        const candidate = cleaned.slice(startIdx, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * The main function to call from your server: it asks Gemini to produce a single JSON object.
 */
export async function generateWithAI(prompt: string, userId: string): Promise<IQuestion> {
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'; // choose your model
  const systemInstruction = `
Regenerate the user's interview question in a clean professional way.
Return JSON with this structure:

{
  "question": string,
  "answer": string,  // Markdown format, concise, max 10-12 lines
  "category": string,
  "difficulty": "easy" | "medium" | "hard",
  "interviewType": "technical" | "behavioral" | "system-design" | "coding" | "case-study"
}

Rules:
- Do NOT explain the question again in the answer.
- Keep "answer" short, clear, and to the point (10–12 lines max).
- Use markdown lists, bold, and code blocks where useful. For code blocks use three backticks with the language of your choice in the start of the code block and at the end of the code block.
- Return only valid JSON.`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `${systemInstruction}\nUser prompt:\n${prompt}\n\nRespond with the JSON object now:`,
        },
      ],
    },
  ];

  // Use streaming to be robust to large responses
  const stream = await ai.models.generateContentStream({
    model,
    config: { responseModalities: ['TEXT'] },
    contents,
  });

  let fullText = '';
  for await (const chunk of stream as AsyncIterable<any>) {
    // chunk can have .text or candidates[...] with parts
    if (chunk?.text) {
      fullText += chunk.text;
    } else if (Array.isArray(chunk?.candidates)) {
      const p = chunk.candidates[0]?.content?.parts;
      if (Array.isArray(p)) {
        for (const part of p) {
          if (typeof part.text === 'string') fullText += part.text;
        }
      }
    }
  }

  const jsonStr = extractFirstJSON(fullText);
  if (!jsonStr) {
    throw new Error('AI did not return parseable JSON. Raw response: ' + fullText.slice(0, 1000));
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Failed to JSON.parse model output: ' + String(err));
  }

  // Normalize & validate fields conservatively
  const validInterviewTypes = ['technical', 'behavioral', 'system-design', 'coding', 'case-study'];
  const validDifficulties = ['easy', 'medium', 'hard'];

  const result: IQuestion = {
    question: (parsed.question ?? parsed.q ?? '').trim(),
    answer: (parsed.answer ?? parsed.a ?? '').trim(),
    company: parsed.company ?? null,
    interviewType: validInterviewTypes.includes(parsed.interviewType) ? parsed.interviewType : 'technical',
    category: (parsed.category ?? 'General').trim(),
    difficulty: validDifficulties.includes(parsed.difficulty) ? parsed.difficulty : 'medium',
  };

  // minimal sanity checks
  if (!result.question) {
    result.question = `AI generated question (based on prompt): ${String(prompt).slice(0, 200)}`;
  }
  if (!result.answer) {
    result.answer = 'Answer not provided by AI.';
  }
  return result;
}
