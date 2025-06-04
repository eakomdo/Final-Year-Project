import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../src/screens/LoginScreen';

export default function LoginPage() {
  const router = useRouter();
  
  const navigationProxy = {
    navigate: (route) => {
      if (route === "SignUp") {
        router.push("/signup");
      } else {
        router.push(route);
      }
    },
    replace: (route) => {
      router.replace(route);
    },
    goBack: () => router.back()
  };
  
  return <LoginScreen navigation={navigationProxy} />;
}