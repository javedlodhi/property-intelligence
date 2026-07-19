import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "To activate the data copilot, add GEMINI_API_KEY to the app's server environment." }, { status: 503 });
  const { question, context, history = [] } = await request.json();
  if (!question || !context) return NextResponse.json({ error: "A question and data context are required." }, { status: 400 });
  const instructions = "You are a precise Dubai real-estate data analyst. Answer only from the supplied transaction snapshot. State when the snapshot cannot answer a question. Use AED formatting, distinguish counts from values, and keep answers concise. Never invent a datapoint.";
  const input = `DATA SNAPSHOT:\n${JSON.stringify(context)}\n\nRECENT CONVERSATION:\n${JSON.stringify(history)}\n\nQUESTION:\n${question}`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent", { method: "POST", headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: "user", parts: [{ text: input }] }], generationConfig: { maxOutputTokens: 500, temperature: 0.2 } }) });
  if (!response.ok) {
    const failed = await response.json().catch(() => null) as { error?: { message?: string; status?: string } } | null;
    const detail = failed?.error?.message || failed?.error?.status || "Gemini did not return a usable response.";
    return NextResponse.json({ error: `Gemini request failed (${response.status}): ${detail}` }, { status: response.status });
  }
  const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const answer = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "No answer was returned.";
  return NextResponse.json({ answer });
}
