import { chatWithGroq } from "../services/groq.js";
import { hideTypingIndicator, showTypingIndicator } from "../ui/messages.js";

export function createChatController(state, elements, conversations, notify) {
  async function sendMessage() {
    const content = state.editor?.getValue().trim();
    if (!content || state.isProcessing) return;

    conversations.addMessage({ role: "user", content, timestamp: new Date().toISOString() });
    state.editor.setValue("");
    state.editor.focus();
    state.isProcessing = true;
    updateSendButton();
    showTypingIndicator(elements.messages);

    try {
      const conversation = state.conversations.find((item) => item.id === state.currentConversationId);
      if (!conversation) throw new Error("Conversation not found.");
      const recentMessages = conversation.messages
        .filter((message) => message && typeof message === "object" && message.role && "content" in message)
        .slice(-10)
        .map(({ role, content: messageContent }) => ({ role, content: messageContent }));
      const response = await chatWithGroq(recentMessages);
      conversations.addMessage({ role: "assistant", content: response, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error sending message:", error);
      const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
      conversations.addMessage({ role: "assistant", content: `Error: ${message}`, timestamp: new Date().toISOString(), isError: true });
      notify(message, "error");
    } finally {
      hideTypingIndicator(elements.messages);
      state.isProcessing = false;
      updateSendButton();
      elements.messages.scrollTop = elements.messages.scrollHeight;
    }
  }

  function updateSendButton() {
    const hasContent = Boolean(state.editor?.getValue().trim());
    elements.sendButton.disabled = !hasContent || state.isProcessing;
  }

  return { sendMessage, updateSendButton };
}
