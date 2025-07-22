import React from 'react';
import { useRouter } from 'expo-router';
import AIChatScreen from '../src/screens/AIChatScreen';

export default function AIChatPage() {
  const router = useRouter();
  
  const navigationProxy = {
    navigate: (route) => {
      router.push(route);
    },
    replace: (route) => {
      router.replace(route);
    },
    goBack: () => router.back()
  };
  
  return <AIChatScreen navigation={navigationProxy} />;
}