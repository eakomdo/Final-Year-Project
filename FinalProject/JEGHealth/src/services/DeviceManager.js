import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

class DeviceManager {
  constructor() {
    this.bleManager = new BleManager();
    this.devices = {};
    this.listeners = [];
    this.isScanning = false;
  }

  // Start scanning for IoT devices
  startScan() {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scanning error:', error);
        this.isScanning = false;
        return;
      }
      
      // Check for supported devices
      if (this._isSupportedDevice(device)) {
        this.devices[device.id] = device;
        this._notifyListeners('deviceFound', device);
      }
    });
    
    // Stop scanning after 15 seconds
    setTimeout(() => {
      this.stopScan();
    }, 15000);
  }
  
  stopScan() {
    this.bleManager.stopDeviceScan();
    this.isScanning = false;
    this._notifyListeners('scanComplete', Object.values(this.devices));
  }
  
  // Connect to a specific device
  async connectToDevice(deviceId) {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this._notifyListeners('deviceConnected', device);
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      this._notifyListeners('error', { type: 'connection', message: error.message });
      throw error;
    }
  }
  
  // Read data from a specific sensor/device
  async readSensorData(device, serviceUUID, characteristicUUID) {
    try {
      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      
      const data = Buffer.from(characteristic.value, 'base64');
      return this._parseSensorData(device.name, data);
    } catch (error) {
      console.error('Read error:', error);
      this._notifyListeners('error', { type: 'read', message: error.message });
      throw error;
    }
  }
  
  // Subscribe to continuous updates from a sensor
  async monitorSensorData(device, serviceUUID, characteristicUUID) {
    return device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          this._notifyListeners('error', { type: 'monitor', message: error.message });
          return;
        }
        
        const data = Buffer.from(characteristic.value, 'base64');
        const parsedData = this._parseSensorData(device.name, data);
        this._notifyListeners('data', parsedData);
      }
    );
  }
  
  // Parse raw sensor data based on device type
  _parseSensorData(deviceName, data) {
    // Different parsing logic based on device type
    if (deviceName.includes('ECG')) {
      return this._parseECGData(data);
    } else if (deviceName.includes('MAX30102') || deviceName.includes('Pulse')) {
      return this._parsePulseOximeterData(data);
    } else if (deviceName.includes('Accel')) {
      return this._parseAccelerometerData(data);
    } else if (deviceName.includes('GPS')) {
      return this._parseGPSData(data);
    }
    return { raw: data.toString('hex'), timestamp: new Date().toISOString() };
  }
  
  // Device-specific parsing methods
  _parseECGData(data) {
    // Example: Parse ECG data format
    return {
      type: 'ecg',
      timestamp: new Date().toISOString(),
      values: Array.from(new Int16Array(data.buffer)),
      hr: data[data.length - 2] | (data[data.length - 1] << 8)
    };
  }
  
  _parsePulseOximeterData(data) {
    // Example: Parse Pulse Oximeter data
    return {
      type: 'pulseOx',
      timestamp: new Date().toISOString(),
      heartRate: data[0],
      spO2: data[1], 
      perfusionIndex: data[2] / 10
    };
  }
  
  _parseAccelerometerData(data) {
    // Example: Parse accelerometer data
    const view = new DataView(data.buffer);
    return {
      type: 'accelerometer',
      timestamp: new Date().toISOString(),
      x: view.getFloat32(0, true),
      y: view.getFloat32(4, true),
      z: view.getFloat32(8, true)
    };
  }
  
  _parseGPSData(data) {
    // Example: Parse GPS data
    const view = new DataView(data.buffer);
    return {
      type: 'gps',
      timestamp: new Date().toISOString(),
      latitude: view.getFloat64(0, true),
      longitude: view.getFloat64(8, true),
      accuracy: view.getFloat32(16, true)
    };
  }
  
  // Check if device is supported by our app
  _isSupportedDevice(device) {
    const name = device.name || '';
    const supportedDevices = [
      'ECG', 'Pulse', 'MAX30102', 'Accel', 'GPS', 
      'HeartRate', 'BP', 'Blood'
    ];
    
    return supportedDevices.some(type => name.includes(type));
  }
  
  // Add a listener for device events
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  // Notify all listeners of an event
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(event, data);
      }
    });
  }
  
  // Disconnect from a device
  async disconnectDevice(deviceId) {
    try {
      await this.bleManager.cancelDeviceConnection(deviceId);
      this._notifyListeners('deviceDisconnected', deviceId);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
}

export default new DeviceManager();