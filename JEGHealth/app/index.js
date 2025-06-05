import { Redirect } from "expo-router";

// Redirect to your main tab screen
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
