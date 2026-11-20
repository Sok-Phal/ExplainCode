const WORKER_URL = "https://dawn-disk-92a3.sokphalnian.workers.dev/";
const MODEL = "openai/gpt-oss-120b";

export async function chatWithGroq(messages) {
  let response;
  try {
    response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages }),
    });
  } catch {
    throw new Error("Could not reach the AI service. Check your internet connection and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The AI service returned an invalid response.");
  }

  if (!response.ok) {
    const error = data?.error;
    const message = typeof error === "string" ? error : error?.message;
    throw new Error(message || `The AI service request failed (${response.status}).`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The AI service returned an empty response.");
  }
  return content;
}