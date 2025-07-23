import React from 'react';
import { Stack } from 'expo-router';
import MedicationsScreen from '../screens/MedicationsScreen';

export default function MedicationsPage() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Medications',
          headerStyle: {
            backgroundColor: '#2D8B85',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <MedicationsScreen />
    </>
  );
}
