import React, { createContext, useContext, useState, useMemo } from "react";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // "dark" | "light"
  const [fontScale, setFontScale] = useState(1); // 0.9 - 1.3
  const [fontFamily, setFontFamily] = useState("system"); // "system" | "rounded"

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      fontScale,
      setFontScale,
      fontFamily,
      setFontFamily,
    }),
    [theme, fontScale, fontFamily]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
}

