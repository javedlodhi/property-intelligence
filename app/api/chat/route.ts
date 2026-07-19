import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "To activate the data copilot, add OPENAI_API_KEY to the app's server environment." }, { status: 503 });
  const { question, context, history = [], model } = await request.json();
  if (!question || !context) return NextResponse.json({ error: "A question and data context are required." }, { status: 400 });
  const instructions = "You are a precise Dubai real-estate data analyst. Answer only from the supplied transaction snapshot. State when the snapshot cannot answer a question. Use AED formatting, distinguish counts from values, and keep answers concise. Never invent a datapoint.";
  const input = `DATA SNAPSHOT:\n${JSON.stringify(context)}\n\nRECENT CONVERSATION:\n${JSON.stringify(history)}\n\nQUESTION:\n${question}`;
  const selectedModel = model === "gpt-5.5" ? "gpt-5.5" : "gpt-5.4-mini";
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: selectedModel, instructions, input, max_output_tokens: 500 }) });
  if (!response.ok) return NextResponse.json({ error: "The data copilot could not complete that request." }, { status: response.status });
  const result = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const answer = result.output_text || result.output?.flatMap((item) => item.content || []).map((item) => item.text || "").join("\n") || "No answer was returned.";
  return NextResponse.json({ answer });
}
