import { escapeHtml } from "../utils.js";

function renderConversationItem(conversation, currentId) {
  const title = escapeHtml(conversation.title || "New Chat");
  const id = escapeHtml(conversation.id);
  const date = new Date(conversation.updatedAt || Date.now());
  const updated = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const preview = escapeHtml((conversation.messages?.[0]?.content || "No messages yet").replace(/<[^>]*>?/gm, "").slice(0, 60));
  return `<div class="conversation-item ${conversation.id === currentId ? "active-conversation" : ""}" data-id="${id}" role="button" tabindex="0">
    <div class="conversation-item-header"><span class="conversation-title">${title}</span><span class="conversation-time">${updated}</span></div>
    <p class="conversation-preview">${preview}...</p>
    <div class="conversation-actions">
      <button class="icon-btn archive-btn" type="button" title="${conversation.isArchived ? "Unarchive" : "Archive"}" aria-label="${conversation.isArchived ? "Unarchive" : "Archive"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"></path><path d="M1 3h22v5H1z"></path><path d="M10 12h4"></path></svg></button>
      <button class="icon-btn delete-btn" type="button" title="Delete" aria-label="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
    </div>
  </div>`;
}

export function renderConversationList({ container, conversations, currentId, showArchived, searchTerm }) {
  const query = searchTerm.trim().toLowerCase();
  const filtered = conversations.filter((conversation) => {
    const visible = showArchived || !conversation.isArchived;
    const title = String(conversation.title || "").toLowerCase();
    const content = (conversation.messages || []).map((message) => message.content || "").join(" ").toLowerCase();
    return visible && (!query || title.includes(query) || content.includes(query));
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const active = filtered.filter((conversation) => !conversation.isArchived);
  const archived = filtered.filter((conversation) => conversation.isArchived);
  let html = "";
  if (active.length) {
    html += `<section class="conversation-group"><div class="conversation-group-title">Active</div>${active.map((item) => renderConversationItem(item, currentId)).join("")}</section>`;
  }
  if (showArchived && archived.length) {
    html += `<section class="conversation-group"><div class="conversation-group-title">Archived</div>${archived.map((item) => renderConversationItem(item, currentId)).join("")}</section>`;
  }
  if (!filtered.length) {
    html = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <p>${query ? "No matching conversations" : "No conversations yet"}</p><button id="create-first-convo" class="text-btn" type="button">Start a new chat</button></div>`;
  }
  container.innerHTML = html;
}

export function bindConversationListEvents(container, actions) {
  container.addEventListener("click", (event) => {
    const item = event.target.closest(".conversation-item");
    if (!item) {
      if (event.target.closest("#create-first-convo")) actions.onCreate();
      return;
    }
    const { id } = item.dataset;
    if (event.target.closest(".archive-btn")) actions.onArchive(id);
    else if (event.target.closest(".delete-btn")) actions.onDelete(id);
    else actions.onSelect(id);
  });

  container.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".conversation-item")) {
      event.preventDefault();
      actions.onSelect(event.target.dataset.id);
    }
  });
}
