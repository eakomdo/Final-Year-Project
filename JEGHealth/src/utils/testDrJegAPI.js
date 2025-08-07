import { drJegAPI } from '../../api/services';

/**
 * Test script for Dr. JEG API integration
 * Run this to verify the API is working correctly
 */

export const testDrJegAPI = async () => {
  console.log('=== TESTING DR. JEG API ===');
  
  try {
    // Test 1: Check service status
    console.log('1. Testing service status...');
    try {
      const statusResponse = await drJegAPI.getStatus();
      console.log('✅ Status API working:', statusResponse.data);
    } catch (statusError) {
      console.log('❌ Status API failed:', statusError.message);
    }
    
    // Test 2: Send a simple message
    console.log('2. Testing message sending...');
    try {
      const messageResponse = await drJegAPI.sendMessage('Hello, this is a test message');
      console.log('✅ Message API working:', {
        status: messageResponse.status,
        data: messageResponse.data
      });
      return messageResponse.data;
    } catch (messageError) {
      console.log('❌ Message API failed:', {
        message: messageError.message,
        status: messageError.response?.status,
        data: messageError.response?.data
      });
      throw messageError;
    }
    
  } catch (error) {
    console.error('❌ Dr. JEG API test failed:', error);
    throw error;
  }
};

export const testBasicAPI = async () => {
  console.log('=== BASIC API TEST ===');
  try {
    const response = await fetch('http://192.168.1.50:8000/api/v1/dr-jeg/status/');
    const data = await response.text();
    console.log('Direct fetch response:', response.status, data);
    return response.status === 200;
  } catch (error) {
    console.error('Basic API test failed:', error);
    return false;
  }
};
