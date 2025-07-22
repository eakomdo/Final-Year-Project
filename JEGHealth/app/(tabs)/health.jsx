import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import DeviceConnectionManager from "../../src/services/DeviceConnectionManager";
import HealthDataService from "../../src/services/HealthDataService";
import DiseaseDetectionService from "../../src/services/DiseaseDetectionService";
import Constants from "expo-constants";
import SafeScreen from "../../component/SafeScreen";
import { useTheme } from "../../context/ThemeContext";
import { showError, showSuccess, showInfo } from "../../src/utils/NotificationHelper";

const HealthScreen = () => {
  const { theme } = useTheme();

  // State definitions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [healthData, setHealthData] = useState({
    heartRate: { current: null, history: [] },
    spo2: { current: null, history: [] },
    bloodPressure: { current: null, history: [] },
    ecg: { data: [] },
  });
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [scanningDevices, setScanningDevices] = useState(false);

  useEffect(() => {
    // Check if we should enable mock mode based on configuration
    const enableMockDevices = Constants.expoConfig?.extra?.enableMockDevices;

    if (enableMockDevices) {
      DeviceConnectionManager.enableMockMode();
      console.log("Mock device mode enabled for testing");
    }

    loadHealthData();

    // Cleanup function
    return () => {
      try {
        DeviceConnectionManager.cleanUp();
      } catch (err) {
        console.error("Error during cleanup:", err);
      }
    };
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get latest health data readings
      const heartRateData = await HealthDataService.getReadings(
        "heartRate",
        Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      const spo2Data = await HealthDataService.getReadings(
        "spo2",
        Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      const bloodPressureData = await HealthDataService.getReadings(
        "bloodPressure",
        Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      const ecgData = await HealthDataService.getLatestReading("ecg");

      // Update state with readings
      setHealthData({
        heartRate: {
          current:
            heartRateData.length > 0
              ? heartRateData[heartRateData.length - 1]
              : null,
          history: heartRateData,
        },
        spo2: {
          current: spo2Data.length > 0 ? spo2Data[spo2Data.length - 1] : null,
          history: spo2Data,
        },
        bloodPressure: {
          current:
            bloodPressureData.length > 0
              ? bloodPressureData[bloodPressureData.length - 1]
              : null,
          history: bloodPressureData,
        },
        ecg: {
          data: ecgData ? ecgData.readings : [],
        },
      });

      // Assess risk
      if (
        heartRateData.length > 0 ||
        spo2Data.length > 0 ||
        bloodPressureData.length > 0
      ) {
        const assessment = DiseaseDetectionService.assessCardiovascularRisk({
          heartRate: heartRateData,
          spo2: spo2Data,
          bloodPressure: bloodPressureData,
          ecg: ecgData ? [ecgData] : [],
        });
        setRiskAssessment(assessment);
      }
    } catch (error) {
      console.error("Error loading health data", error);
      setError("Failed to load health data. Pull down to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const scanForDevices = () => {
    try {
      setScanningDevices(true);
      setError(null);
      setDevices([]); // Clear previous devices

      const foundDevices = new Set();

      DeviceConnectionManager.startScan((device) => {
        // Only add device if not already found
        if (!foundDevices.has(device.id)) {
          foundDevices.add(device.id);
          setDevices((prevDevices) => [
            ...prevDevices,
            {
              id: device.id,
              name: device.name || "Unknown Device",
              type: DeviceConnectionManager.determineDeviceType(device),
              connected: false,
            },
          ]);
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        DeviceConnectionManager.stopScan();
        setScanningDevices(false);

        // If no devices found after scanning
        if (foundDevices.size === 0) {
          setError(
            "No compatible devices found. Make sure your device is powered on and nearby."
          );
        }
      }, 10000);
    } catch (err) {
      console.error("Error starting device scan:", err);
      setScanningDevices(false);
      setError(
        "Failed to start device scanning. Please check Bluetooth permissions."
      );
    }
  };

  const connectToDevice = async (deviceId) => {
    try {
      // Show connecting state
      setDevices(
        devices.map((d) => (d.id === deviceId ? { ...d, connecting: true } : d))
      );

      const device = await DeviceConnectionManager.connectToDevice(deviceId);

      // Update devices list
      setDevices(
        devices.map((d) =>
          d.id === deviceId ? { ...d, connected: true, connecting: false } : d
        )
      );

      setConnected(true);

      // Use proper UUIDs based on device type (or use mock mode)
      if (device.type === "ecg") {
        // ECG device - use proper UUIDs for your specific hardware
        // In mock mode these values don't matter
        const serviceUUID = DeviceConnectionManager.mockMode
          ? "mock-service"
          : "YOUR_ECG_SERVICE_UUID"; // replace with actual UUID

        const characteristicUUID = DeviceConnectionManager.mockMode
          ? "mock-characteristic"
          : "YOUR_ECG_CHARACTERISTIC_UUID"; // replace with actual UUID

        DeviceConnectionManager.startMonitoring(
          deviceId,
          serviceUUID,
          characteristicUUID,
          processECGReading
        );
      } else if (device.type === "oximeter") {
        // Oximeter device - use proper UUIDs for your specific hardware
        const serviceUUID = DeviceConnectionManager.mockMode
          ? "mock-service"
          : "YOUR_OXIMETER_SERVICE_UUID"; // replace with actual UUID

        const characteristicUUID = DeviceConnectionManager.mockMode
          ? "mock-characteristic"
          : "YOUR_OXIMETER_CHARACTERISTIC_UUID"; // replace with actual UUID

        DeviceConnectionManager.startMonitoring(
          deviceId,
          serviceUUID,
          characteristicUUID,
          processOximeterReading
        );
      }

      // Show successful connection
      showSuccess(
        "Device Connected",
        `Successfully connected to ${device.name}. Data will now be collected automatically.`
      );
    } catch (error) {
      console.error("Failed to connect to device", error);

      // Update devices list to show failed connection
      setDevices(
        devices.map((d) =>
          d.id === deviceId ? { ...d, connecting: false } : d
        )
      );

      // Show error to user
      showError(
        "Connection Failed",
        "Failed to connect to device. Please ensure the device is turned on and within range."
      );
    }
  };

  const processECGReading = async (data) => {
    try {
      // Store ECG reading
      await HealthDataService.storeReading("ecg", data);

      // Update state with latest reading
      setHealthData((prevData) => ({
        ...prevData,
        ecg: {
          data: data.readings,
        },
      }));

      // Refresh risk assessment with new data
      refreshRiskAssessment();
    } catch (err) {
      console.error("Error processing ECG reading:", err);
    }
  };

  const processOximeterReading = async (data) => {
    try {
      // Store heart rate reading
      if ("heartRate" in data) {
        await HealthDataService.storeReading("heartRate", {
          value: data.heartRate,
          timestamp: data.timestamp,
        });

        // Update state with latest heart rate
        setHealthData((prevData) => ({
          ...prevData,
          heartRate: {
            ...prevData.heartRate,
            current: {
              value: data.heartRate,
              timestamp: data.timestamp,
            },
            history: [
              ...prevData.heartRate.history,
              {
                value: data.heartRate,
                timestamp: data.timestamp,
              },
            ].slice(-50), // Keep last 50 readings
          },
        }));
      }

      // Store SpO2 reading
      if ("spo2" in data) {
        await HealthDataService.storeReading("spo2", {
          value: data.spo2,
          timestamp: data.timestamp,
        });

        // Update state with latest SpO2
        setHealthData((prevData) => ({
          ...prevData,
          spo2: {
            ...prevData.spo2,
            current: {
              value: data.spo2,
              timestamp: data.timestamp,
            },
            history: [
              ...prevData.spo2.history,
              {
                value: data.spo2,
                timestamp: data.timestamp,
              },
            ].slice(-50), // Keep last 50 readings
          },
        }));
      }

      // Refresh risk assessment with new data
      refreshRiskAssessment();
    } catch (err) {
      console.error("Error processing oximeter reading:", err);
    }
  };

  // Update risk assessment when new readings come in
  const refreshRiskAssessment = async () => {
    try {
      const assessment = DiseaseDetectionService.assessCardiovascularRisk({
        heartRate: healthData.heartRate.history,
        spo2: healthData.spo2.history,
        bloodPressure: healthData.bloodPressure.history,
        ecg:
          healthData.ecg.data.length > 0
            ? [{ readings: healthData.ecg.data }]
            : [],
      });
      setRiskAssessment(assessment);
    } catch (err) {
      console.error("Error refreshing risk assessment:", err);
    }
  };

  // Render risk level with appropriate color
  const renderRiskLevel = (risk) => {
    let color = "#888";
    if (risk === "low") color = "#4ECDC4";
    else if (risk === "moderate") color = "#FF9800";
    else if (risk === "high") color = "#F44336";

    return (
      <Text style={[styles.riskText, { color }]}>{risk.toUpperCase()}</Text>
    );
  };

  // Apply dynamic styles based on theme
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      borderBottomColor: theme.border,
    },
    title: {
      color: theme.text,
    },
    card: {
      backgroundColor: theme.card,
      shadowColor: theme.text,
    },
    text: {
      color: theme.text,
    },
    subText: {
      color: theme.subText,
    },
    statCard: {
      backgroundColor: theme.card,
    },
    statValue: {
      color: theme.primary,
    },
    statLabel: {
      color: theme.subText,
    },
  };

  return (
    <SafeScreen>
      <View style={[styles.header, dynamicStyles.header]}>
        <Text style={[styles.title, dynamicStyles.title]}>Health Dashboard</Text>
      </View>
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadHealthData} />
        }
      >
        <Text style={styles.sectionTitle}>Your Health Metrics</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading health data...</Text>
          </View>
        ) : (
          <>
            {/* Risk assessment section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Cardiovascular Risk Assessment
              </Text>

              {riskAssessment ? (
                <>
                  <View style={styles.riskContainer}>
                    <Text style={styles.riskLabel}>Overall Risk:</Text>
                    {renderRiskLevel(riskAssessment.overallRisk)}
                  </View>

                  {riskAssessment.possibleDiseases.length > 0 && (
                    <>
                      <Text style={styles.warningTitle}>
                        Potential Concerns:
                      </Text>
                      {riskAssessment.possibleDiseases.map((disease, index) => (
                        <View key={index} style={styles.diseaseItem}>
                          <Ionicons
                            name="alert-circle"
                            size={18}
                            color="#FF9800"
                          />
                          <Text style={styles.diseaseText}>{disease}</Text>
                        </View>
                      ))}
                      <Text style={styles.disclaimer}>
                        This assessment is based on your readings and is not a
                        medical diagnosis. Consult a healthcare professional for
                        proper evaluation.
                      </Text>
                    </>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>
                  Not enough data for risk assessment. Please connect your
                  device to collect readings.
                </Text>
              )}
            </View>

            {/* Heart Rate section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Heart Rate</Text>

              {healthData.heartRate.current ? (
                <>
                  <View style={styles.currentReading}>
                    <Ionicons name="heart" size={32} color="#F44336" />
                    <Text style={styles.readingValue}>
                      {healthData.heartRate.current.value}{" "}
                      <Text style={styles.readingUnit}>bpm</Text>
                    </Text>
                  </View>

                  {healthData.heartRate.history.length > 1 && (
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={{
                          labels: healthData.heartRate.history
                            .slice(-7)
                            .map((r) =>
                              new Date(r.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            ),
                          datasets: [
                            {
                              data: healthData.heartRate.history
                                .slice(-7)
                                .map((r) => r.value),
                            },
                          ],
                        }}
                        width={320}
                        height={180}
                        chartConfig={{
                          backgroundColor: "#f5f5f5",
                          backgroundGradientFrom: "#f5f5f5",
                          backgroundGradientTo: "#f5f5f5",
                          decimalPlaces: 0,
                          color: () => "#4ECDC4",
                          labelColor: () => "#333",
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#4ECDC4",
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>
                  No heart rate data available. Connect your device to start
                  monitoring.
                </Text>
              )}
            </View>

            {/* Blood Oxygen section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blood Oxygen (SpO2)</Text>

              {healthData.spo2.current ? (
                <>
                  <View style={styles.currentReading}>
                    <Ionicons name="water" size={32} color="#2D8B85" />
                    <Text style={styles.readingValue}>
                      {healthData.spo2.current.value}
                      <Text style={styles.readingUnit}>%</Text>
                    </Text>
                  </View>

                  {healthData.spo2.history.length > 1 && (
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={{
                          labels: healthData.spo2.history.slice(-7).map((r) =>
                            new Date(r.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          ),
                          datasets: [
                            {
                              data: healthData.spo2.history
                                .slice(-7)
                                .map((r) => r.value),
                            },
                          ],
                        }}
                        width={320}
                        height={180}
                        chartConfig={{
                          backgroundColor: "#f5f5f5",
                          backgroundGradientFrom: "#f5f5f5",
                          backgroundGradientTo: "#f5f5f5",
                          decimalPlaces: 0,
                          color: () => "#2D8B85",
                          labelColor: () => "#333",
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#2D8B85",
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>
                  No SpO2 data available. Connect your device to start
                  monitoring.
                </Text>
              )}
            </View>

            {/* Connect Device section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>IoT Devices</Text>

              <TouchableOpacity
                style={styles.scanButton}
                onPress={scanForDevices}
                disabled={scanningDevices}
              >
                {scanningDevices ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.scanButtonText}>Scanning...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="bluetooth" size={18} color="#fff" />
                    <Text style={styles.scanButtonText}>Scan for Devices</Text>
                  </View>
                )}
              </TouchableOpacity>

              {devices.length > 0 ? (
                devices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.deviceItem,
                      device.connected && styles.connectedDevice,
                    ]}
                    onPress={() =>
                      !device.connected &&
                      !device.connecting &&
                      connectToDevice(device.id)
                    }
                    disabled={device.connected || device.connecting}
                  >
                    <View style={styles.deviceInfo}>
                      <Ionicons
                        name={
                          device.type === "ecg"
                            ? "pulse"
                            : device.type === "oximeter"
                            ? "water"
                            : device.type === "gps"
                            ? "location"
                            : "bluetooth"
                        }
                        size={24}
                        color={device.connected ? "#4ECDC4" : "#2D8B85"}
                      />
                      <View style={styles.deviceTextContainer}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceType}>
                          {device.type.charAt(0).toUpperCase() +
                            device.type.slice(1)}{" "}
                          Device
                        </Text>
                      </View>
                    </View>
                    {device.connecting ? (
                      <ActivityIndicator size="small" color="#4ECDC4" />
                    ) : device.connected ? (
                      <Text style={styles.connectedText}>Connected</Text>
                    ) : (
                      <Ionicons name="chevron-forward" size={24} color="#888" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDevicesText}>
                  {error
                    ? "Check device status and try again."
                    : 'No devices found. Tap "Scan for Devices" to find your health monitoring devices.'}
                </Text>
              )}
            </View>

            <Text style={styles.footnote}>
              This app can detect potential cardiovascular conditions through
              IoT device readings. Regular monitoring provides better insights
              into your heart health.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
  },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  connectionText: {
    marginLeft: 6,
    color: "#4ECDC4",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#FFF1F0",
    marginHorizontal: 10,
    marginTop: 10,
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#F44336",
    marginLeft: 10,
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
  currentReading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  readingValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#333",
  },
  readingUnit: {
    fontSize: 20,
    fontWeight: "normal",
    color: "#666",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    padding: 20,
  },
  scanButton: {
    backgroundColor: "#4ECDC4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  connectedDevice: {
    backgroundColor: "#f0f8ff",
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceTextContainer: {
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  deviceType: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  connectedText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "500",
  },
  noDevicesText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  riskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  riskText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9800",
    marginBottom: 12,
  },
  diseaseItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  diseaseText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 16,
  },
  footnote: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    margin: 16,
    marginBottom: 30,
    fontStyle: "italic",
  },
});

// Default export
export default HealthScreen;
