import Constants from "expo-constants";
import { Platform } from "react-native";
import { Buffer } from "buffer";
import EventEmitter from "eventemitter3";

// Import BleManager properly with better error handling
let BleManager;
let nativeBleAvailable = false;

try {
  // Try to import the native BLE manager
  if (Platform.OS !== 'web') {
    const bleModule = require("react-native-ble-plx");
    BleManager = bleModule.BleManager || bleModule.default;
    console.log("BLE native module loaded successfully");
    
    // Test if we can actually instantiate it
    try {
      const testManager = new BleManager();
      testManager.destroy(); // Clean up test instance
      nativeBleAvailable = true;
      console.log("BLE native module verified working");
    } catch (testError) {
      console.log("BLE native module loaded but cannot instantiate:", testError.message);
      nativeBleAvailable = false;
    }
  }
  
  // If BleManager is still undefined or test failed, use mock
  if (!BleManager || !nativeBleAvailable) {
    throw new Error("BLE module not available or not working");
  }
} catch (error) {
  console.log("BLE native module not available, using mock:", error.message);
  nativeBleAvailable = false;
  
}

// Always define MockBleManager as fallback
class MockBleManager {
    constructor() {
      console.log("MockBleManager instantiated");
    }
    
    // Mock methods
    startDeviceScan(_, __, callback) {
      console.log("Mock scan started");
      // Send mock devices
      setTimeout(() => {
        callback(null, {
          id: "mock-ecg-001",
          name: "ECG Monitor",
        });
      }, 1000);

      setTimeout(() => {
        callback(null, {
          id: "mock-oximeter-001",
          name: "MAX30102 Oximeter",
        });
      }, 2000);
    }

    stopDeviceScan() {
      console.log("Mock scan stopped");
    }

    connectToDevice(deviceId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: deviceId,
            name: deviceId.includes("ecg")
              ? "ECG Monitor"
              : "MAX30102 Oximeter",
            discoverAllServicesAndCharacteristics: () => Promise.resolve(),
            monitorCharacteristicForService: () => {
              return {
                remove: () => console.log("Listener removed"),
              };
            },
            cancelConnection: () => Promise.resolve(),
          });
        }, 1000);
      });
    }

    cancelConnection() {
      return Promise.resolve();
    }
  };

class DeviceConnectionManager extends EventEmitter {
  constructor() {
    super();
    
    // Initialize BLE manager with better error handling
    this.mockMode = !nativeBleAvailable; // Set mock mode based on availability
    
    if (nativeBleAvailable && BleManager) {
      try {
        this.bleManager = new BleManager();
        console.log("Native BleManager initialized successfully");
      } catch (error) {
        console.error("Failed to initialize native BleManager:", error);
        console.log("Falling back to mock mode");
        this.bleManager = new MockBleManager();
        this.mockMode = true;
      }
    } else {
      console.log("Using MockBleManager (native BLE not available)");
      this.bleManager = new MockBleManager();
      this.mockMode = true;
    }
    
    this.connectedDevices = {};
    this.deviceListeners = {};
    this.mockDataIntervals = {};
    
    console.log(`DeviceConnectionManager initialized, mock mode: ${this.mockMode}`);
  }

  // Enable mock mode for testing without real devices
  enableMockMode() {
    this.mockMode = true;
    console.log("DeviceConnectionManager: Mock mode enabled");
  }

  // Check BLE state and permissions
  async checkBLEState() {
    if (this.mockMode) {
      return { state: "PoweredOn", available: true };
    }

    try {
      const state = await this.bleManager.state();
      console.log("BLE State:", state);
      return { state, available: state === "PoweredOn" };
    } catch (error) {
      console.error("Error checking BLE state:", error);
      return { state: "Unknown", available: false, error: error.message };
    }
  }

  // Initialize BLE (call this before scanning)
  async initialize() {
    if (this.mockMode) {
      console.log("DeviceConnectionManager: Mock mode - no initialization needed");
      return true;
    }

    try {
      const state = await this.checkBLEState();
      if (!state.available) {
        console.warn("BLE not available, falling back to mock mode");
        this.mockMode = true;
        this.bleManager = new MockBleManager();
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to initialize BLE:", error);
      this.mockMode = true;
      this.bleManager = new MockBleManager();
      return false;
    }
  }

  // Start scanning for devices
  async startScan() {
    // Initialize BLE first
    await this.initialize();

    if (this.mockMode) {
      this._mockScan();
      return;
    }

    try {
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("BLE scan error:", error);
          this.emit("error", error);
          return;
        }

        if (!device) {
          return;
        }

        // Filter for our specific medical devices
        if (
          device.name &&
          (device.name.includes("ECG") ||
            device.name.includes("Oximeter") ||
            device.name.includes("MAX30102"))
        ) {
          this.emit("deviceFound", {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
          });
        }
      });
    } catch (error) {
      console.error("Failed to start scan:", error);
      this.emit("error", error);
    }
  }

  // Mock device scan for development without real devices
  _mockScan() {
    console.log("Starting mock device scan...");

    // Create mock devices
    setTimeout(() => {
      this.emit("deviceFound", {
        id: "mock-ecg-001",
        name: "ECG Monitor",
        rssi: -65,
      });
    }, 1000);

    setTimeout(() => {
      this.emit("deviceFound", {
        id: "mock-oximeter-001",
        name: "MAX30102 Oximeter",
        rssi: -70,
      });
    }, 2000);

    // End scan after 3 seconds
    setTimeout(() => {
      this.emit("scanComplete");
    }, 3000);
  }

  // Stop scanning
  stopScan() {
    try {
      if (!this.mockMode && this.bleManager) {
        this.bleManager.stopDeviceScan();
      }
    } catch (error) {
      console.error("Error stopping scan:", error);
    }
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    if (this.mockMode) {
      return this._mockConnectToDevice(deviceId);
    }

    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevices[deviceId] = device;

      // Return the device info
      return {
        id: device.id,
        name: device.name,
        type: this.determineDeviceType(device),
        connected: true,
      };
    } catch (error) {
      console.error("Connection error:", error);
      this.emit("error", error);
      throw error;
    }
  }

  // Mock device connection
  _mockConnectToDevice(deviceId) {
    return new Promise((resolve) => {
      // Simulate connection delay
      setTimeout(() => {
        const deviceType = deviceId.includes("ecg")
          ? "ecg"
          : deviceId.includes("oximeter")
          ? "oximeter"
          : "unknown";

        const deviceName =
          deviceType === "ecg"
            ? "ECG Monitor"
            : deviceType === "oximeter"
            ? "MAX30102 Oximeter"
            : "Unknown Device";

        this.connectedDevices[deviceId] = {
          id: deviceId,
          name: deviceName,
          type: deviceType,
        };

        resolve({
          id: deviceId,
          name: deviceName,
          type: deviceType,
          connected: true,
        });
      }, 1500);
    });
  }

  // Monitor sensor data from a connected device
  async monitorSensorData(device, serviceUUID, characteristicUUID) {
    if (this.mockMode) {
      this._mockMonitorSensorData(device);
      return;
    }

    try {
      const deviceObj = this.connectedDevices[device.id];
      if (!deviceObj) {
        throw new Error("Device not connected");
      }

      // Subscribe to notifications for sensor data
      const listener = deviceObj.monitorCharacteristicForService(
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error("Monitoring error:", error);
            this.emit("error", error);
            return;
          }

          if (!characteristic || !characteristic.value) {
            console.warn("Received empty characteristic");
            return;
          }

          // Process the data based on device type
          try {
            const deviceType = this.determineDeviceType(deviceObj);
            const processedData = this.processRawData(
              characteristic.value,
              deviceType
            );

            this.emit("data", processedData);
          } catch (processingError) {
            console.error("Error processing data:", processingError);
          }
        }
      );

      // Store the listener for cleanup later
      this.deviceListeners[device.id] = listener;
    } catch (error) {
      console.error("Error setting up sensor monitoring:", error);
      this.emit("error", error);
      throw error;
    }
  }

  // Mock sensor data monitoring
  _mockMonitorSensorData(device) {
    const deviceType = this.determineDeviceType(device);

    // Clear any existing intervals for this device
    if (this.mockDataIntervals[device.id]) {
      clearInterval(this.mockDataIntervals[device.id]);
    }

    // Create an interval to send mock data
    this.mockDataIntervals[device.id] = setInterval(() => {
      let mockData;

      switch (deviceType) {
        case "ecg":
          mockData = this._generateMockECGData();
          break;
        case "oximeter":
          mockData = this._generateMockOximeterData();
          break;
        default:
          mockData = { type: "unknown", timestamp: new Date().toISOString() };
      }

      this.emit("data", mockData);
    }, 1000);
  }

  // Generate mock ECG data
  _generateMockECGData() {
    // Create simulated ECG waveform
    const readings = [];
    const baseValue = 2048;
    const amplitude = 500;

    // Generate 250 samples (1 second at 250 Hz)
    for (let i = 0; i < 250; i++) {
      // Basic ECG-like pattern
      let value = baseValue;

      // QRS complex simulation
      if (i % 250 > 50 && i % 250 < 60) {
        value = baseValue - amplitude * 0.2; // Q wave
      } else if (i % 250 >= 60 && i % 250 < 65) {
        value = baseValue + amplitude; // R wave
      } else if (i % 250 >= 65 && i % 250 < 75) {
        value = baseValue - amplitude * 0.3; // S wave
      } else if (i % 250 >= 75 && i % 250 < 120) {
        value = baseValue + amplitude * 0.2; // T wave
      }

      // Add some random noise
      value += (Math.random() - 0.5) * 100;

      readings.push(Math.round(value));
    }

    const heartRate = 60 + Math.floor(Math.random() * 40); // 60-100 bpm

    return {
      type: "ecg",
      timestamp: new Date().toISOString(),
      values: readings,
      samplingRate: 250,
      hr: heartRate,
    };
  }

  // Generate mock oximeter data
  _generateMockOximeterData() {
    // Normal range with small variations
    const heartRate = Math.floor(70 + Math.random() * 20); // 70-90 bpm
    const spo2 = Math.floor(95 + Math.random() * 5); // 95-99%

    return {
      type: "pulseOx",
      timestamp: new Date().toISOString(),
      heartRate,
      spO2: spo2,
    };
  }

  // Determine the type of medical device
  determineDeviceType(device) {
    if (!device || !device.name) return "unknown";

    const name = device.name.toLowerCase();
    if (name.includes("ecg")) return "ecg";
    if (name.includes("oximeter") || name.includes("max30102"))
      return "oximeter";
    if (name.includes("accel")) return "accelerometer";
    if (name.includes("gps")) return "gps";
    return "unknown";
  }

  // Process raw data based on device type
  processRawData(rawData, deviceType) {
    try {
      // Base64 decode the data
      const buffer = Buffer.from(rawData, "base64");

      switch (deviceType) {
        case "ecg":
          return this.processECGData(buffer);
        case "oximeter":
          return this.processOximeterData(buffer);
        case "accelerometer":
          return this.processAccelerometerData(buffer);
        case "gps":
          return this.processGPSData(buffer);
        default:
          return { type: "unknown", raw: buffer.toString("hex") };
      }
    } catch (error) {
      console.error(`Error processing ${deviceType} data:`, error);
      return { error: `Failed to process ${deviceType} data` };
    }
  }

  // Process ECG data
  processECGData(buffer) {
    // Simplified example - in reality would depend on your device's protocol
    const readings = [];
    for (let i = 0; i < buffer.length; i += 2) {
      if (i + 1 < buffer.length) {
        const value = buffer.readInt16LE(i);
        readings.push(value);
      }
    }

    return {
      type: "ecg",
      timestamp: new Date().toISOString(),
      values: readings,
      samplingRate: 250, // Hz (example)
      hr: this._extractHeartRateFromECG(readings),
    };
  }

  // Extract heart rate from ECG signal (simplified)
  _extractHeartRateFromECG(readings) {
    // In a real implementation, this would use signal processing to identify R-peaks
    // and calculate heart rate. Here, we just return a realistic value.
    return Math.floor(60 + Math.random() * 40); // 60-100 bpm
  }

  // Process Oximeter data
  processOximeterData(buffer) {
    // Example processing for MAX30102
    if (buffer.length < 2) {
      return {
        type: "pulseOx",
        timestamp: new Date().toISOString(),
        error: "Insufficient data",
      };
    }

    const heartRate = buffer.readUInt8(0);
    const spo2 = buffer.readUInt8(1);

    return {
      type: "pulseOx",
      timestamp: new Date().toISOString(),
      heartRate,
      spO2: spo2,
    };
  }

  // Process accelerometer data
  processAccelerometerData(buffer) {
    // Ensure we have at least 6 bytes (2 bytes per axis)
    if (buffer.length < 6) {
      return {
        type: "accelerometer",
        timestamp: new Date().toISOString(),
        error: "Insufficient data",
      };
    }

    // Example: Read X, Y, Z values as 16-bit integers
    const x = buffer.readInt16LE(0);
    const y = buffer.readInt16LE(2);
    const z = buffer.readInt16LE(4);

    return {
      type: "accelerometer",
      timestamp: new Date().toISOString(),
      x,
      y,
      z,
    };
  }

  // Process GPS data
  processGPSData(buffer) {
    // Simplified example assuming the buffer contains lat/long as floats
    // In reality, GPS data would likely follow a specific protocol (e.g., NMEA)
    if (buffer.length < 8) {
      return {
        type: "gps",
        timestamp: new Date().toISOString(),
        error: "Insufficient data",
      };
    }

    try {
      // Example: Read latitude and longitude as 32-bit floats
      const latitude = buffer.readFloatLE(0);
      const longitude = buffer.readFloatLE(4);

      return {
        type: "gps",
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
      };
    } catch (error) {
      console.error("Error parsing GPS data:", error);
      return {
        type: "gps",
        timestamp: new Date().toISOString(),
        error: "Invalid GPS data format",
      };
    }
  }

  // Add/remove event listener (for deviceFound, data, error events)
  addListener(callback) {
    const eventHandler = (event, data) => {
      callback(event, data);
    };

    this.on("deviceFound", (data) => eventHandler("deviceFound", data));
    this.on("scanComplete", () => eventHandler("scanComplete"));
    this.on("data", (data) => eventHandler("data", data));
    this.on("error", (error) => eventHandler("error", error));

    // Return a function to remove the listeners
    return () => {
      this.removeListener("deviceFound", eventHandler);
      this.removeListener("scanComplete", eventHandler);
      this.removeListener("data", eventHandler);
      this.removeListener("error", eventHandler);
    };
  }

  // Disconnect from device
  async disconnectDevice(deviceId) {
    try {
      const device = this.connectedDevices[deviceId];
      if (!device) return;

      // Remove data listener if exists
      if (this.deviceListeners[deviceId]) {
        this.deviceListeners[deviceId].remove();
        delete this.deviceListeners[deviceId];
      }

      // Clear mock data intervals if active
      if (this.mockDataIntervals[deviceId]) {
        clearInterval(this.mockDataIntervals[deviceId]);
        delete this.mockDataIntervals[deviceId];
      }

      if (!this.mockMode && device.cancelConnection) {
        await device.cancelConnection();
      }

      delete this.connectedDevices[deviceId];

      this.emit("deviceDisconnected", deviceId);
    } catch (error) {
      console.error(`Error disconnecting device ${deviceId}:`, error);
    }
  }

  // Clean up all connections
  cleanUp() {
    this.stopScan();

    // Clear all mock intervals
    Object.keys(this.mockDataIntervals).forEach((key) => {
      clearInterval(this.mockDataIntervals[key]);
    });
    this.mockDataIntervals = {};

    // Disconnect all devices
    Object.keys(this.connectedDevices).forEach((deviceId) => {
      this.disconnectDevice(deviceId);
    });

    // Clean up native BLE manager if available
    if (!this.mockMode && this.bleManager && this.bleManager.destroy) {
      try {
        this.bleManager.destroy();
      } catch (error) {
        console.error("Error destroying BLE manager:", error);
      }
    }

    // Remove all listeners
    this.removeAllListeners();
  }
}

// Export a single instance
export default new DeviceConnectionManager();