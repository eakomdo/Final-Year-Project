import React from 'react';
import { Stack } from 'expo-router';
import AppointmentsScreen from '../screens/AppointmentsScreen';

export default function AppointmentsPage() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Appointments',
          headerStyle: {
            backgroundColor: '#2D8B85',
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
