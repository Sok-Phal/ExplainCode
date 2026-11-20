import { state } from "./state.js";
import { dom } from "./dom.js";
import { debounce, throttle } from "./utils.js";
import { createConversationController } from "./controllers/conversations.js";
import { createChatController } from "./controllers/chat.js";
import { exportConversation, importConversation } from "./controllers/importExport.js";
import { bindConversationListEvents } from "./ui/conversationList.js";
import { showNotification } from "./ui/notifications.js";
import { applyTheme, getPreferredTheme } from "./ui/theme.js";

function initializeEditor(sendMessage) {
  return CodeMirror.fromTextArea(dom.editor, {
    mode: "markdown",
    theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dracula" : "default",
    lineWrapping: true,
    placeholder: "Type your message here...",
    autoCloseBrackets: true,
    matchBrackets: true,
    keyMap: "sublime",
    viewportMargin: Infinity,
    lineNumbers: false,
    foldGutter: false,
    gutters: [],
    extraKeys: {
      Enter: sendMessage,
      "Shift-Enter": "newlineAndIndent",
      "Ctrl-Enter": sendMessage,
      "Cmd-Enter": sendMessage,
    },
  });
}

function bindMessageCopy(notify) {
  dom.messages.addEventListener("click", async (event) => {
    const codeButton = event.target.closest(".copy-btn");
    const messageButton = event.target.closest(".copy-message-btn");
    if (!codeButton && !messageButton) return;

    const message = event.target.closest(".message");
    const value = codeButton
      ? codeButton.closest(".code-block")?.querySelector("code")?.textContent || ""
      : message?.dataset.rawContent || "";
    try {
      await navigator.clipboard.writeText(value);
      const button = codeButton || messageButton;
      button.classList.add("copied");
      if (codeButton) button.querySelector("span").textContent = "Copied!";
      notify(codeButton ? "Code copied!" : "Message copied!");
      setTimeout(() => {
        button.classList.remove("copied");
        if (codeButton) button.querySelector("span").textContent = "Copy";
      }, 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
      notify("Failed to copy content.", "error");
    }
  });
}

function bindEventListeners(conversations, chat) {
  dom.conversationTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      dom.conversationTitle.blur();
    } else if (event.key === "Escape") {
      const current = state.conversations.find((item) => item.id === state.currentConversationId);
      dom.conversationTitle.textContent = current?.title || "New Chat";
      dom.conversationTitle.blur();
    }
  });
  dom.conversationTitle.addEventListener("blur", () => conversations.rename(dom.conversationTitle.textContent));

  dom.editTitleButton?.addEventListener("click", () => {
    dom.conversationTitle.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(dom.conversationTitle);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  });

  dom.sidebarToggle?.addEventListener("click", () => {
    if (window.innerWidth <= 768) dom.appContainer.classList.toggle("sidebar-visible");
    else dom.appContainer.classList.toggle("sidebar-collapsed");
  });

  dom.toggleHistoryButton?.addEventListener("click", () => {
    const collapsed = dom.historySection.classList.toggle("collapsed");
    dom.toggleHistoryButton.classList.toggle("collapsed", collapsed);
    localStorage.setItem("historyCollapsed", String(collapsed));
  });
  dom.newConversationButton?.addEventListener("click", conversations.create);
  dom.sendButton?.addEventListener("click", chat.sendMessage);
  dom.searchInput?.addEventListener("input", debounce(conversations.render, 250));
  dom.toggleArchivedButton?.addEventListener("click", () => {
    state.showArchived = !state.showArchived;
    dom.toggleArchivedButton.dataset.active = String(state.showArchived);
    const label = dom.toggleArchivedButton.querySelector("span");
    if (label) label.textContent = state.showArchived ? "Hide archived" : "Show archived";
    conversations.render();
  });
  dom.exportButton?.addEventListener("click", () => {
    const conversation = state.conversations.find((item) => item.id === state.currentConversationId);
    exportConversation(conversation);
  });
  dom.importButton?.addEventListener("click", () => importConversation(conversations.importConversation));
  dom.themeToggle?.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme");
    applyTheme(theme === "dark" ? "light" : "dark", state.editor, dom);
  });

  bindConversationListEvents(dom.conversationList, {
    onSelect: (id) => {
      conversations.load(id);
      if (window.innerWidth <= 768) dom.appContainer.classList.remove("sidebar-visible");
    },
    onArchive: conversations.toggleArchive,
    onDelete: conversations.remove,
    onCreate: conversations.create,
  });

  state.editor.on("change", throttle(() => {
    const wrapper = state.editor.getWrapperElement();
    const scroller = state.editor.getScrollerElement();
    wrapper.classList.toggle("has-scrollbar", scroller.scrollHeight > wrapper.clientHeight);
    chat.updateSendButton();
  }, 100));

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) dom.appContainer.classList.remove("sidebar-collapsed");
    else dom.appContainer.classList.remove("sidebar-visible");
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 768 &&
      !event.target.closest(".conversation-sidebar") &&
      !event.target.closest("#sidebar-toggle") &&
      dom.appContainer.classList.contains("sidebar-visible")) {
      dom.appContainer.classList.remove("sidebar-visible");
    }
  });

  bindMessageCopy(showNotification);
}

export async function initApp() {
  if (localStorage.getItem("historyCollapsed") === "true") {
    dom.historySection?.classList.add("collapsed");
    dom.toggleHistoryButton?.classList.add("collapsed");
  }

  let chat;
  state.editor = initializeEditor(() => chat.sendMessage());
  const conversations = createConversationController(state, dom, showNotification, state.editor);
  chat = createChatController(state, dom, conversations, showNotification);
  conversations.loadInitial();
  bindEventListeners(conversations, chat);
  applyTheme(getPreferredTheme(), state.editor, dom);
  chat.updateSendButton();
  setTimeout(() => state.editor.focus(), 100);
}
