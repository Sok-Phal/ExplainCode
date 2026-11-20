import { loadConversations, saveConversations, getCurrentConversationId, setCurrentConversationId } from "../services/conversationStorage.js";
import { renderConversationList } from "../ui/conversationList.js";
import { renderMessages } from "../ui/messages.js";

export function createConversationController(state, elements, notify, editor) {
  const persist = () => {
    if (!saveConversations(state.conversations)) notify("Could not save conversations.", "error");
  };

  const renderList = () => renderConversationList({
    container: elements.conversationList,
    conversations: state.conversations,
    currentId: state.currentConversationId,
    showArchived: state.showArchived,
    searchTerm: elements.searchInput?.value || "",
  });

  const renderCurrentMessages = () => {
    const current = state.conversations.find((item) => item.id === state.currentConversationId);
    if (current) renderMessages(current, elements);
  };

  function create() {
    const now = new Date().toISOString();
    const conversation = {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: "New Chat",
      messages: [],
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };
    state.conversations.unshift(conversation);
    state.currentConversationId = conversation.id;
    setCurrentConversationId(conversation.id);
    persist();
    renderList();
    renderCurrentMessages();
    elements.conversationTitle?.focus();
    return conversation;
  }

  function load(id) {
    const conversation = state.conversations.find((item) => item.id === id);
    if (!conversation) return null;
    state.currentConversationId = id;
    setCurrentConversationId(id);
    renderCurrentMessages();
    renderList();
    editor?.focus();
    return conversation;
  }

  function loadInitial() {
    const savedId = getCurrentConversationId();
    const initial = state.conversations.find((item) => item.id === savedId) ||
      state.conversations.find((item) => !item.isArchived) || state.conversations[0];
    return initial ? load(initial.id) : create();
  }

  function rename(title) {
    const conversation = state.conversations.find((item) => item.id === state.currentConversationId);
    if (!conversation) return;
    const nextTitle = title.trim() || "Untitled";
    elements.conversationTitle.textContent = nextTitle;
    if (conversation.title === nextTitle) return;
    conversation.title = nextTitle;
    conversation.updatedAt = new Date().toISOString();
    persist();
    renderList();
  }

  function addMessage(message) {
    const conversation = state.conversations.find((item) => item.id === state.currentConversationId);
    if (!conversation) throw new Error("No active conversation found.");
    if (!Array.isArray(conversation.messages)) conversation.messages = [];
    const validMessage = {
      role: String(message.role || "user"),
      content: String(message.content || ""),
      timestamp: message.timestamp || new Date().toISOString(),
      ...(message.isError ? { isError: true } : {}),
    };
    conversation.messages.push(validMessage);
    conversation.updatedAt = new Date().toISOString();

    if (conversation.messages.length === 1 && validMessage.content) {
      const title = validMessage.content.replace(/[^\w\s]/gi, "").trim().split("\n")[0].slice(0, 30).trim();
      conversation.title = title || "New Conversation";
    }

    state.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    persist();
    renderCurrentMessages();
    renderList();
  }

  function toggleArchive(id) {
    const conversation = state.conversations.find((item) => item.id === id);
    if (!conversation) return;
    conversation.isArchived = !conversation.isArchived;
    conversation.updatedAt = new Date().toISOString();
    persist();
    renderList();
    notify(`Conversation ${conversation.isArchived ? "archived" : "unarchived"}.`);
  }

  function remove(id) {
    if (!confirm("Are you sure you want to permanently delete this conversation?")) return;
    state.conversations = state.conversations.filter((item) => item.id !== id);
    if (id === state.currentConversationId) {
      const next = state.conversations.find((item) => !item.isArchived) || state.conversations[0];
      if (next) load(next.id);
      else {
        state.currentConversationId = null;
        setCurrentConversationId(null);
        create();
      }
    }
    persist();
    renderList();
  }

  function importConversation(imported) {
    const now = new Date().toISOString();
    const conversation = {
      ...imported,
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: String(imported.title || "Imported conversation"),
      messages: imported.messages.map((message) => ({
        role: String(message.role || "assistant"),
        content: String(message.content || ""),
        timestamp: message.timestamp || now,
        ...(message.isError ? { isError: true } : {}),
      })),
      createdAt: imported.createdAt || now,
      updatedAt: now,
      isArchived: false,
    };
    state.conversations.unshift(conversation);
    persist();
    load(conversation.id);
    notify("Conversation imported successfully!", "success");
  }

  function render() {
    renderList();
    renderCurrentMessages();
  }

  return { addMessage, create, importConversation, load, loadInitial, remove, render, rename, toggleArchive };
}
