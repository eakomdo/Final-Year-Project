import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define theme colors
export const lightTheme = {
  background: "#f8f8f8",
  card: "#fff",
  text: "#333",
  subText: "#666",
  border: "#eee",
  divider: "#f0f0f0",
  primary: "#007BFF",
  profileImage: "#e0e0e0",
  switchTrack: { false: "#d1d1d6", true: "#4CD964" },
  iconColor: "#888",
};

export const darkTheme = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#f0f0f0",
  subText: "#a0a0a0",
  border: "#2c2c2c",
  divider: "#2c2c2c",
  primary: "#0A84FF",
  profileImage: "#333333",
  switchTrack: { false: "#3a3a3c", true: "#4CD964" },
  iconColor: "#a0a0a0",
};

// Create context
const ThemeContext = createContext();

// Create provider component
export function ThemeProvider({ children }) {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference when component mounts
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("isDarkMode");
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.log("Error loading theme preference", error);
      }
    };

    loadThemePreference();
  }, []);

  // Get current theme object based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      // Save to storage
      AsyncStorage.setItem("isDarkMode", JSON.stringify(newMode)).catch((err) =>
        console.log("Error saving theme preference", err)
      );
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
