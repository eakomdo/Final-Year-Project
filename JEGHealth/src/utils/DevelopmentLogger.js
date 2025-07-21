class DevelopmentLogger {
  static logStartupInfo() {
    if (__DEV__) {
      console.log('\n🚀 ===== JEGHealth Development Mode =====');
      console.log('📱 Environment: Expo Go Development');
      console.log('🔧 Expected Limitations:');
      console.log('   • Push notifications: Limited in Expo Go');
      console.log('   • Bluetooth: Mock mode active');
      console.log('   • Real device features: Require development build');
      console.log('✅ All services initialized successfully');
      console.log('=====================================\n');
    }
  }

  static logServiceStatus(serviceName, status, details = '') {
    const emoji = status === 'active' ? '✅' : status === 'mock' ? '🔄' : '⚠️';
    console.log(`${emoji} ${serviceName}: ${details || status}`);
  }
}

export default DevelopmentLogger;
