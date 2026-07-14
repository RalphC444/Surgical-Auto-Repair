// Bridge to the StoreCal booking widget.
//
// embed.js is loaded once in index.html and exposes `window.StoreCalWidget`.
// Calling this opens the StoreCal booking modal (optionally preselected to a
// service). If a click lands before embed.js has finished loading, we retry
// briefly rather than dropping the interaction.
export function openStoreCal(service) {
  let tries = 0;
  const attempt = () => {
    const widget = typeof window !== "undefined" ? window.StoreCalWidget : null;
    if (widget) {
      if (service) widget.book(service);
      else widget.open();
      return;
    }
    if (tries++ < 50) setTimeout(attempt, 100); // wait up to ~5s for embed.js
  };
  attempt();
}
