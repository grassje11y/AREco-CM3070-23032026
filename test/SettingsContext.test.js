import React from "react";
import { Text, Pressable } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

function Probe() {
  const { theme, setTheme, fontScale, setFontScale } = useSettings();
  return (
    <>
      <Text testID="theme">{theme}</Text>
      <Text testID="scale">{String(fontScale)}</Text>
      <Pressable
        testID="toggle-theme"
        onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Pressable testID="set-large" onPress={() => setFontScale(1.2)} />
    </>
  );
}

describe("SettingsProvider", () => {
  test("useSettings throws without provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useSettings must be used inside SettingsProvider"
    );
    spy.mockRestore();
  });

  test("default theme is dark and font scale is 1", () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    expect(getByTestId("theme").props.children).toBe("dark");
    expect(getByTestId("scale").props.children).toBe("1");
  });

  test("updates theme and font scale", () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>
    );
    fireEvent.press(getByTestId("toggle-theme"));
    expect(getByTestId("theme").props.children).toBe("light");
    fireEvent.press(getByTestId("set-large"));
    expect(getByTestId("scale").props.children).toBe("1.2");
  });
});
