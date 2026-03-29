import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: "#F2F2F7",
  card: "#FFFFFF",
  cardAlt: "#F9FAFB",
  text: "#111827",
  textLight: "#8A8D9F", // Slightly stronger for light mode
  border: "#E5E7EB",
  white: "#FFFFFF",
  black: "#000000",
  primary: "#6366F1",
  primaryGradient: ["#6366F1", "#4F46E5", "#3B82F6"],
  expense: "#EF4444",
  expenseLight: "rgba(239, 68, 68, 0.1)",
  income: "#10B981",
  shadow: "rgba(0, 0, 0, 0.05)",
};

const darkColors = {
  background: "#05050A",
  card: "#121212",
  cardAlt: "#1E1E1E",
  text: "#FFFFFF",
  textLight: "#8A8D9F",
  border: "#27272A",
  white: "#FFFFFF",
  black: "#000000",
  primary: "#7C3AED",
  primaryGradient: ["#7C3AED", "#4F46E5", "#2563EB"],
  expense: "#FF4D4D",
  expenseLight: "rgba(255, 77, 77, 0.15)",
  income: "#00E5A0",
  shadow: "#000000",
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme').then((savedTheme) => {
      // Defaulting to Light Mode if no theme saved
      if (savedTheme === 'dark') {
         setIsDarkMode(true);
      } else {
         setIsDarkMode(false);
      }
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const COLORS = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
