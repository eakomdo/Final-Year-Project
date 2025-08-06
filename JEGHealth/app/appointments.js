import React from 'react';
import { Stack } from 'expo-router';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import { useTheme } from '../context/ThemeContext';

export default function AppointmentsPage() {
  const { theme } = useTheme();
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Appointments',
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <AppointmentsScreen />
    </>
  );
}
