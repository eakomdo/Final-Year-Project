import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import CryptoService from './CryptoService';

let SecureStore;
try {
  // Only import SecureStore on native platforms
  if (Platform.OS !== 'web') {
    SecureStore = require('expo-secure-store');
  }
} catch (error) {
  console.log('SecureStore not available:', error.message);
}

// Simple UUID generator function (alternative to react-native-uuid)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class DataStorage {
  //Initializes the DataStorage service with secure storage and encryption settings.
  constructor() {
    this.isInitialized = false;
    this.useSecureStore = Platform.OS !== 'web' && SecureStore;
    this.encryptionKey = null;
    this._initialize();
  }

  // Remove any stray 'c' character if it exists

  // Modify _initialize method to handle crypto failures
  async _initialize() {
    try {
      if (this.useSecureStore) {
        // Use SecureStore for native platforms
        console.log('DataStorage initialized with SecureStore');
        let key = await SecureStore.getItemAsync('encryption_key');
        if (!key) {
          try {
            key = CryptoJS.lib.WordArray.random(16).toString();
          } catch (cryptoError) {
            console.log('Crypto random generation failed, using fallback', cryptoError);
            // Use CryptoService fallback
            CryptoService.showSecurityWarning();
            const randomBytes = CryptoService.generateSecureRandom(16);
            key = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
          }
          await SecureStore.setItemAsync('encryption_key', key);
        }
        this.encryptionKey = key;
      } else {
        // Use AsyncStorage for web or fallback
        console.log('DataStorage initialized with AsyncStorage (web/fallback)');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing DataStorage:', error);
      // Fallback to AsyncStorage
      this.useSecureStore = false;
      this.isInitialized = true;
    }
  }

  async getItem(key) {
    if (!this.isInitialized) {
      await this._initialize();
    }

    try {
      if (this.useSecureStore) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  // Sets a key-value pair in secure or async storage, initializing if necessary.
  async setItem(key, value) {
    if (!this.isInitialized) {
      await this._initialize();
    }

    try {
      if (this.useSecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item:', error);
      throw error;
    }
  }

  async removeItem(key) {
    if (!this.isInitialized) {
      await this._initialize();
    }

    try {
      if (this.useSecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  async clear() {
    if (!this.isInitialized) {
      await this._initialize();
    }

    try {
      if (this.useSecureStore) {
        // SecureStore doesn't have a clear method, so we'll need to track keys
        console.warn('SecureStore clear not implemented - remove items individually');
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Store health reading
  async storeReading(type, data) {
    try {
      // Ensure encryption key is available
      if (!this.encryptionKey) await this._initialize();
      
      // Generate ID for the reading (using our custom function instead of uuid package)
      const readingId = generateUUID();
      
      // Add metadata
      const readingWithMetadata = {
        id: readingId,
        type,
        timestamp: data.timestamp || new Date().toISOString(),
        data,
        synced: false
      };
      
      // Encrypt data
      const encryptedData = this._encrypt(JSON.stringify(readingWithMetadata));
      
      // Store in AsyncStorage
      const key = `reading_${type}_${readingId}`;
      await AsyncStorage.setItem(key, encryptedData);
      
      // Update reading index
      await this._updateReadingIndex(type, readingId);
      
      return readingId;
    } catch (error) {
      console.error('Error storing reading:', error);
      throw error;
    }
  }
  
  // Get a specific reading by ID
  async getReading(type, id) {
    try {
      const key = `reading_${type}_${id}`;
      const encryptedData = await AsyncStorage.getItem(key);
      
      if (!encryptedData) return null;
      
      // Decrypt data
      const decryptedData = this._decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error getting reading:', error);
      throw error;
    }
  }
  
  // Get readings of a specific type within a time range
  async getReadings(type, startDate, endDate) {
    try {
      const readingIds = await this._getReadingIdsForType(type);
      const readings = [];
      
      for (const id of readingIds) {
        const reading = await this.getReading(type, id);
        
        if (reading) {
          const timestamp = new Date(reading.timestamp);
          
          if ((!startDate || timestamp >= new Date(startDate)) && 
              (!endDate || timestamp <= new Date(endDate))) {
            readings.push(reading);
          }
        }
      }
      
      // Sort by timestamp
      return readings.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.error('Error getting readings:', error);
      throw error;
    }
  }
  
  // Encrypt data
  _encrypt(data) {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }
  
  // Decrypt data
  _decrypt(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Update reading index
  async _updateReadingIndex(type, id) {
    try {
      const indexKey = `index_${type}`;
      const indexJson = await AsyncStorage.getItem(indexKey) || '[]';
      const index = JSON.parse(indexJson);
      
      index.push(id);
      
      await AsyncStorage.setItem(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating reading index:', error);
    }
  }
  
  // Get reading IDs for a specific type
  async _getReadingIdsForType(type) {
    try {
      const indexKey = `index_${type}`;
      const indexJson = await AsyncStorage.getItem(indexKey) || '[]';
      return JSON.parse(indexJson);
    } catch (error) {
      console.error('Error getting reading IDs:', error);
      return [];
    }
  }
  
  // Clear all data
  async clearAllData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const readingKeys = keys.filter(key => key.startsWith('reading_') || key.startsWith('index_'));
      await AsyncStorage.multiRemove(readingKeys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
  
  // Sync to cloud (placeholder for API integration)
  async syncToCloud() {
    try {
      // Implementation would depend on your backend
      console.log('Syncing to cloud...');
      // Mark readings as synced
      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new DataStorage();