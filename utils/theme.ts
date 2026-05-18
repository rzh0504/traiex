import type { ThemeMode } from "../types/settings";

export function applyTheme(theme: ThemeMode, lightBgColor: string): void {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");

  if (theme === "light") {
    root.classList.add("theme-light");
    applyLightBgColor(lightBgColor);
    return;
  }

  if (theme === "dark") {
    root.classList.add("theme-dark");
    root.style.removeProperty("--primary-background-color");
    return;
  }

  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    applyLightBgColor(lightBgColor);
  } else {
    root.style.removeProperty("--primary-background-color");
  }
}

export function applyLightBgColor(color: string): void {
  if (color && color.toUpperCase() !== "#DDE2EF") {
    document.documentElement.style.setProperty("--primary-background-color", color);
  } else {
    document.documentElement.style.removeProperty("--primary-background-color");
  }
}
