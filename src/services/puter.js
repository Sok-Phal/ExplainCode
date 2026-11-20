export function waitForPuter(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      if (globalThis.puter?.ai) {
        resolve(globalThis.puter);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("AI service could not be loaded. Check your internet connection and refresh the page."));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

export async function chatWithPuter(messages) {
  const puter = await waitForPuter();
  const response = await puter.ai.chat(messages);
  const content = response?.message?.content;
  if (content == null || content === "") {
    throw new Error("The AI service returned an empty response.");
  }
  return String(content);
}
