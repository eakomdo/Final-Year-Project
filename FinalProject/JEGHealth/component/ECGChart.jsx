import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const ECGChart = ({ data }) => {
  // Use placeholder data if no data is provided
  const chartData = data || Array(10).fill(0);

  // Generate x-axis labels based on data length
  const labels = Array(Math.min(5, chartData.length))
    .fill(0)
    .map((_, i) => `${i * Math.floor(chartData.length / 5)}`);

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: chartData,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red line for ECG
              strokeWidth: 2,
            },
          ],
        }}
        width={Dimensions.get("window").width - 64} // account for padding
        height={180}
        chartConfig={{
          backgroundColor: "#f5f5f5",
          backgroundGradientFrom: "#f5f5f5",
          backgroundGradientTo: "#f5f5f5",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "0", // Hide dots
          },
        }}
        bezier // Smooth the line
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default ECGChart;
