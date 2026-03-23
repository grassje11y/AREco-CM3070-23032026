import React, { createContext, useContext, useState, useMemo } from "react";

const SettingsContext = createContext(null);

// holds theme font scale for any screen under this provider
export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // dark or light
  const [fontScale, setFontScale] = useState(1); 

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      fontScale,
      setFontScale,
    }),
    [theme, fontScale]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// read settings from context or throw if the component is not wrapped by the provider
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
}

