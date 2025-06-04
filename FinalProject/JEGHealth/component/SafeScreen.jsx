import React from "react";
import { SafeAreaView, StyleSheet, StatusBar, Platform } from "react-native";

const SafeScreen = ({ children, style }) => {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
        style,
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default SafeScreen;
