export function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `toast ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  requestAnimationFrame(() => notification.classList.add("visible"));
  setTimeout(() => {
    notification.classList.remove("visible");
    notification.addEventListener("transitionend", () => notification.remove(), { once: true });
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}
