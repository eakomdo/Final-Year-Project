import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import 'react-native-reanimated';

// This file is not used when expo-router is the main entry point
// The actual app entry point is in app/_layout.jsx
export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}           