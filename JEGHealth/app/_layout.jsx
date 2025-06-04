import { Stack } from "expo-router";
import SafeScreen from "../component/SafeScreen"; // Changed from @/component/SafeScreen

export default function Layout() {
  return (
    <SafeScreen>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
        <Stack.Screen name="login" options={{ title: "Login" }} />
      </Stack>
    </SafeScreen>
  );
}
