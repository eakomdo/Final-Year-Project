import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DeviceList = ({ devices, onSelectDevice, connecting }) => {
  if (devices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No devices found</Text>
        <Text style={styles.tipText}>
          Make sure your device is turned on and in pairing mode
        </Text>
      </View>
    );
  }

  const renderDevice = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => onSelectDevice(item)}
        disabled={connecting}
      >
        <View style={styles.deviceInfo}>
          <Ionicons name={getDeviceIcon(item.name)} size={20} color="#007BFF" />
          <View style={styles.deviceTextContainer}>
            <Text style={styles.deviceName}>
              {item.name || "Unknown Device"}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </View>
        </View>
        {connecting ? (
          <ActivityIndicator size="small" color="#007BFF" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </TouchableOpacity>
    );
  };

  // Helper function to determine device icon based on device name
  const getDeviceIcon = (name) => {
    const nameLower = (name || "").toLowerCase();
    if (nameLower.includes("ecg")) return "heart";
    if (nameLower.includes("pulse") || nameLower.includes("max30102"))
      return "water";
    if (nameLower.includes("blood")) return "fitness";
    return "bluetooth";
  };

  return (
    <FlatList
      data={devices}
      renderItem={renderDevice}
      keyExtractor={(item) => item.id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceTextContainer: {
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  deviceId: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default DeviceList;
