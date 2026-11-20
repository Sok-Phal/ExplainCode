import { showNotification } from "../ui/notifications.js";

export function exportConversation(conversation) {
  if (!conversation) {
    showNotification("No active conversation to export.", "error");
    return;
  }
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `conversation-${conversation.id}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function importConversation(onImport) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const conversation = JSON.parse(String(reader.result));
        if (!conversation || !Array.isArray(conversation.messages)) {
          throw new Error("Invalid conversation format");
        }
        onImport(conversation);
      } catch (error) {
        console.error("Error importing conversation:", error);
        showNotification("Failed to import file. Choose a valid conversation JSON file.", "error");
      }
    });
    reader.addEventListener("error", () => showNotification("Could not read the selected file.", "error"));
    reader.readAsText(file);
  }, { once: true });
  input.click();
}
