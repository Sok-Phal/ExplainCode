export function applyTheme(theme, editor, elements) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  localStorage.setItem("theme", normalizedTheme);

  if (editor) editor.setOption("theme", normalizedTheme === "dark" ? "dracula" : "default");
  if (elements.sunIcon) elements.sunIcon.style.display = normalizedTheme === "dark" ? "block" : "none";
  if (elements.moonIcon) elements.moonIcon.style.display = normalizedTheme === "dark" ? "none" : "block";
}

export function getPreferredTheme() {
  return localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
