import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatISO } from 'date-fns';

class HealthDataService {
  constructor() {
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Create necessary storage structure
    try {
      const structure = await AsyncStorage.getItem('@health_data_structure');
      if (!structure) {
        const initialStructure = {
          ecg: [],
          heartRate: [],
          spo2: [],
          bloodPressure: [],
          movement: [],
          location: [],
          lastUpdated: formatISO(new Date())
        };
        await AsyncStorage.setItem('@health_data_structure', JSON.stringify(initialStructure));
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize health data storage', error);
      throw error;
    }
  }
  
  // Store health reading
  async storeReading(type, reading) {
    await this.initialize();
    
    try {
      // Get current data for the type
      const dataRaw = await AsyncStorage.getItem(`@health_data_${type}`);
      let data = dataRaw ? JSON.parse(dataRaw) : [];
      
      // Add the new reading
      data.push({
        ...reading,
        timestamp: reading.timestamp || formatISO(new Date())
      });
      
      // Store back
      await AsyncStorage.setItem(`@health_data_${type}`, JSON.stringify(data));
      
      // Update last updated timestamp
      await AsyncStorage.setItem(
        '@health_data_structure', 
        JSON.stringify({lastUpdated: formatISO(new Date())})
      );
      
      return true;
    } catch (error) {
      console.error(`Failed to store ${type} reading`, error);
      throw error;
    }
  }
  
  // Get readings for specific type and time range
  async getReadings(type, startTime, endTime) {
    await this.initialize();
    
    try {
      const dataRaw = await AsyncStorage.getItem(`@health_data_${type}`);
      if (!dataRaw) return [];
      
      const data = JSON.parse(dataRaw);
      
      if (!startTime && !endTime) return data;
      
      // Filter by time range if specified
      return data.filter(reading => {
        const timestamp = new Date(reading.timestamp).getTime();
        return (!startTime || timestamp >= startTime) && 
               (!endTime || timestamp <= endTime);
      });
    } catch (error) {
      console.error(`Failed to get ${type} readings`, error);
      throw error;
    }
  }
  
  // Get latest reading of specific type
  async getLatestReading(type) {
    await this.initialize();
    
    try {
      const dataRaw = await AsyncStorage.getItem(`@health_data_${type}`);
      if (!dataRaw) return null;
      
      const data = JSON.parse(dataRaw);
      if (data.length === 0) return null;
      
      return data[data.length - 1];
    } catch (error) {
      console.error(`Failed to get latest ${type} reading`, error);
      throw error;
    }
  }
  
  // Clear all health data (use with caution)
  async clearAllData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const healthKeys = keys.filter(key => key.startsWith('@health_data_'));
      await AsyncStorage.multiRemove(healthKeys);
      
      // Reinitialize storage
      await this.initialize();
    } catch (error) {
      console.error('Failed to clear health data', error);
      throw error;
    }
  }
}

export default new HealthDataService();