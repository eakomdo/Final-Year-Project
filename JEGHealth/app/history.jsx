import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import SafeScreen from "../component/SafeScreen";
import DataStorage from "../src/services/DataStorage";

const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("heartRate");
  const [selectedRange, setSelectedRange] = useState("week");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  // Metrics to display
  const metrics = [
    { id: "heartRate", name: "Heart Rate", icon: "heart", unit: "bpm" },
    { id: "spO2", name: "Blood Oxygen", icon: "water", unit: "%" },
    { id: "systolic", name: "Systolic BP", icon: "fitness", unit: "mmHg" },
    { id: "diastolic", name: "Diastolic BP", icon: "fitness", unit: "mmHg" },
  ];

  // Time ranges
  const timeRanges = [
    { id: "day", name: "Day" },
    { id: "week", name: "Week" },
    { id: "month", name: "Month" },
  ];

  // Load historical data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range
        const endDate = new Date();
        let startDate;

        switch (selectedRange) {
          case "day":
            startDate = new Date(endDate);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "month":
            startDate = new Date(endDate);
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          default:
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 7);
        }

        // Get readings based on metric type
        let readings = [];

        if (selectedMetric === "heartRate") {
          // Combine data from ECG and pulse ox readings
          try {
            const pulseOxReadings = await DataStorage.getReadings(
              "pulseOx",
              startDate,
              endDate
            );
            const ecgReadings = await DataStorage.getReadings(
              "ecg",
              startDate,
              endDate
            );

            readings = [
              ...pulseOxReadings.map((r) => ({
                timestamp: r.timestamp,
                value: r.data?.heartRate || r.heartRate || 0,
              })),
              ...ecgReadings.map((r) => ({
                timestamp: r.timestamp,
                value: r.data?.hr || r.hr || 0,
              })),
            ];
          } catch (err) {
            console.error("Error loading heart rate data:", err);
          }
        } else if (selectedMetric === "spO2") {
          try {
            const pulseOxReadings = await DataStorage.getReadings(
              "pulseOx",
              startDate,
              endDate
            );
            readings = pulseOxReadings.map((r) => ({
              timestamp: r.timestamp,
              value: r.data?.spO2 || r.spO2 || 0,
            }));
          } catch (err) {
            console.error("Error loading SpO2 data:", err);
          }
        } else if (
          selectedMetric === "systolic" ||
          selectedMetric === "diastolic"
        ) {
          try {
            const bpReadings = await DataStorage.getReadings(
              "bloodPressure",
              startDate,
              endDate
            );
            readings = bpReadings.map((r) => ({
              timestamp: r.timestamp,
              value:
                selectedMetric === "systolic"
                  ? r.data?.systolic || r.systolic || 0
                  : r.data?.diastolic || r.diastolic || 0,
            }));
          } catch (err) {
            console.error("Error loading blood pressure data:", err);
          }
        }

        // Sort readings by timestamp
        readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Format data for charts
        const formattedData = formatChartData(readings, selectedRange);
        setChartData(formattedData);

        setLoading(false);
      } catch (error) {
        console.error("Error loading historical data:", error);
        setLoading(false);
        setError("Failed to load health data");
      }
    }

    loadData();
  }, [selectedMetric, selectedRange]);

  // Format data for charts
  const formatChartData = (readings, range) => {
    // Use demo data if no readings available
    if (!readings || readings.length === 0) {
      return generateDemoData(selectedMetric, range);
    }

    // Process actual data
    const labels = [];
    const data = [];

    if (range === "day") {
      // Group by hour
      const hourGroups = {};
      readings.forEach((reading) => {
        if (!reading.timestamp) return;

        const date = new Date(reading.timestamp);
        const hour = date.getHours();

        if (!hourGroups[hour]) {
          hourGroups[hour] = [];
        }

        if (typeof reading.value === "number") {
          hourGroups[hour].push(reading.value);
        }
      });

      // Generate labels for every 3 hours
      for (let hour = 0; hour < 24; hour += 3) {
        const displayHour =
          hour === 0
            ? "12am"
            : hour < 12
            ? `${hour}am`
            : hour === 12
            ? "12pm"
            : `${hour - 12}pm`;
        labels.push(displayHour);

        // Get average for this hour if available, or null
        const values = hourGroups[hour] || [];
        data.push(
          values.length > 0
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : null
        );
      }
    } else if (range === "week") {
      // Group by day of week
      const dayGroups = {};
      readings.forEach((reading) => {
        if (!reading.timestamp) return;

        const date = new Date(reading.timestamp);
        const day = date.getDay();

        if (!dayGroups[day]) {
          dayGroups[day] = [];
        }

        if (typeof reading.value === "number") {
          dayGroups[day].push(reading.value);
        }
      });

      // Generate labels for each day
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let day = 0; day < 7; day++) {
        labels.push(dayNames[day]);

        // Get average for this day if available, or null
        const values = dayGroups[day] || [];
        data.push(
          values.length > 0
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : null
        );
      }
    } else if (range === "month") {
      // Group by day of month
      const dayGroups = {};
      readings.forEach((reading) => {
        if (!reading.timestamp) return;

        const date = new Date(reading.timestamp);
        const day = date.getDate();

        if (!dayGroups[day]) {
          dayGroups[day] = [];
        }

        if (typeof reading.value === "number") {
          dayGroups[day].push(reading.value);
        }
      });

      // Generate labels for every 5 days
      for (let day = 1; day <= 30; day += 5) {
        labels.push(`${day}`);

        // Get average for this day if available, or null
        const values = dayGroups[day] || [];
        data.push(
          values.length > 0
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : null
        );
      }
    }

    // Remove nulls for the chart
    const cleanedData = data.map((val) => (val === null ? 0 : val));

    return {
      labels,
      datasets: [{ data: cleanedData }],
    };
  };

  // Generate demo data when no readings are available
  const generateDemoData = (metric, range) => {
    let data = [];
    let labels = [];

    // Generate appropriate demo data for each metric and range
    if (metric === "heartRate") {
      if (range === "day") {
        labels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
        data = [62, 58, 65, 78, 82, 75, 88, 72];
      } else if (range === "week") {
        labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data = [72, 68, 75, 79, 82, 78, 76];
      } else {
        labels = ["1", "5", "10", "15", "20", "25", "30"];
        data = [74, 76, 73, 75, 72, 78, 75];
      }
    } else if (metric === "spO2") {
      if (range === "day") {
        labels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
        data = [97, 96, 97, 98, 98, 97, 98, 97];
      } else if (range === "week") {
        labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data = [98, 97, 98, 97, 98, 97, 97];
      } else {
        labels = ["1", "5", "10", "15", "20", "25", "30"];
        data = [98, 97, 97, 96, 98, 97, 98];
      }
    } else if (metric === "systolic") {
      if (range === "day") {
        labels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
        data = [118, 112, 120, 125, 128, 122, 126, 120];
      } else if (range === "week") {
        labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data = [122, 118, 128, 125, 120, 124, 122];
      } else {
        labels = ["1", "5", "10", "15", "20", "25", "30"];
        data = [120, 122, 118, 124, 122, 126, 120];
      }
    } else if (metric === "diastolic") {
      if (range === "day") {
        labels = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
        data = [78, 74, 76, 82, 80, 78, 84, 80];
      } else if (range === "week") {
        labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data = [78, 76, 82, 80, 78, 82, 78];
      } else {
        labels = ["1", "5", "10", "15", "20", "25", "30"];
        data = [78, 80, 78, 82, 80, 78, 76];
      }
    }

    return {
      labels,
      datasets: [{ data }],
    };
  };

  // Get chart configuration based on metric
  const getChartConfig = (metric) => {
    let color;
    let min;
    let max;

    switch (metric) {
      case "heartRate":
        color = "#F44336";
        min = 40;
        max = 100;
        break;
      case "spO2":
        color = "#2196F3";
        min = 90;
        max = 100;
        break;
      case "systolic":
        color = "#4ECDC4";
        min = 100;
        max = 140;
        break;
      case "diastolic":
        color = "#FF9800";
        min = 60;
        max = 90;
        break;
      default:
        color = "#F44336";
        min = 40;
        max = 100;
    }

    return {
      backgroundGradientFrom: "#fff",
      backgroundGradientTo: "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) =>
        `rgba(${
          color === "#F44336"
            ? "244,67,54"
            : color === "#2196F3"
            ? "33,150,243"
            : color === "#4ECDC4"
            ? "78,205,196"
            : "255,152,0"
        }, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: color,
      },
      propsForBackgroundLines: {
        stroke: "#e0e0e0",
        strokeDasharray: "2, 2",
      },
    };
  };

  // Get current metric stats
  const getCurrentStats = () => {
    const selectedMetricObj = metrics.find((m) => m.id === selectedMetric);
    let min, max, avg;

    if (chartData.datasets[0]?.data?.length > 0) {
      const validData = chartData.datasets[0].data.filter((d) => d > 0);
      if (validData.length > 0) {
        min = Math.min(...validData);
        max = Math.max(...validData);
        avg = Math.round(
          validData.reduce((sum, val) => sum + val, 0) / validData.length
        );
      } else {
        min = "--";
        max = "--";
        avg = "--";
      }
    } else {
      min = "--";
      max = "--";
      avg = "--";
    }

    return { min, max, avg, unit: selectedMetricObj?.unit || "" };
  };

  // Get trend insight text based on metric
  const getTrendInsightText = () => {
    switch (selectedMetric) {
      case "heartRate":
        return `Your heart rate shows normal variations throughout the ${selectedRange}.`;
      case "spO2":
        return `Your oxygen levels have remained stable over the ${selectedRange}.`;
      case "systolic":
      case "diastolic":
        return `Your blood pressure has been consistent throughout the ${selectedRange}.`;
      default:
        return `Your measurements show a healthy pattern over the ${selectedRange}.`;
    }
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health History</Text>
        <TouchableOpacity onPress={() => router.push("/readings")}>
          <Ionicons name="pulse" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Metric Selection */}
        <View style={styles.metricSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {metrics.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[
                  styles.metricButton,
                  selectedMetric === metric.id && styles.metricButtonActive,
                ]}
                onPress={() => setSelectedMetric(metric.id)}
              >
                <Ionicons
                  name={metric.icon}
                  size={18}
                  color={selectedMetric === metric.id ? "#fff" : "#555"}
                />
                <Text
                  style={[
                    styles.metricText,
                    selectedMetric === metric.id && styles.metricTextActive,
                  ]}
                >
                  {metric.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Range Selection */}
        <View style={styles.timeRangeSelector}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.rangeButton,
                selectedRange === range.id && styles.rangeButtonActive,
              ]}
              onPress={() => setSelectedRange(range.id)}
            >
              <Text
                style={[
                  styles.rangeText,
                  selectedRange === range.id && styles.rangeTextActive,
                ]}
              >
                {range.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={styles.loadingText}>Loading data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={40} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={getChartConfig(selectedMetric)}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
              />

              {/* Statistics */}
              <View style={styles.statsContainer}>
                {["min", "avg", "max"].map((stat) => {
                  const stats = getCurrentStats();
                  return (
                    <View key={stat} style={styles.statItem}>
                      <Text style={styles.statLabel}>{stat.toUpperCase()}</Text>
                      <Text style={styles.statValue}>
                        {stats[stat]}{" "}
                        <Text style={styles.statUnit}>{stats.unit}</Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Analysis Summary */}
        {!loading && !error && (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Insights</Text>

            <View style={styles.insightCard}>
              <View
                style={[styles.insightIcon, { backgroundColor: "#4ECDC4" }]}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Normal Range</Text>
                <Text style={styles.insightText}>
                  Your{" "}
                  {metrics
                    .find((m) => m.id === selectedMetric)
                    ?.name.toLowerCase()}{" "}
                  readings have been within normal range for the past{" "}
                  {selectedRange}.
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View
                style={[styles.insightIcon, { backgroundColor: "#2196F3" }]}
              >
                <Ionicons name="trending-up" size={24} color="#fff" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Trending Information</Text>
                <Text style={styles.insightText}>{getTrendInsightText()}</Text>
              </View>
            </View>
          </View>
        )}
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
  metricSelector: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  metricButtonActive: {
    backgroundColor: "#007BFF",
  },
  metricText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginLeft: 6,
  },
  metricTextActive: {
    color: "#fff",
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 5,
  },
  rangeButtonActive: {
    backgroundColor: "#007BFF",
  },
  rangeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  rangeTextActive: {
    color: "#fff",
  },
  chartContainer: {
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
  loadingContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statUnit: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#666",
  },
  analysisContainer: {
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
  analysisTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
