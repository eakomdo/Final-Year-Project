import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import DevelopmentModeIndicator from '../components/DevelopmentModeIndicator';
import DevelopmentLogger from '../src/utils/DevelopmentLogger';

export default function RootLayout() {
  useEffect(() => {
    DevelopmentLogger.logStartupInfo();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
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
          <DevelopmentModeIndicator />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
