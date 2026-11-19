/**
 * Theme preference: "system" (default, follows the browser/OS), "light" or "dark".
 * Stored per browser in localStorage; nothing is sent to the server.
 */
export const THEME_KEY = "fs_theme";
export const themes = ["system", "light", "dark"] as const;
export type Theme = (typeof themes)[number];

const THEME_EVENT = "fs-theme-change";

export function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

/** Put the preference on <html>. "system" removes it so CSS follows the OS. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function saveTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage blocked (private mode): still apply for this page view
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Subscribe to changes from this tab and from other tabs. */
export function subscribeTheme(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) {
      applyTheme(readTheme());
      onChange();
    }
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Runs in <head> before the first paint, so a saved theme never flashes.
 * Keep it tiny and dependency-free.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
