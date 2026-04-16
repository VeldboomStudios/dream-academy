import Anthropic from "@anthropic-ai/sdk";

export function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey });
}

export const MODELS = {
  fast: "claude-haiku-4-5-20251001",
  standard: "claude-sonnet-4-6",
  deep: "claude-opus-4-6",
};
