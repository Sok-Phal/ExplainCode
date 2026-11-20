import { renderMarkdown } from "./markdown.js";

const ROLE_ICONS = {
  user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  assistant: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
  system: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
};

export function renderWelcomeMessage(container) {
  container.innerHTML = `<div class="welcome-message">
    <svg viewBox="0 0 24 24" width="100" height="100" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    <h1>How can I help you today?</h1>
    <p>Ask me anything or start a new conversation to begin.</p>
  </div>`;
}

export function renderMessages(conversation, elements) {
  elements.conversationTitle.textContent = conversation.title || "New Chat";
  elements.messages.replaceChildren();
  if (!conversation.messages?.length) {
    renderWelcomeMessage(elements.messages);
    return;
  }

  conversation.messages.forEach((message) => {
    if (!message?.content) return;
    const role = ["user", "assistant", "system"].includes(message.role) ? message.role : "assistant";
    const roleText = role === "user" ? "You" : role === "system" ? "System" : "Assistant";
    const messageElement = document.createElement("article");
    messageElement.className = `message ${role}${message.isError ? " error" : ""}`;
    messageElement.dataset.rawContent = String(message.content);

    const header = document.createElement("div");
    header.className = "message-header";
    const time = new Date(message.timestamp || Date.now());
    const timestamp = Number.isNaN(time.getTime()) ? "" : time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    header.innerHTML = `<div class="message-role"><span class="role-icon">${ROLE_ICONS[role]}</span><span class="role-text">${roleText}</span></div>
      <div class="message-actions"><button class="copy-message-btn" type="button" title="Copy message" aria-label="Copy message"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><span class="message-time">${timestamp}</span></div>`;

    const content = document.createElement("div");
    content.className = "message-content";
    content.appendChild(renderMarkdown(message.content));
    messageElement.append(header, content);
    elements.messages.appendChild(messageElement);
  });

  elements.messages.scrollTop = elements.messages.scrollHeight;
}

export function showTypingIndicator(container) {
  hideTypingIndicator(container);
  const indicator = document.createElement("div");
  indicator.id = "typing-indicator";
  indicator.className = "typing-indicator";
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

export function hideTypingIndicator(container) {
  container.querySelector("#typing-indicator")?.remove();
}
