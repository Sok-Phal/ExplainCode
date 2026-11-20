import { escapeHtml } from "../utils.js";

function renderText(markdown) {
  let text = escapeHtml(markdown);
  text = text.replace(/^#{1,6}\s+(.+)$/gm, (line, heading) => {
    const level = Math.min(6, (line.match(/^#+/) || [""])[0].length);
    return `<h${level}>${heading}</h${level}>`;
  });
  text = text.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  text = text.replace(/^([-*+]\s+.+(?:\n[-*+]\s+.+)*)$/gm, (list) => {
    const items = list.split("\n").map((item) => `<li>${item.replace(/^[-*+]\s+/, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });
  text = text.replace(/^(\d+\.\s+.+(?:\n\d+\.\s+.+)*)$/gm, (list) => {
    const items = list.split("\n").map((item) => `<li>${item.replace(/^\d+\.\s+/, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });
  text = text.replace(/^([-*_])\1\1+$/gm, "<hr>");
  text = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return text.split(/\n\s*\n/).map((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|blockquote|hr)/i.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

function createCodeBlock(source) {
  let code = source;
  let language = "text";
  const newline = code.indexOf("\n");
  if (newline !== -1) {
    const hint = code.slice(0, newline).trim();
    if (/^[a-zA-Z0-9_-]+$/.test(hint)) {
      language = hint.toLowerCase();
      code = code.slice(newline + 1);
    }
  }

  const block = document.createElement("div");
  block.className = "code-block";
  const header = document.createElement("div");
  header.className = "code-block-header";
  header.innerHTML = `<span class="code-language">${escapeHtml(language)}</span>
    <button class="copy-btn" type="button" title="Copy to clipboard">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>Copy</span>
    </button>`;
  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.textContent = code;
  pre.appendChild(codeElement);

  const content = document.createElement("div");
  content.className = "code-block-content";
  content.appendChild(pre);
  block.append(header, content);
  return block;
}

export function renderMarkdown(content) {
  const container = document.createElement("div");
  const parts = String(content).split(/(```[\s\S]*?```)/g);

  parts.forEach((part) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      container.appendChild(createCodeBlock(part.slice(3, -3).replace(/^\n|\n$/g, "")));
    } else if (part.trim()) {
      const text = document.createElement("div");
      text.innerHTML = renderText(part);
      container.append(...text.childNodes);
    }
  });

  return container;
}
