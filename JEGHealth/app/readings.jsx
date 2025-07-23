import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Fix import paths based on your actual folder structure
import SafeScreen from "../component/SafeScreen";
import DeviceConnectionManager from "../src/services/DeviceConnectionManager";
import DataStorage from "../src/services/DataStorage";
import HealthAnalyzer from "../src/services/HealthAnalyzer";
import { showError, showSuccess, showInfo } from "../src/utils/NotificationHelper";

// Components - make sure these paths match your actual structure
import ECGChart from "../component/ECGChart";
import MeasurementCard from "../component/MeasurementCard";
import DeviceList from "../component/DeviceList";

export default function ReadingsScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [readings, setReadings] = useState({
    heartRate: null,
    spO2: null,
    bloodPressure: null,
    ecg: null,
  });
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Start scanning for devices
  const startScan = useCallback(() => {
    setScanning(true);
    setDevices([]);

    // Add listener for device events
    const removeListener = DeviceConnectionManager.addListener(
      (event, data) => {
        if (event === "deviceFound") {
          setDevices((prev) => {
            if (prev.find((d) => d.id === data.id)) return prev;
            return [...prev, data];
          });
        } else if (event === "scanComplete") {
          setScanning(false);
        }
      }
    );

    // Start scanning
    DeviceConnectionManager.startScan();

    // Cleanup
    return () => {
      removeListener();
      if (scanning) {
        DeviceConnectionManager.stopScan();
      }
    };
  }, []);

  // Connect to a device
  const connectToDevice = useCallback(
    async (device) => {
      try {
        setConnecting(true);
        setSelectedDevice(device);

        await DeviceConnectionManager.connectToDevice(device.id);

        // Start monitoring for data
        if (device.name.includes("ECG")) {
          monitorECGData(device);
        } else if (
          device.name.includes("Pulse") ||
          device.name.includes("MAX30102")
        ) {
          monitorPulseOximeterData(device);
        } else {
          // Generic monitoring approach
          readDeviceData(device);
        }

        setConnecting(false);
      } catch (error) {
        console.error("Error connecting:", error);
        showError("Connection Error", "Failed to connect to device.");
        setConnecting(false);
        setSelectedDevice(null);
      }
    },
    [monitorECGData, monitorPulseOximeterData, readDeviceData]
  );

  // Monitor ECG data
  const monitorECGData = useCallback(async (device) => {
    try {
      // Example service and characteristic UUIDs for ECG
      const serviceUUID = "180D"; // Heart Rate Service
      const characteristicUUID = "2A37"; // Heart Rate Measurement

      await DeviceConnectionManager.monitorSensorData(
        device,
        serviceUUID,
        characteristicUUID
      );

      // Add listener for data
      const removeListener = DeviceConnectionManager.addListener(
        (event, data) => {
          if (event === "data" && data.type === "ecg") {
            setReadings((prev) => ({
              ...prev,
              heartRate: data.hr,
              ecg: data.values,
            }));

            // Store the reading
            DataStorage.storeReading("ecg", data);

            // Analyze the data
            const analysis = HealthAnalyzer.analyzeECG(data);
            if (analysis.requiresAttention) {
              setLatestAnalysis(analysis);
            }
          }
        }
      );

      return removeListener;
    } catch (error) {
      console.error("Error monitoring ECG:", error);
      showError("Monitoring Error", "Failed to monitor ECG data.");
    }
  }, []);

  // Monitor Pulse Oximeter data
  const monitorPulseOximeterData = useCallback(async (device) => {
    try {
      // Example service and characteristic UUIDs for pulse oximeter
      const serviceUUID = "1822"; // Pulse Oximeter Service
      const characteristicUUID = "2A5F"; // Pulse Oximeter Measurement

      await DeviceConnectionManager.monitorSensorData(
        device,
        serviceUUID,
        characteristicUUID
      );

      // Add listener for data
      const removeListener = DeviceConnectionManager.addListener(
        (event, data) => {
          if (event === "data" && data.type === "pulseOx") {
            setReadings((prev) => ({
              ...prev,
              heartRate: data.heartRate,
              spO2: data.spO2,
            }));

            // Store the reading
            DataStorage.storeReading("pulseOx", data);

            // Analyze the data
            const analysis = HealthAnalyzer.analyzeOxygenSaturation(data.spO2);
            if (analysis.requiresAttention) {
              setLatestAnalysis(analysis);
            }
          }
        }
      );

      return removeListener;
    } catch (error) {
      console.error("Error monitoring pulse oximeter:", error);
      showError("Monitoring Error", "Failed to monitor pulse oximeter data.");
    }
  }, []);

  // Generic read device data
  const readDeviceData = useCallback(async (device) => {
    try {
      // This would be customized based on the device
      showSuccess(
        "Device Connected",
        `Connected to ${device.name}. Configure device settings to start readings.`
      );
    } catch (error) {
      console.error("Error reading device data:", error);
    }
  }, []);

  // Disconnect from device
  const disconnectDevice = useCallback(async () => {
    if (selectedDevice) {
      await DeviceConnectionManager.disconnectDevice(selectedDevice.id);
      setSelectedDevice(null);
      setReadings({
        heartRate: null,
        spO2: null,
        bloodPressure: null,
        ecg: null,
      });
    }
  }, [selectedDevice]);

  // Auto-start scanning on mount
  useEffect(() => {
    const cleanup = startScan();
    return cleanup;
  }, [startScan]);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Readings</Text>
        <TouchableOpacity onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Device Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Connection</Text>

          {selectedDevice ? (
            <View style={styles.connectedDevice}>
              <View style={styles.deviceInfo}>
                <Ionicons name="bluetooth" size={20} color="#2D8B85" />
                <Text style={styles.deviceName}>{selectedDevice.name}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Connected</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectDevice}
              >
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.scanButton, scanning && styles.scanningButton]}
                onPress={startScan}
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Scanning...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="search" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Scan for Devices</Text>
                  </>
                )}
              </TouchableOpacity>

              <DeviceList
                devices={devices}
                onSelectDevice={connectToDevice}
                connecting={connecting}
              />
            </>
          )}
        </View>

        {/* Current Readings Section */}
        {selectedDevice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Readings</Text>

            <View style={styles.readingsContainer}>
              {readings.heartRate && (
                <MeasurementCard
                  icon="heart"
                  iconColor="#F44336"
                  title="Heart Rate"
                  value={`${readings.heartRate}`}
                  unit="bpm"
                />
              )}

              {readings.spO2 && (
                <MeasurementCard
                  icon="water"
                  iconColor="#2196F3"
                  title="Blood Oxygen"
                  value={`${readings.spO2}`}
                  unit="%"
                />
              )}

              {readings.bloodPressure && (
                <MeasurementCard
                  icon="fitness"
                  iconColor="#2D8B85"
                  title="Blood Pressure"
                  value={`${readings.bloodPressure.systolic}/${readings.bloodPressure.diastolic}`}
                  unit="mmHg"
                />
              )}
            </View>

            {readings.ecg && (
              <View style={styles.ecgContainer}>
                <Text style={styles.ecgTitle}>ECG Waveform</Text>
                <ECGChart data={readings.ecg.slice(0, 100)} />
              </View>
            )}

            {latestAnalysis &&
              latestAnalysis.issues &&
              latestAnalysis.issues.length > 0 && (
                <View
                  style={[
                    styles.alert,
                    styles[
                      `alert${
                        latestAnalysis.riskLevel.charAt(0).toUpperCase() +
                        latestAnalysis.riskLevel.slice(1)
                      }`
                    ],
                  ]}
                >
                  <Ionicons name="warning" size={24} color="#fff" />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Health Alert</Text>
                    <Text style={styles.alertText}>
                      {latestAnalysis.issues[0].description}
                    </Text>
                  </View>
                </View>
              )}
          </View>
        )}

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/history")}
          >
            <Ionicons name="stats-chart" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/analysis")}
          >
            <Ionicons name="pulse" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Health Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={() =>
              showInfo(
                "Emergency",
                "Emergency services feature coming soon. Please call 911 or your local emergency number."
              )
            }
          >
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Emergency Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  scanningButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  connectedDevice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: "#2D8B85",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  disconnectButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  readingsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  ecgContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  ecgTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  alertNormal: {
    backgroundColor: "#2D8B85",
  },
  alertLow: {
    backgroundColor: "#FFC107",
  },
  alertModerate: {
    backgroundColor: "#FF9800",
  },
  alertHigh: {
    backgroundColor: "#F44336",
  },
  alertCritical: {
    backgroundColor: "#D32F2F",
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  alertText: {
    color: "#fff",
    fontSize: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  emergencyButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
