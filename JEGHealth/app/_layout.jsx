import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack 
        screenOptions={{
          headerShown: false, // Hide headers by default
        }}
      >
        <Stack.Screen
          name="(tabs)" // This specifically hides the (tabs) folder name from the header
          options={{
            headerShown: false, // Ensure no header for the tabs navigator
            title: '', // Clear the title that would show the folder name
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
