import React from "react";
import { useRouter } from "expo-router";
import SignUpScreen from "../src/screens/SignUpScreen";

export default function SignUpPage() {
  const router = useRouter();

  // Create a navigation-like object that the SignUpScreen expects
  const navigationProxy = {
    navigate: (route) => {
      if (route === "SignIn") {
        router.push("/login");
      } else if (route === "Login") {
        router.push("/login");
      } else {
        router.push(route);
      }
    },
    replace: (route) => {
      router.replace(route);
    },
    goBack: () => router.back(),
  };

  return <SignUpScreen navigation={navigationProxy} />;
}
