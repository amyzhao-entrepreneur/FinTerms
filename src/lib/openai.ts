import OpenAI from "openai";

export function getOpenAIKey(): string {
  const key =
    process.env.ROCKETRIDE_OPENAI_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    "";
  if (!key) {
    throw new Error(
      "Missing OpenAI key. Set ROCKETRIDE_OPENAI_KEY or OPENAI_API_KEY in .env",
    );
  }
  return key;
}

export function getOpenAIClient() {
  return new OpenAI({ apiKey: getOpenAIKey() });
}
