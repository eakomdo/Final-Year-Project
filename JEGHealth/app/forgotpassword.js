import React from 'react';
import { useRouter } from 'expo-router';
import ForgotPasswordScreen from '../src/screens/ForgotPasswordScreen';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const navigationProxy = {
    navigate: (route) => {
      if (route === "SignIn") {
        router.push("/login");
      } else if (route === "SignUp") {
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
  
  return <ForgotPasswordScreen navigation={navigationProxy} />;
}