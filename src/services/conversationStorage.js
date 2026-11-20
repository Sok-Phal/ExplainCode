const CONVERSATIONS_KEY = "chat_conversations";
const CURRENT_CONVERSATION_KEY = "current_conversation_id";

export function loadConversations() {
  try {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);
    const conversations = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(conversations)) return [];

    return conversations
      .filter((conversation) => conversation && typeof conversation === "object")
      .map((conversation) => ({
        ...conversation,
        id: String(conversation.id || ""),
        title: String(conversation.title || "New Chat"),
        messages: Array.isArray(conversation.messages) ? conversation.messages : [],
        isArchived: Boolean(conversation.isArchived),
      }))
      .filter((conversation) => conversation.id)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error("Error saving conversations:", error);
    return false;
  }
}

export function getCurrentConversationId() {
  return localStorage.getItem(CURRENT_CONVERSATION_KEY);
}

export function setCurrentConversationId(id) {
  if (id) {
    localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  }
}
